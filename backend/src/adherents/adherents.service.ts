import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import type {
  Request,
} from 'express';

import {
  AuditLogsService,
} from '../audit-logs/audit-logs.service';

import type {
  AuthUser,
} from '../auth/types/auth-user.type';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  CreateAdherentDto,
} from './dto/create-adherent.dto';

import {
  type AdherentStatus,
  UpdateAdherentStatusDto,
} from './dto/update-adherent-status.dto';

import {
  UpdateAdherentDto,
} from './dto/update-adherent.dto';

type AdherentRoleCode =
  | 'SUPER_ADMIN'
  | 'FLASCAM_ADMIN'
  | 'ASSOCIATION_ADMIN'
  | 'ADHERENT';

@Injectable()
export class AdherentsService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly auditLogs:
      AuditLogsService,
  ) {}

  async findAll(
    user: AuthUser,
    status?: string,
  ) {
    const associationId =
      this.getScopedAssociationId(
        user,
      );

    const normalizedStatus =
      this.normalizeOptionalStatus(
        status,
      );

    const adherents =
      await this.prisma.adherents.findMany({
        where: {
          deleted_at: null,

          ...(associationId
            ? {
                regional_association_id:
                  associationId,
              }
            : {}),

          ...(normalizedStatus
            ? {
                status:
                  normalizedStatus,
              }
            : {}),
        },

        orderBy: [
          {
            submitted_at:
              'desc',
          },
          {
            created_at:
              'desc',
          },
        ],

        include: {
          regional_associations:
            true,

          users_adherents_user_idTousers: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              phone: true,
              is_active: true,
              last_login_at: true,
              created_at: true,
            },
          },
        },
      });

    return adherents.map(
      (adherent) =>
        this.formatAdherent(
          adherent,
        ),
    );
  }

  async findOne(
    id: string,
    user: AuthUser,
  ) {
    const adherent =
      await this.getAccessibleAdherent(
        id,
        user,
      );

    return this.formatAdherent(
      adherent,
    );
  }

  async create(
    dto: CreateAdherentDto,
    user: AuthUser,
    request: Request,
  ) {
    const isFlascamAdmin =
      this.isFlascamAdmin(
        user,
      );

    const associationId =
      isFlascamAdmin
        ? dto.regionalAssociationId
        : user.regionalAssociationId;

    if (!associationId) {
      throw new BadRequestException(
        isFlascamAdmin
          ? 'L’association de rattachement est obligatoire.'
          : 'Votre compte n’est rattaché à aucune association.',
      );
    }

    await this.ensureAssociationExists(
      associationId,
    );

    const email =
      this.normalizeEmail(
        dto.email,
      );

    await this.ensureEmailAvailable(
      email,
    );

    await this.ensureIdentifierAvailable(
      dto.identifierType,
      dto.identifierValue,
    );

    const role =
      await this.prisma.roles.findUnique({
        where: {
          code: 'ADHERENT',
        },
        select: {
          id: true,
        },
      });

    if (!role) {
      throw new BadRequestException(
        'Le rôle ADHERENT est introuvable. Exécutez le fichier SQL puis prisma db pull et prisma generate.',
      );
    }

    const approveImmediately =
      isFlascamAdmin &&
      dto.approveImmediately ===
        true;

    const initialStatus:
      AdherentStatus =
      approveImmediately
        ? 'APPROVED'
        : 'PENDING';

    const now =
      new Date();

    const passwordHash =
      await bcrypt.hash(
        dto.password,
        12,
      );

    const created =
      await this.prisma.$transaction(
        async (transaction) => {
          const account =
            await transaction.users.create({
              data: {
                role_id:
                  role.id,

                regional_association_id:
                  associationId,

                email,

                password_hash:
                  passwordHash,

                first_name:
                  this.cleanRequiredText(
                    dto.firstName,
                  ),

                last_name:
                  this.cleanRequiredText(
                    dto.lastName,
                  ),

                phone:
                  this.cleanOptionalText(
                    dto.phone,
                  ),

                /*
                 * Tant que l’adhérent n’est pas validé,
                 * son compte ne peut pas se connecter.
                 */
                is_active:
                  initialStatus ===
                  'APPROVED',

                is_email_verified:
                  false,

                password_changed_at:
                  now,
              },
            });

          return transaction.adherents.create({
            data: {
              regional_association_id:
                associationId,

              user_id:
                account.id,

              display_name:
                this.cleanRequiredText(
                  dto.displayName,
                ),

              legal_name:
                this.cleanOptionalText(
                  dto.legalName,
                ),

              identifier_type:
                dto.identifierType ??
                null,

              identifier_value:
                this.cleanOptionalText(
                  dto.identifierValue,
                ),

              address:
                this.cleanOptionalText(
                  dto.address,
                ),

              city:
                this.cleanOptionalText(
                  dto.city,
                ),

              postal_code:
                this.cleanOptionalText(
                  dto.postalCode,
                ),

              notes:
                this.cleanOptionalText(
                  dto.notes,
                ),

              status:
                initialStatus,

              submitted_by_user_id:
                user.id,

              submitted_at:
                now,

              reviewed_by_user_id:
                approveImmediately
                  ? user.id
                  : null,

              reviewed_at:
                approveImmediately
                  ? now
                  : null,

              approved_at:
                approveImmediately
                  ? now
                  : null,
            },

            include: {
              regional_associations:
                true,

              users_adherents_user_idTousers: {
                select: {
                  id: true,
                  email: true,
                  first_name: true,
                  last_name: true,
                  phone: true,
                  is_active: true,
                  last_login_at: true,
                  created_at: true,
                },
              },
            },
          });
        },
      );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        approveImmediately
          ? 'ADHERENT_CREATED_AND_APPROVED'
          : 'ADHERENT_SUBMITTED',

      entityType:
        'ADHERENT',

      entityId:
        created.id,

      description:
        approveImmediately
          ? 'Un adhérent a été créé et activé par FLASCAM.'
          : 'Un adhérent a été soumis à validation.',

      metadata: {
        associationId,
        accountId:
          created.user_id,
        status:
          created.status,
      },

      ipAddress:
        this.getIp(
          request,
        ),

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.formatAdherent(
      created,
    );
  }

  async update(
    id: string,
    dto: UpdateAdherentDto,
    user: AuthUser,
    request: Request,
  ) {
    const adherent =
      await this.getAccessibleAdherent(
        id,
        user,
      );

const isFlascamAdmin =
  this.isFlascamAdmin(
    user,
  );

if (
  !isFlascamAdmin &&
  ![
    'PENDING',
    'REJECTED',
  ].includes(
    adherent.status,
  )
) {
  throw new ForbiddenException(
    'Un adhérent validé ou suspendu ne peut plus être modifié par son association.',
  );
}

const targetAssociationId =
      isFlascamAdmin &&
      dto.regionalAssociationId
        ? dto.regionalAssociationId
        : adherent.regional_association_id;

    if (
      targetAssociationId !==
      adherent.regional_association_id
    ) {
      await this.ensureAssociationExists(
        targetAssociationId,
      );
    }

    const normalizedEmail =
      dto.email
        ? this.normalizeEmail(
            dto.email,
          )
        : undefined;

    if (
      normalizedEmail &&
      normalizedEmail !==
        adherent.users_adherents_user_idTousers.email
    ) {
      await this.ensureEmailAvailable(
        normalizedEmail,
        adherent.user_id,
      );
    }

    const identifierType =
      dto.identifierType ??
      adherent.identifier_type ??
      undefined;

    const identifierValue =
      dto.identifierValue !==
      undefined
        ? this.cleanOptionalText(
            dto.identifierValue,
          )
        : adherent.identifier_value;

    await this.ensureIdentifierAvailable(
      identifierType,
      identifierValue ??
        undefined,
      id,
    );

    const updated =
      await this.prisma.$transaction(
        async (transaction) => {
          await transaction.users.update({
            where: {
              id:
                adherent.user_id,
            },

            data: {
              regional_association_id:
                targetAssociationId,

              ...(normalizedEmail
                ? {
                    email:
                      normalizedEmail,
                  }
                : {}),

              ...(dto.firstName !==
              undefined
                ? {
                    first_name:
                      this.cleanRequiredText(
                        dto.firstName,
                      ),
                  }
                : {}),

              ...(dto.lastName !==
              undefined
                ? {
                    last_name:
                      this.cleanRequiredText(
                        dto.lastName,
                      ),
                  }
                : {}),

              ...(dto.phone !==
              undefined
                ? {
                    phone:
                      this.cleanOptionalText(
                        dto.phone,
                      ),
                  }
                : {}),
            },
          });

          return transaction.adherents.update({
            where: {
              id,
            },

            data: {
              regional_association_id:
                targetAssociationId,

              ...(dto.displayName !==
              undefined
                ? {
                    display_name:
                      this.cleanRequiredText(
                        dto.displayName,
                      ),
                  }
                : {}),

              ...(dto.legalName !==
              undefined
                ? {
                    legal_name:
                      this.cleanOptionalText(
                        dto.legalName,
                      ),
                  }
                : {}),

              ...(dto.identifierType !==
              undefined
                ? {
                    identifier_type:
                      dto.identifierType,
                  }
                : {}),

              ...(dto.identifierValue !==
              undefined
                ? {
                    identifier_value:
                      this.cleanOptionalText(
                        dto.identifierValue,
                      ),
                  }
                : {}),

              ...(dto.address !==
              undefined
                ? {
                    address:
                      this.cleanOptionalText(
                        dto.address,
                      ),
                  }
                : {}),

              ...(dto.city !==
              undefined
                ? {
                    city:
                      this.cleanOptionalText(
                        dto.city,
                      ),
                  }
                : {}),

              ...(dto.postalCode !==
              undefined
                ? {
                    postal_code:
                      this.cleanOptionalText(
                        dto.postalCode,
                      ),
                  }
                : {}),

              ...(dto.notes !==
              undefined
                ? {
                    notes:
                      this.cleanOptionalText(
                        dto.notes,
                      ),
                  }
                : {}),

              updated_at:
                new Date(),
            },

            include: {
              regional_associations:
                true,

              users_adherents_user_idTousers: {
                select: {
                  id: true,
                  email: true,
                  first_name: true,
                  last_name: true,
                  phone: true,
                  is_active: true,
                  last_login_at: true,
                  created_at: true,
                },
              },
            },
          });
        },
      );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'ADHERENT_UPDATED',

      entityType:
        'ADHERENT',

      entityId:
        id,

      description:
        'Les informations d’un adhérent ont été modifiées.',

      metadata: {
        associationId:
          updated.regional_association_id,
      },

      ipAddress:
        this.getIp(
          request,
        ),

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.formatAdherent(
      updated,
    );
  }

async resubmit(
  id: string,
  user: AuthUser,
  request: Request,
) {
  if (
    user.role !==
    'ASSOCIATION_ADMIN'
  ) {
    throw new ForbiddenException(
      'Seule une association peut resoumettre ce dossier.',
    );
  }

  const adherent =
    await this.getAccessibleAdherent(
      id,
      user,
    );

  if (
    adherent.status !==
    'REJECTED'
  ) {
    throw new BadRequestException(
      'Seul un dossier refusé peut être soumis à nouveau.',
    );
  }

  const now =
    new Date();

  const updated =
    await this.prisma.adherents.update({
      where: {
        id,
      },

      data: {
        status:
          'PENDING',

        rejection_reason:
          null,

        reviewed_by_user_id:
          null,

        reviewed_at:
          null,

        submitted_at:
          now,

        updated_at:
          now,
      },

      include: {
        regional_associations:
          true,

        users_adherents_user_idTousers: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            phone: true,
            is_active: true,
            last_login_at: true,
            created_at: true,
          },
        },
      },
    });

  await this.auditLogs.log({
    userId:
      user.id,

    action:
      'ADHERENT_RESUBMITTED',

    entityType:
      'ADHERENT',

    entityId:
      id,

    description:
      'Un dossier adhérent refusé a été soumis à nouveau.',

    metadata: {
      associationId:
        updated.regional_association_id,
    },

    ipAddress:
      this.getIp(
        request,
      ),

    userAgent:
      request.get(
        'user-agent',
      ),
  });

  return this.formatAdherent(
    updated,
  );
}  

async suspendByAssociation(
  id: string,
  reason: string,
  user: AuthUser,
  request: Request,
) {
  if (
    user.role !==
    'ASSOCIATION_ADMIN'
  ) {
    throw new ForbiddenException(
      'Seule une association peut utiliser cette action.',
    );
  }

  const cleanReason =
    this.cleanOptionalText(
      reason,
    );

  if (!cleanReason) {
    throw new BadRequestException(
      'Le motif de la suspension est obligatoire.',
    );
  }

  /*
   * getAccessibleAdherent applique déjà le périmètre :
   * regional_association_id = user.regionalAssociationId.
   *
   * Une association ne peut donc jamais charger ou suspendre
   * l’adhérent d’une autre association.
   */
  const adherent =
    await this.getAccessibleAdherent(
      id,
      user,
    );

  if (
    adherent.status !==
    'APPROVED'
  ) {
    throw new BadRequestException(
      'Seul un adhérent validé et actif peut être suspendu par son association.',
    );
  }

  const now =
    new Date();

  const updated =
    await this.prisma.$transaction(
      async (
        transaction,
      ) => {
        /*
         * Le compte est désactivé immédiatement.
         */
        await transaction.users.update({
          where: {
            id:
              adherent.user_id,
          },

          data: {
            is_active:
              false,
          },
        });

        /*
         * Toutes les sessions existantes sont révoquées.
         */
        await transaction.refresh_tokens.updateMany({
          where: {
            user_id:
              adherent.user_id,

            revoked_at:
              null,
          },

          data: {
            revoked_at:
              now,
          },
        });

        return transaction.adherents.update({
          where: {
            id,
          },

          data: {
            status:
              'SUSPENDED',

            suspended_at:
              now,

            updated_at:
              now,

            /*
             * On ne modifie volontairement pas :
             * - approved_at
             * - reviewed_at
             * - reviewed_by_user_id
             *
             * Ces champs conservent la validation FLASCAM initiale.
             */
          },

          include: {
            regional_associations:
              true,

            users_adherents_user_idTousers: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                phone: true,
                is_active: true,
                last_login_at: true,
                created_at: true,
              },
            },
          },
        });
      },
    );

  await this.auditLogs.log({
    userId:
      user.id,

    action:
      'ADHERENT_SUSPENDED_BY_ASSOCIATION',

    entityType:
      'ADHERENT',

    entityId:
      id,

    description:
      'Un adhérent a été suspendu par son association.',

    metadata: {
      associationId:
        updated.regional_association_id,

      adherentUserId:
        updated.user_id,

      reason:
        cleanReason,
    },

    ipAddress:
      this.getIp(
        request,
      ),

    userAgent:
      request.get(
        'user-agent',
      ),
  });

  return this.formatAdherent(
    updated,
  );
}

  async updateStatus(
    id: string,
    dto: UpdateAdherentStatusDto,
    user: AuthUser,
    request: Request,
  ) {
    if (
      !this.isFlascamAdmin(
        user,
      )
    ) {
      throw new ForbiddenException(
        'Seule FLASCAM peut valider, refuser, suspendre ou réactiver un adhérent.',
      );
    }

    const adherent =
      await this.prisma.adherents.findFirst({
        where: {
          id,
          deleted_at: null,
        },

        include: {
          regional_associations:
            true,

          users_adherents_user_idTousers: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              phone: true,
              is_active: true,
              last_login_at: true,
              created_at: true,
            },
          },
        },
      });

    if (!adherent) {
      throw new NotFoundException(
        'Adhérent introuvable.',
      );
    }

    this.assertStatusTransition(
      adherent.status as
        AdherentStatus,
      dto.status,
    );

    if (
      dto.status ===
        'REJECTED' &&
      !this.cleanOptionalText(
        dto.reason,
      )
    ) {
      throw new BadRequestException(
        'Le motif du refus est obligatoire.',
      );
    }

    const now =
      new Date();

    const accountIsActive =
      dto.status ===
      'APPROVED';

    const updated =
      await this.prisma.$transaction(
        async (transaction) => {
          await transaction.users.update({
            where: {
              id:
                adherent.user_id,
            },

            data: {
              is_active:
                accountIsActive,
            },
          });

          if (!accountIsActive) {
            await transaction.refresh_tokens.updateMany({
              where: {
                user_id:
                  adherent.user_id,

                revoked_at:
                  null,
              },

              data: {
                revoked_at:
                  now,
              },
            });
          }

          return transaction.adherents.update({
            where: {
              id,
            },

            data: {
              status:
                dto.status,

              rejection_reason:
                dto.status ===
                'REJECTED'
                  ? this.cleanOptionalText(
                      dto.reason,
                    )
                  : null,

              reviewed_by_user_id:
                dto.status ===
                'PENDING'
                  ? null
                  : user.id,

              reviewed_at:
                dto.status ===
                'PENDING'
                  ? null
                  : now,

approved_at:
  dto.status ===
  'APPROVED'
    ? adherent.approved_at ??
      now
    : adherent.approved_at,

              suspended_at:
                dto.status ===
                'SUSPENDED'
                  ? now
                  : null,

              submitted_at:
                dto.status ===
                'PENDING'
                  ? now
                  : adherent.submitted_at,

              updated_at:
                now,
            },

            include: {
              regional_associations:
                true,

              users_adherents_user_idTousers: {
                select: {
                  id: true,
                  email: true,
                  first_name: true,
                  last_name: true,
                  phone: true,
                  is_active: true,
                  last_login_at: true,
                  created_at: true,
                },
              },
            },
          });
        },
      );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        `ADHERENT_STATUS_${dto.status}`,

      entityType:
        'ADHERENT',

      entityId:
        id,

      description:
        `Le statut de l’adhérent est passé de ${adherent.status} à ${dto.status}.`,

      metadata: {
        previousStatus:
          adherent.status,

        nextStatus:
          dto.status,

        reason:
          this.cleanOptionalText(
            dto.reason,
          ),
      },

      ipAddress:
        this.getIp(
          request,
        ),

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.formatAdherent(
      updated,
    );
  }

  private async getAccessibleAdherent(
    id: string,
    user: AuthUser,
  ) {
    const associationId =
      this.getScopedAssociationId(
        user,
      );

    const adherent =
      await this.prisma.adherents.findFirst({
        where: {
          id,
          deleted_at: null,

          ...(associationId
            ? {
                regional_association_id:
                  associationId,
              }
            : {}),
        },

        include: {
          regional_associations:
            true,

          users_adherents_user_idTousers: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              phone: true,
              is_active: true,
              last_login_at: true,
              created_at: true,
            },
          },
        },
      });

    if (!adherent) {
      throw new NotFoundException(
        'Adhérent introuvable.',
      );
    }

    return adherent;
  }

  private getScopedAssociationId(
    user: AuthUser,
  ) {
    if (
      this.isFlascamAdmin(
        user,
      )
    ) {
      return null;
    }

    if (
      user.role ===
      'ASSOCIATION_ADMIN'
    ) {
      if (
        !user.regionalAssociationId
      ) {
        throw new ForbiddenException(
          'Votre compte n’est rattaché à aucune association.',
        );
      }

      return user.regionalAssociationId;
    }

    throw new ForbiddenException(
      'Vous ne pouvez pas accéder à la gestion des adhérents.',
    );
  }

  private isFlascamAdmin(
    user: AuthUser,
  ) {
    const role =
      user.role as
        AdherentRoleCode;

    return (
      role ===
        'SUPER_ADMIN' ||
      role ===
        'FLASCAM_ADMIN'
    );
  }

  private async ensureAssociationExists(
    associationId: string,
  ) {
    const association =
      await this.prisma.regional_associations.findFirst({
        where: {
          id:
            associationId,
          deleted_at:
            null,
        },

        select: {
          id: true,
        },
      });

    if (!association) {
      throw new NotFoundException(
        'Association introuvable.',
      );
    }
  }

  private async ensureEmailAvailable(
    email: string,
    ignoredUserId?: string,
  ) {
    const existingUser =
      await this.prisma.users.findFirst({
        where: {
          email,

          ...(ignoredUserId
            ? {
                id: {
                  not:
                    ignoredUserId,
                },
              }
            : {}),
        },

        select: {
          id: true,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Cette adresse e-mail est déjà utilisée.',
      );
    }
  }

  private async ensureIdentifierAvailable(
    type?: string,
    value?: string,
    ignoredAdherentId?: string,
  ) {
    const cleanType =
      this.cleanOptionalText(
        type,
      );

    const cleanValue =
      this.cleanOptionalText(
        value,
      );

    if (
      !cleanType ||
      !cleanValue
    ) {
      return;
    }

    const existing =
      await this.prisma.adherents.findFirst({
        where: {
          identifier_type:
            cleanType,

          identifier_value:
            cleanValue,

          deleted_at:
            null,

          ...(ignoredAdherentId
            ? {
                id: {
                  not:
                    ignoredAdherentId,
                },
              }
            : {}),
        },

        select: {
          id: true,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Un adhérent utilise déjà cet identifiant.',
      );
    }
  }

  private assertStatusTransition(
    current:
      AdherentStatus,

    next:
      AdherentStatus,
  ) {
    const allowedTransitions:
      Record<
        AdherentStatus,
        AdherentStatus[]
      > = {
        PENDING: [
          'APPROVED',
          'REJECTED',
        ],

        APPROVED: [
          'SUSPENDED',
        ],

        REJECTED: [
          'PENDING',
        ],

        SUSPENDED: [
          'APPROVED',
        ],
      };

    if (
      !allowedTransitions[
        current
      ].includes(next)
    ) {
      throw new BadRequestException(
        `Le passage du statut ${current} vers ${next} n’est pas autorisé.`,
      );
    }
  }

  private normalizeOptionalStatus(
    status?: string,
  ): AdherentStatus | undefined {
    if (!status) {
      return undefined;
    }

    const normalized =
      status
        .trim()
        .toUpperCase();

    const allowed:
      AdherentStatus[] = [
        'PENDING',
        'APPROVED',
        'REJECTED',
        'SUSPENDED',
      ];

    if (
      !allowed.includes(
        normalized as
          AdherentStatus,
      )
    ) {
      throw new BadRequestException(
        'Statut d’adhérent invalide.',
      );
    }

    return normalized as
      AdherentStatus;
  }

  private normalizeEmail(
    email: string,
  ) {
    return email
      .trim()
      .toLowerCase();
  }

  private cleanRequiredText(
    value: string,
  ) {
    const cleaned =
      value.trim();

    if (!cleaned) {
      throw new BadRequestException(
        'Un champ obligatoire est vide.',
      );
    }

    return cleaned;
  }

  private cleanOptionalText(
    value?: string | null,
  ) {
    if (
      value === undefined ||
      value === null
    ) {
      return null;
    }

    const cleaned =
      value.trim();

    return cleaned ||
      null;
  }

  private getIp(
    request: Request,
  ) {
    return (
      request.ip ||
      request.socket
        .remoteAddress
    );
  }

  private formatAdherent(
    adherent: any,
  ) {
    const account =
      adherent.users_adherents_user_idTousers;

    return {
      id:
        adherent.id,

      displayName:
        adherent.display_name,

      legalName:
        adherent.legal_name,

      memberNumber:
        adherent.member_number,

      identifierType:
        adherent.identifier_type,

      identifierValue:
        adherent.identifier_value,

      address:
        adherent.address,

      city:
        adherent.city,

      postalCode:
        adherent.postal_code,

      notes:
        adherent.notes,

      status:
        adherent.status,

      rejectionReason:
        adherent.rejection_reason,

      submittedAt:
        adherent.submitted_at,

      reviewedAt:
        adherent.reviewed_at,

      approvedAt:
        adherent.approved_at,

      suspendedAt:
        adherent.suspended_at,

      createdAt:
        adherent.created_at,

      updatedAt:
        adherent.updated_at,

      association: {
        id:
          adherent.regional_associations.id,

        name:
          adherent.regional_associations.name,

        acronym:
          adherent.regional_associations.acronym,

        region:
          adherent.regional_associations.region,
      },

      account: {
        id:
          account.id,

        email:
          account.email,

        firstName:
          account.first_name,

        lastName:
          account.last_name,

        phone:
          account.phone,

        isActive:
          account.is_active,

        lastLoginAt:
          account.last_login_at,

        createdAt:
          account.created_at,
      },
    };
  }
}