import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import * as bcrypt from 'bcrypt';

import {
  randomBytes,
} from 'crypto';

import type {
  Request,
} from 'express';

import {
  Prisma,
} from '../generated/prisma/client';

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
  CreateNonVotingAdherentDto,
} from './dto/create-non-voting-adherent.dto';

import {
  NonVotingAdherentsQueryDto,
} from './dto/non-voting-adherents-query.dto';

import {
  RejectWafacashDto,
} from './dto/reject-wafacash.dto';

import {
  SubmitWafacashReferenceDto,
} from './dto/submit-wafacash-reference.dto';

import {
  SuspendNonVotingAdherentDto,
} from './dto/suspend-non-voting-adherent.dto';

import {
  UpdateNonVotingAdherentDto,
} from './dto/update-non-voting-adherent.dto';

type NonVotingMembershipStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SUSPENDED';

type DepositPaymentMethod =
  | 'CARD'
  | 'WAFACASH';

type DepositStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'PAID'
  | 'REJECTED'
  | 'REFUNDED';

type NonVotingAdherentRecord = {
  id: string;
  user_id: string;
  city: string;
  membership_status: string;
  deposit_payment_method: string;
  deposit_status: string;
  deposit_amount: Prisma.Decimal;
  currency_code: string;
  wafacash_reference: string | null;
  payment_provider: string | null;
  payment_session_id: string | null;
  payment_transaction_id: string | null;
  payment_requested_at: Date | null;
  payment_submitted_at: Date | null;
  payment_confirmed_at: Date | null;
  payment_rejected_at: Date | null;
  payment_refunded_at: Date | null;
  rejection_reason: string | null;
  suspension_reason: string | null;
  created_by_user_id: string;
  reviewed_by_user_id: string | null;
  reviewed_at: Date | null;
  activated_at: Date | null;
  suspended_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

type UserSummary = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class NonVotingAdherentsService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly auditLogs:
      AuditLogsService,

    private readonly config:
      ConfigService,
  ) {}

  /**
   * Liste paginée réservée à FLASCAM.
   */
  async findAll(
    query:
      NonVotingAdherentsQueryDto,
  ) {
    const page =
      Math.max(
        1,
        query.page ?? 1,
      );

    const limit =
      Math.min(
        100,
        Math.max(
          1,
          query.limit ?? 20,
        ),
      );

    const skip =
      (page - 1) *
      limit;

    const search =
      this.cleanOptionalText(
        query.search,
      );

    const status =
      query.status
        ? this.normalizeMembershipStatus(
            query.status,
          )
        : undefined;

    const matchingUserIds =
      search
        ? await this.findMatchingUserIds(
            search,
          )
        : undefined;

    if (
      search &&
      matchingUserIds &&
      matchingUserIds.length === 0
    ) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const where:
      Prisma.non_voting_adherentsWhereInput = {
      deleted_at:
        null,

      ...(status
        ? {
            membership_status:
              status,
          }
        : {}),

      ...(matchingUserIds
        ? {
            OR: [
              {
                user_id: {
                  in:
                    matchingUserIds,
                },
              },
              {
                city: {
                  contains:
                    search!,
                  mode:
                    'insensitive',
                },
              },
              {
                wafacash_reference: {
                  contains:
                    search!,
                  mode:
                    'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [
      adherents,
      total,
    ] =
      await this.prisma.$transaction([
        this.prisma.non_voting_adherents.findMany({
          where,

          orderBy: [
            {
              created_at:
                'desc',
            },
            {
              id:
                'desc',
            },
          ],

          skip,
          take:
            limit,
        }),

        this.prisma.non_voting_adherents.count({
          where,
        }),
      ]);

    const items =
      await this.formatMany(
        adherents as NonVotingAdherentRecord[],
      );

    return {
      items,

      pagination: {
        page,
        limit,
        total,

        totalPages:
          total === 0
            ? 0
            : Math.ceil(
                total /
                  limit,
              ),
      },
    };
  }

  /**
   * Consultation d’un dossier par FLASCAM.
   */
  async findOne(
    id:
      string,
  ) {
    const adherent =
      await this.getById(
        id,
      );

    return this.formatOne(
      adherent,
    );
  }

  /**
   * Consultation de son propre dossier.
   */
  async getMyProfile(
    user:
      AuthUser,
  ) {
    if (
      user.role !==
      'MARKETPLACE_USER'
    ) {
      throw new ForbiddenException(
        'Cette page est réservée aux adhérents non votants.',
      );
    }

    const adherent =
      await this.prisma.non_voting_adherents.findFirst({
        where: {
          user_id:
            user.id,

          deleted_at:
            null,
        },
      });

    if (!adherent) {
      throw new NotFoundException(
        'Votre dossier d’adhérent non votant est introuvable.',
      );
    }

    return this.formatOne(
      adherent as NonVotingAdherentRecord,
    );
  }

  /**
   * Création manuelle par FLASCAM.
   */
  async create(
    dto:
      CreateNonVotingAdherentDto,

    user:
      AuthUser,

    request:
      Request,
  ) {
    this.assertFlascamAdministrator(
      user,
    );

    const email =
      this.normalizeEmail(
        dto.email,
      );

    const firstName =
      this.cleanRequiredText(
        dto.firstName,
        'Le prénom',
      );

    const lastName =
      this.cleanRequiredText(
        dto.lastName,
        'Le nom',
      );

    const phone =
      this.cleanRequiredText(
        dto.phone,
        'Le numéro de téléphone',
      );

    const city =
      this.cleanRequiredText(
        dto.city,
        'La ville',
      );

    const paymentMethod =
      this.normalizePaymentMethod(
        dto.depositPaymentMethod,
      );

    const wafacashReference =
      this.cleanOptionalText(
        dto.wafacashReference,
      );

    this.validateInitialPaymentData(
      paymentMethod,
      wafacashReference,
    );

    await this.ensureEmailAvailable(
      email,
    );

    if (wafacashReference) {
      await this.ensureWafacashReferenceAvailable(
        wafacashReference,
      );
    }

    const role =
      await this.prisma.roles.findUnique({
        where: {
          code:
            'MARKETPLACE_USER',
        },

        select: {
          id:
            true,
        },
      });

    if (!role) {
      throw new BadRequestException(
        'Le rôle MARKETPLACE_USER est introuvable. Exécutez la migration SQL, puis prisma db pull et prisma generate.',
      );
    }

    const depositAmount =
      this.getDepositAmount();

    const temporaryPassword =
      dto.temporaryPassword
        ? this.cleanRequiredText(
            dto.temporaryPassword,
            'Le mot de passe temporaire',
          )
        : this.generateTemporaryPassword();

    const passwordHash =
      await bcrypt.hash(
        temporaryPassword,
        12,
      );

    const now =
      new Date();

    const isWafacash =
      paymentMethod ===
      'WAFACASH';

    let created:
      NonVotingAdherentRecord;

    try {
      created =
        await this.prisma.$transaction(
          async (
            transaction,
          ) => {
            const account =
              await transaction.users.create({
                data: {
                  role_id:
                    role.id,

                  regional_association_id:
                    null,

                  email,

                  password_hash:
                    passwordHash,

                  first_name:
                    firstName,

                  last_name:
                    lastName,

                  phone,

                  /*
                   * Le compte reste accessible afin que
                   * l’utilisateur puisse suivre ou payer
                   * sa caution.
                   *
                   * Les offres restent bloquées par
                   * assertCanSubmitOffer().
                   */
                  is_active:
                    true,

                  is_email_verified:
                    false,

                  password_changed_at:
                    null,
                },
              });

            const adherent =
              await transaction.non_voting_adherents.create({
                data: {
                  user_id:
                    account.id,

                  city,

                  membership_status:
                    isWafacash
                      ? 'PENDING_REVIEW'
                      : 'PENDING_PAYMENT',

                  deposit_payment_method:
                    paymentMethod,

                  deposit_status:
                    isWafacash
                      ? 'SUBMITTED'
                      : 'PENDING',

                  deposit_amount:
                    new Prisma.Decimal(
                      depositAmount,
                    ),

                  currency_code:
                    'MAD',

                  wafacash_reference:
                    wafacashReference,

                  payment_provider:
                    null,

                  payment_session_id:
                    null,

                  payment_transaction_id:
                    null,

                  payment_requested_at:
                    now,

                  payment_submitted_at:
                    isWafacash
                      ? now
                      : null,

                  payment_confirmed_at:
                    null,

                  payment_rejected_at:
                    null,

                  payment_refunded_at:
                    null,

                  rejection_reason:
                    null,

                  suspension_reason:
                    null,

                  created_by_user_id:
                    user.id,

                  reviewed_by_user_id:
                    null,

                  reviewed_at:
                    null,

                  activated_at:
                    null,

                  suspended_at:
                    null,
                },
              });

            return adherent as
              NonVotingAdherentRecord;
          },
        );
    } catch (error) {
      this.handlePrismaConflict(
        error,
      );

      throw error;
    }

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NON_VOTING_ADHERENT_CREATED',

      entityType:
        'NON_VOTING_ADHERENT',

      entityId:
        created.id,

      description:
        'Un compte d’adhérent non votant a été créé.',

      metadata: {
        accountId:
          created.user_id,

        email,

        city,

        paymentMethod,

        membershipStatus:
          created.membership_status,

        depositStatus:
          created.deposit_status,
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

    return {
      adherent:
        await this.formatOne(
          created,
        ),

      /*
       * Le mot de passe en clair n’est renvoyé
       * qu’une seule fois, lors de la création.
       */
      temporaryPassword,

      temporaryPasswordGenerated:
        !dto.temporaryPassword,
    };
  }

  /**
   * Modification des informations principales.
   */
  async update(
    id:
      string,

    dto:
      UpdateNonVotingAdherentDto,

    user:
      AuthUser,

    request:
      Request,
  ) {
    this.assertFlascamAdministrator(
      user,
    );

    const adherent =
      await this.getById(
        id,
      );

    const normalizedEmail =
      dto.email !==
      undefined
        ? this.normalizeEmail(
            dto.email,
          )
        : undefined;

    if (normalizedEmail) {
      await this.ensureEmailAvailable(
        normalizedEmail,
        adherent.user_id,
      );
    }

    const city =
      dto.city !==
      undefined
        ? this.cleanRequiredText(
            dto.city,
            'La ville',
          )
        : undefined;

    try {
      const updated =
        await this.prisma.$transaction(
          async (
            transaction,
          ) => {
            await transaction.users.update({
              where: {
                id:
                  adherent.user_id,
              },

              data: {
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
                          'Le prénom',
                        ),
                    }
                  : {}),

                ...(dto.lastName !==
                undefined
                  ? {
                      last_name:
                        this.cleanRequiredText(
                          dto.lastName,
                          'Le nom',
                        ),
                    }
                  : {}),

                ...(dto.phone !==
                undefined
                  ? {
                      phone:
                        this.cleanRequiredText(
                          dto.phone,
                          'Le numéro de téléphone',
                        ),
                    }
                  : {}),

                updated_at:
                  new Date(),
              },
            });

            return transaction.non_voting_adherents.update({
              where: {
                id,
              },

              data: {
                ...(city
                  ? {
                      city,
                    }
                  : {}),

                updated_at:
                  new Date(),
              },
            });
          },
        );

      await this.auditLogs.log({
        userId:
          user.id,

        action:
          'NON_VOTING_ADHERENT_UPDATED',

        entityType:
          'NON_VOTING_ADHERENT',

        entityId:
          id,

        description:
          'Les informations d’un adhérent non votant ont été modifiées.',

        metadata: {
          accountId:
            adherent.user_id,
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

      return this.formatOne(
        updated as NonVotingAdherentRecord,
      );
    } catch (error) {
      this.handlePrismaConflict(
        error,
      );

      throw error;
    }
  }

  /**
   * Dépôt ou remplacement d’une référence Wafacash
   * par l’adhérent connecté.
   */
  async submitWafacashReference(
    dto:
      SubmitWafacashReferenceDto,

    user:
      AuthUser,

    request:
      Request,
  ) {
    if (
      user.role !==
      'MARKETPLACE_USER'
    ) {
      throw new ForbiddenException(
        'Cette action est réservée aux adhérents non votants.',
      );
    }

    const adherent =
      await this.getByUserId(
        user.id,
      );

    if (
      adherent.deposit_payment_method !==
      'WAFACASH'
    ) {
      throw new BadRequestException(
        'Votre dossier a été configuré pour un paiement par carte bancaire.',
      );
    }

    if (
      adherent.membership_status ===
      'ACTIVE'
    ) {
      throw new BadRequestException(
        'Votre caution est déjà validée.',
      );
    }

    if (
      adherent.membership_status ===
      'SUSPENDED'
    ) {
      throw new ForbiddenException(
        'Votre compte est suspendu. La référence Wafacash ne peut pas être modifiée.',
      );
    }

    const reference =
      this.cleanRequiredText(
        dto.wafacashReference,
        'La référence Wafacash',
      );

    await this.ensureWafacashReferenceAvailable(
      reference,
      adherent.id,
    );

    const now =
      new Date();

    try {
      const updated =
        await this.prisma.non_voting_adherents.update({
          where: {
            id:
              adherent.id,
          },

          data: {
            wafacash_reference:
              reference,

            membership_status:
              'PENDING_REVIEW',

            deposit_status:
              'SUBMITTED',

            payment_submitted_at:
              now,

            payment_rejected_at:
              null,

            rejection_reason:
              null,

            reviewed_by_user_id:
              null,

            reviewed_at:
              null,

            updated_at:
              now,
          },
        });

      await this.auditLogs.log({
        userId:
          user.id,

        action:
          'NON_VOTING_ADHERENT_WAFACASH_SUBMITTED',

        entityType:
          'NON_VOTING_ADHERENT',

        entityId:
          adherent.id,

        description:
          'Une référence Wafacash a été soumise pour vérification.',

        metadata: {
          reference,
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

      return this.formatOne(
        updated as NonVotingAdherentRecord,
      );
    } catch (error) {
      this.handlePrismaConflict(
        error,
      );

      throw error;
    }
  }

  /**
   * Validation manuelle du paiement Wafacash.
   */
  async approveWafacash(
    id:
      string,

    user:
      AuthUser,

    request:
      Request,
  ) {
    this.assertFlascamAdministrator(
      user,
    );

    const adherent =
      await this.getById(
        id,
      );

    if (
      adherent.deposit_payment_method !==
      'WAFACASH'
    ) {
      throw new BadRequestException(
        'Ce dossier n’utilise pas le paiement Wafacash.',
      );
    }

    if (
      adherent.membership_status !==
        'PENDING_REVIEW' ||
      adherent.deposit_status !==
        'SUBMITTED' ||
      !adherent.wafacash_reference
    ) {
      throw new BadRequestException(
        'Ce dossier ne possède pas de référence Wafacash en attente de validation.',
      );
    }

    const now =
      new Date();

    const updated =
      await this.prisma.$transaction(
        async (
          transaction,
        ) => {
          await transaction.users.update({
            where: {
              id:
                adherent.user_id,
            },

            data: {
              is_active:
                true,

              updated_at:
                now,
            },
          });

          return transaction.non_voting_adherents.update({
            where: {
              id,
            },

            data: {
              membership_status:
                'ACTIVE',

              deposit_status:
                'PAID',

              payment_confirmed_at:
                now,

              payment_rejected_at:
                null,

              rejection_reason:
                null,

              reviewed_by_user_id:
                user.id,

              reviewed_at:
                now,

              activated_at:
                now,

              suspended_at:
                null,

              suspension_reason:
                null,

              updated_at:
                now,
            },
          });
        },
      );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NON_VOTING_ADHERENT_WAFACASH_APPROVED',

      entityType:
        'NON_VOTING_ADHERENT',

      entityId:
        id,

      description:
        'Le paiement Wafacash d’un adhérent non votant a été validé.',

      metadata: {
        accountId:
          adherent.user_id,

        reference:
          adherent.wafacash_reference,
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

    return this.formatOne(
      updated as NonVotingAdherentRecord,
    );
  }

  /**
   * Refus manuel d’un paiement Wafacash.
   */
  async rejectWafacash(
    id:
      string,

    dto:
      RejectWafacashDto,

    user:
      AuthUser,

    request:
      Request,
  ) {
    this.assertFlascamAdministrator(
      user,
    );

    const adherent =
      await this.getById(
        id,
      );

    if (
      adherent.deposit_payment_method !==
      'WAFACASH'
    ) {
      throw new BadRequestException(
        'Ce dossier n’utilise pas le paiement Wafacash.',
      );
    }

    if (
      adherent.membership_status !==
        'PENDING_REVIEW' ||
      adherent.deposit_status !==
        'SUBMITTED'
    ) {
      throw new BadRequestException(
        'Aucun paiement Wafacash n’est en attente de validation pour ce dossier.',
      );
    }

    const reason =
      this.cleanRequiredText(
        dto.reason,
        'Le motif du refus',
      );

    const now =
      new Date();

    const updated =
      await this.prisma.non_voting_adherents.update({
        where: {
          id,
        },

        data: {
          membership_status:
            'REJECTED',

          deposit_status:
            'REJECTED',

          payment_rejected_at:
            now,

          payment_confirmed_at:
            null,

          rejection_reason:
            reason,

          reviewed_by_user_id:
            user.id,

          reviewed_at:
            now,

          activated_at:
            null,

          updated_at:
            now,
        },
      });

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NON_VOTING_ADHERENT_WAFACASH_REJECTED',

      entityType:
        'NON_VOTING_ADHERENT',

      entityId:
        id,

      description:
        'Le paiement Wafacash d’un adhérent non votant a été refusé.',

      metadata: {
        accountId:
          adherent.user_id,

        reason,
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

    return this.formatOne(
      updated as NonVotingAdherentRecord,
    );
  }

  /**
   * Suspension par FLASCAM.
   *
   * Le compte est désactivé et toutes ses sessions
   * sont révoquées dans la même transaction.
   */
  async suspend(
    id:
      string,

    dto:
      SuspendNonVotingAdherentDto,

    user:
      AuthUser,

    request:
      Request,
  ) {
    this.assertFlascamAdministrator(
      user,
    );

    const adherent =
      await this.getById(
        id,
      );

    if (
      adherent.membership_status ===
      'SUSPENDED'
    ) {
      throw new BadRequestException(
        'Cet adhérent non votant est déjà suspendu.',
      );
    }

    const reason =
      this.cleanRequiredText(
        dto.reason,
        'Le motif de suspension',
      );

    const now =
      new Date();

    const updated =
      await this.prisma.$transaction(
        async (
          transaction,
        ) => {
          await transaction.users.update({
            where: {
              id:
                adherent.user_id,
            },

            data: {
              is_active:
                false,

              updated_at:
                now,
            },
          });

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

          return transaction.non_voting_adherents.update({
            where: {
              id,
            },

            data: {
              membership_status:
                'SUSPENDED',

              suspension_reason:
                reason,

              suspended_at:
                now,

              reviewed_by_user_id:
                user.id,

              reviewed_at:
                now,

              updated_at:
                now,
            },
          });
        },
      );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NON_VOTING_ADHERENT_SUSPENDED',

      entityType:
        'NON_VOTING_ADHERENT',

      entityId:
        id,

      description:
        'Un adhérent non votant a été suspendu.',

      metadata: {
        accountId:
          adherent.user_id,

        reason,

        previousStatus:
          adherent.membership_status,
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

    return this.formatOne(
      updated as NonVotingAdherentRecord,
    );
  }

  /**
   * Réactivation d’un compte suspendu.
   *
   * Une caution déjà validée permet de revenir à ACTIVE.
   * Dans les autres cas, le dossier revient vers l’étape
   * correspondant à son mode de paiement.
   */
  async reactivate(
    id:
      string,

    user:
      AuthUser,

    request:
      Request,
  ) {
    this.assertFlascamAdministrator(
      user,
    );

    const adherent =
      await this.getById(
        id,
      );

    if (
      adherent.membership_status !==
      'SUSPENDED'
    ) {
      throw new BadRequestException(
        'Seul un adhérent suspendu peut être réactivé.',
      );
    }

    const restoredStatus =
      this.resolveStatusAfterReactivation(
        adherent,
      );

    const now =
      new Date();

    const updated =
      await this.prisma.$transaction(
        async (
          transaction,
        ) => {
          await transaction.users.update({
            where: {
              id:
                adherent.user_id,
            },

            data: {
              is_active:
                true,

              updated_at:
                now,
            },
          });

          return transaction.non_voting_adherents.update({
            where: {
              id,
            },

            data: {
              membership_status:
                restoredStatus,

              suspension_reason:
                null,

              suspended_at:
                null,

              reviewed_by_user_id:
                user.id,

              reviewed_at:
                now,

              updated_at:
                now,
            },
          });
        },
      );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NON_VOTING_ADHERENT_REACTIVATED',

      entityType:
        'NON_VOTING_ADHERENT',

      entityId:
        id,

      description:
        'Un adhérent non votant a été réactivé.',

      metadata: {
        accountId:
          adherent.user_id,

        restoredStatus,
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

    return this.formatOne(
      updated as NonVotingAdherentRecord,
    );
  }

  /**
   * Contrôle métier appelé avant toute création d’offre.
   */
  async assertCanSubmitOffer(
    user:
      AuthUser,
  ): Promise<void> {
    /*
     * Les droits des rôles historiques sont déjà
     * contrôlés dans le contrôleur marketplace.
     *
     * Ce contrôle supplémentaire concerne uniquement
     * le rôle MARKETPLACE_USER.
     */
    if (
      user.role !==
      'MARKETPLACE_USER'
    ) {
      return;
    }

    const account =
      await this.prisma.users.findFirst({
        where: {
          id:
            user.id,

          deleted_at:
            null,
        },

        select: {
          is_active:
            true,
        },
      });

    if (
      !account ||
      !account.is_active
    ) {
      throw new ForbiddenException(
        'Votre compte est désactivé.',
      );
    }

    const adherent =
      await this.prisma.non_voting_adherents.findFirst({
        where: {
          user_id:
            user.id,

          deleted_at:
            null,
        },

        select: {
          membership_status:
            true,

          deposit_status:
            true,
        },
      });

    if (!adherent) {
      throw new ForbiddenException(
        'Votre dossier d’adhérent non votant est introuvable.',
      );
    }

    if (
      adherent.membership_status ===
      'SUSPENDED'
    ) {
      throw new ForbiddenException(
        'Votre compte d’adhérent non votant est suspendu.',
      );
    }

    if (
      adherent.membership_status !==
        'ACTIVE' ||
      adherent.deposit_status !==
        'PAID'
    ) {
      throw new ForbiddenException(
        'Votre caution doit être validée avant de pouvoir envoyer une offre.',
      );
    }
  }

  /**
   * Méthode prévue pour le futur webhook de paiement CB.
   *
   * Elle pourra être appelée uniquement par le module de paiement,
   * après validation cryptographique du webhook du prestataire.
   */
  async activateAfterCardPayment(
    adherentId:
      string,

    paymentData: {
      provider: string;
      sessionId?: string | null;
      transactionId: string;
      confirmedAt?: Date;
    },
  ) {
    const adherent =
      await this.getById(
        adherentId,
      );

    if (
      adherent.deposit_payment_method !==
      'CARD'
    ) {
      throw new BadRequestException(
        'Ce dossier n’utilise pas le paiement par carte bancaire.',
      );
    }

    if (
      adherent.deposit_status ===
        'PAID' &&
      adherent.membership_status ===
        'ACTIVE'
    ) {
      /*
       * Idempotence du webhook :
       * un même événement confirmé ne doit pas créer d’erreur.
       */
      if (
        adherent.payment_transaction_id ===
        paymentData.transactionId
      ) {
        return this.formatOne(
          adherent,
        );
      }

      throw new ConflictException(
        'Une autre transaction a déjà validé cette caution.',
      );
    }

    const provider =
      this.cleanRequiredText(
        paymentData.provider,
        'Le prestataire de paiement',
      );

    const transactionId =
      this.cleanRequiredText(
        paymentData.transactionId,
        'L’identifiant de transaction',
      );

    const sessionId =
      this.cleanOptionalText(
        paymentData.sessionId,
      );

    const confirmedAt =
      paymentData.confirmedAt ??
      new Date();

    try {
      const updated =
        await this.prisma.$transaction(
          async (
            transaction,
          ) => {
            await transaction.users.update({
              where: {
                id:
                  adherent.user_id,
              },

              data: {
                is_active:
                  true,

                updated_at:
                  confirmedAt,
              },
            });

            return transaction.non_voting_adherents.update({
              where: {
                id:
                  adherent.id,
              },

              data: {
                membership_status:
                  'ACTIVE',

                deposit_status:
                  'PAID',

                payment_provider:
                  provider,

                payment_session_id:
                  sessionId,

                payment_transaction_id:
                  transactionId,

                payment_confirmed_at:
                  confirmedAt,

                payment_rejected_at:
                  null,

                rejection_reason:
                  null,

                activated_at:
                  confirmedAt,

                suspended_at:
                  null,

                suspension_reason:
                  null,

                updated_at:
                  confirmedAt,
              },
            });
          },
        );

      await this.auditLogs.log({
        userId:
          null,

        action:
          'NON_VOTING_ADHERENT_CARD_PAYMENT_CONFIRMED',

        entityType:
          'NON_VOTING_ADHERENT',

        entityId:
          adherent.id,

        description:
          'La caution par carte bancaire a été confirmée par le prestataire de paiement.',

        metadata: {
          provider,

          transactionId,

          sessionId:
            sessionId ??
            null,

          accountId:
            adherent.user_id,
        },
      });

      return this.formatOne(
        updated as NonVotingAdherentRecord,
      );
    } catch (error) {
      this.handlePrismaConflict(
        error,
      );

      throw error;
    }
  }

  private async getById(
    id:
      string,
  ): Promise<NonVotingAdherentRecord> {
    const normalizedId =
      this.cleanRequiredText(
        id,
        'L’identifiant du dossier',
      );

    const adherent =
      await this.prisma.non_voting_adherents.findFirst({
        where: {
          id:
            normalizedId,

          deleted_at:
            null,
        },
      });

    if (!adherent) {
      throw new NotFoundException(
        'L’adhérent non votant est introuvable.',
      );
    }

    return adherent as
      NonVotingAdherentRecord;
  }

  private async getByUserId(
    userId:
      string,
  ): Promise<NonVotingAdherentRecord> {
    const adherent =
      await this.prisma.non_voting_adherents.findFirst({
        where: {
          user_id:
            userId,

          deleted_at:
            null,
        },
      });

    if (!adherent) {
      throw new NotFoundException(
        'Votre dossier d’adhérent non votant est introuvable.',
      );
    }

    return adherent as
      NonVotingAdherentRecord;
  }

  private async findMatchingUserIds(
    search:
      string,
  ): Promise<string[]> {
    const users =
      await this.prisma.users.findMany({
        where: {
          deleted_at:
            null,

          OR: [
            {
              email: {
                contains:
                  search,

                mode:
                  'insensitive',
              },
            },
            {
              first_name: {
                contains:
                  search,

                mode:
                  'insensitive',
              },
            },
            {
              last_name: {
                contains:
                  search,

                mode:
                  'insensitive',
              },
            },
            {
              phone: {
                contains:
                  search,

                mode:
                  'insensitive',
              },
            },
          ],
        },

        select: {
          id:
            true,
        },

        take:
          500,
      });

    return users.map(
      (
        currentUser,
      ) =>
        currentUser.id,
    );
  }

  private async ensureEmailAvailable(
    email:
      string,

    excludedUserId?:
      string,
  ): Promise<void> {
    const existing =
      await this.prisma.users.findFirst({
        where: {
          email,

          deleted_at:
            null,

          ...(excludedUserId
            ? {
                id: {
                  not:
                    excludedUserId,
                },
              }
            : {}),
        },

        select: {
          id:
            true,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Un compte utilise déjà cette adresse e-mail.',
      );
    }
  }

  private async ensureWafacashReferenceAvailable(
    reference:
      string,

    excludedAdherentId?:
      string,
  ): Promise<void> {
    const existing =
      await this.prisma.non_voting_adherents.findFirst({
        where: {
          wafacash_reference:
            reference,

          deleted_at:
            null,

          ...(excludedAdherentId
            ? {
                id: {
                  not:
                    excludedAdherentId,
                },
              }
            : {}),
        },

        select: {
          id:
            true,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Cette référence Wafacash est déjà utilisée par un autre dossier.',
      );
    }
  }

  private validateInitialPaymentData(
    paymentMethod:
      DepositPaymentMethod,

    wafacashReference:
      string | null,
  ): void {
    if (
      paymentMethod ===
        'CARD' &&
      wafacashReference
    ) {
      throw new BadRequestException(
        'Une référence Wafacash ne peut pas être renseignée pour un paiement par carte bancaire.',
      );
    }

    if (
      paymentMethod ===
        'WAFACASH' &&
      !wafacashReference
    ) {
      throw new BadRequestException(
        'La référence Wafacash est obligatoire pour ce mode de paiement.',
      );
    }
  }

  private resolveStatusAfterReactivation(
    adherent:
      NonVotingAdherentRecord,
  ): NonVotingMembershipStatus {
    if (
      adherent.deposit_status ===
        'PAID' &&
      adherent.payment_confirmed_at
    ) {
      return 'ACTIVE';
    }

    if (
      adherent.deposit_payment_method ===
        'WAFACASH' &&
      adherent.deposit_status ===
        'SUBMITTED' &&
      adherent.wafacash_reference
    ) {
      return 'PENDING_REVIEW';
    }

    if (
      adherent.deposit_payment_method ===
      'WAFACASH'
    ) {
      /*
       * La contrainte SQL impose qu’un PENDING_REVIEW
       * possède une référence soumise. Sans référence,
       * on revient donc à REJECTED si le paiement avait
       * été refusé, sinon le dossier ne peut pas être
       * validé.
       */
      if (
        adherent.deposit_status ===
        'REJECTED'
      ) {
        return 'REJECTED';
      }

      throw new BadRequestException(
        'Une référence Wafacash doit être soumise avant la réactivation de ce dossier.',
      );
    }

    return 'PENDING_PAYMENT';
  }

  private async formatOne(
    adherent:
      NonVotingAdherentRecord,
  ) {
    const account =
      await this.getUserSummary(
        adherent.user_id,
      );

    return this.formatAdherent(
      adherent,
      account,
    );
  }

  private async formatMany(
    adherents:
      NonVotingAdherentRecord[],
  ) {
    if (
      adherents.length === 0
    ) {
      return [];
    }

    const userIds =
      [
        ...new Set(
          adherents.map(
            (
              adherent,
            ) =>
              adherent.user_id,
          ),
        ),
      ];

    const accounts =
      await this.prisma.users.findMany({
        where: {
          id: {
            in:
              userIds,
          },
        },

        select: {
          id:
            true,

          email:
            true,

          first_name:
            true,

          last_name:
            true,

          phone:
            true,

          is_active:
            true,

          is_email_verified:
            true,

          last_login_at:
            true,

          created_at:
            true,

          updated_at:
            true,
        },
      });

    const accountById =
      new Map<
        string,
        UserSummary
      >(
        accounts.map(
          (
            account,
          ) => [
            account.id,
            account,
          ],
        ),
      );

    return adherents.map(
      (
        adherent,
      ) =>
        this.formatAdherent(
          adherent,

          accountById.get(
            adherent.user_id,
          ) ??
            null,
        ),
    );
  }

  private async getUserSummary(
    userId:
      string,
  ): Promise<UserSummary | null> {
    return this.prisma.users.findUnique({
      where: {
        id:
          userId,
      },

      select: {
        id:
          true,

        email:
          true,

        first_name:
          true,

        last_name:
          true,

        phone:
          true,

        is_active:
          true,

        is_email_verified:
          true,

        last_login_at:
          true,

        created_at:
          true,

        updated_at:
          true,
      },
    });
  }

  private formatAdherent(
    adherent:
      NonVotingAdherentRecord,

    account:
      UserSummary | null,
  ) {
    return {
      id:
        adherent.id,

      userId:
        adherent.user_id,

      account: account
        ? {
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

            fullName:
              [
                account.first_name,
                account.last_name,
              ]
                .filter(
                  Boolean,
                )
                .join(
                  ' ',
                ),

            isActive:
              account.is_active,

            isEmailVerified:
              account.is_email_verified,

            lastLoginAt:
              account.last_login_at,

            createdAt:
              account.created_at,

            updatedAt:
              account.updated_at,
          }
        : null,

      city:
        adherent.city,

      membershipStatus:
        adherent.membership_status,

      deposit: {
        paymentMethod:
          adherent.deposit_payment_method,

        status:
          adherent.deposit_status,

        amount:
          adherent.deposit_amount.toString(),

        currency:
          adherent.currency_code,

        wafacashReference:
          adherent.wafacash_reference,

        paymentProvider:
          adherent.payment_provider,

        paymentSessionId:
          adherent.payment_session_id,

        paymentTransactionId:
          adherent.payment_transaction_id,

        requestedAt:
          adherent.payment_requested_at,

        submittedAt:
          adherent.payment_submitted_at,

        confirmedAt:
          adherent.payment_confirmed_at,

        rejectedAt:
          adherent.payment_rejected_at,

        refundedAt:
          adherent.payment_refunded_at,

        rejectionReason:
          adherent.rejection_reason,
      },

      suspension: {
        reason:
          adherent.suspension_reason,

        suspendedAt:
          adherent.suspended_at,
      },

      review: {
        createdByUserId:
          adherent.created_by_user_id,

        reviewedByUserId:
          adherent.reviewed_by_user_id,

        reviewedAt:
          adherent.reviewed_at,

        activatedAt:
          adherent.activated_at,
      },

      canSubmitOffer:
        account?.is_active ===
          true &&
        adherent.membership_status ===
          'ACTIVE' &&
        adherent.deposit_status ===
          'PAID',

      requiresCardPayment:
        adherent.membership_status ===
          'PENDING_PAYMENT' &&
        adherent.deposit_payment_method ===
          'CARD' &&
        adherent.deposit_status ===
          'PENDING',

      requiresWafacashReview:
        adherent.membership_status ===
          'PENDING_REVIEW' &&
        adherent.deposit_payment_method ===
          'WAFACASH' &&
        adherent.deposit_status ===
          'SUBMITTED',

      canSubmitWafacashReference:
        adherent.deposit_payment_method ===
          'WAFACASH' &&
        [
          'REJECTED',
          'PENDING_PAYMENT',
        ].includes(
          adherent.membership_status,
        ),

      createdAt:
        adherent.created_at,

      updatedAt:
        adherent.updated_at,
    };
  }

  private getDepositAmount(): string {
    const raw =
      this.config.get<string>(
        'NON_VOTING_ADHERENT_DEPOSIT_AMOUNT',
      );

    if (!raw) {
      throw new BadRequestException(
        'La variable NON_VOTING_ADHERENT_DEPOSIT_AMOUNT est absente.',
      );
    }

    const normalized =
      raw
        .trim()
        .replace(
          ',',
          '.',
        );

    const amount =
      Number(
        normalized,
      );

    if (
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {
      throw new BadRequestException(
        'La variable NON_VOTING_ADHERENT_DEPOSIT_AMOUNT doit contenir un montant strictement positif.',
      );
    }

    return amount.toFixed(
      2,
    );
  }

  private generateTemporaryPassword(): string {
    /*
     * Contient volontairement :
     * - majuscules ;
     * - minuscules ;
     * - chiffres ;
     * - caractère spécial.
     */
    return `Fl@${randomBytes(
      12,
    ).toString(
      'base64url',
    )}9a`;
  }

  private normalizeEmail(
    value:
      string,
  ): string {
    const normalized =
      value
        .trim()
        .toLowerCase();

    if (!normalized) {
      throw new BadRequestException(
        'L’adresse e-mail est obligatoire.',
      );
    }

    return normalized;
  }

  private normalizePaymentMethod(
    value:
      string,
  ): DepositPaymentMethod {
    const normalized =
      value
        .trim()
        .toUpperCase();

    if (
      ![
        'CARD',
        'WAFACASH',
      ].includes(
        normalized,
      )
    ) {
      throw new BadRequestException(
        'Le mode de paiement doit être CARD ou WAFACASH.',
      );
    }

    return normalized as
      DepositPaymentMethod;
  }

  private normalizeMembershipStatus(
    value:
      string,
  ): NonVotingMembershipStatus {
    const normalized =
      value
        .trim()
        .toUpperCase();

    const allowedStatuses:
      NonVotingMembershipStatus[] = [
        'PENDING_PAYMENT',
        'PENDING_REVIEW',
        'ACTIVE',
        'REJECTED',
        'SUSPENDED',
      ];

    if (
      !allowedStatuses.includes(
        normalized as
          NonVotingMembershipStatus,
      )
    ) {
      throw new BadRequestException(
        'Le statut d’adhésion non votante est invalide.',
      );
    }

    return normalized as
      NonVotingMembershipStatus;
  }

  private cleanRequiredText(
    value:
      string,

    label:
      string,
  ): string {
    const cleaned =
      value?.trim();

    if (!cleaned) {
      throw new BadRequestException(
        `${label} est obligatoire.`,
      );
    }

    return cleaned;
  }

  private cleanOptionalText(
    value?:
      string | null,
  ): string | null {
    const cleaned =
      value?.trim();

    return cleaned ||
      null;
  }

  private assertFlascamAdministrator(
    user:
      AuthUser,
  ): void {
    if (
      ![
        'SUPER_ADMIN',
        'FLASCAM_ADMIN',
      ].includes(
        user.role,
      )
    ) {
      throw new ForbiddenException(
        'Cette action est réservée à l’administration FLASCAM.',
      );
    }
  }

  private getIp(
    request:
      Request,
  ): string | undefined {
    const forwarded =
      request.headers[
        'x-forwarded-for'
      ];

    if (
      typeof forwarded ===
      'string'
    ) {
      return forwarded
        .split(
          ',',
        )[0]
        ?.trim();
    }

    if (
      Array.isArray(
        forwarded,
      )
    ) {
      return forwarded[0]
        ?.split(
          ',',
        )[0]
        ?.trim();
    }

    return request.ip;
  }

  private handlePrismaConflict(
    error:
      unknown,
  ): void {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        'P2002'
    ) {
      const target =
        Array.isArray(
          error.meta?.target,
        )
          ? error.meta.target.join(
              ',',
            )
          : String(
              error.meta?.target ??
                '',
            );

      if (
        target.includes(
          'email',
        )
      ) {
        throw new ConflictException(
          'Un compte utilise déjà cette adresse e-mail.',
        );
      }

      if (
        target.includes(
          'wafacash_reference',
        )
      ) {
        throw new ConflictException(
          'Cette référence Wafacash est déjà utilisée.',
        );
      }

      if (
        target.includes(
          'payment_session_id',
        )
      ) {
        throw new ConflictException(
          'Cette session de paiement est déjà enregistrée.',
        );
      }

      if (
        target.includes(
          'payment_transaction_id',
        )
      ) {
        throw new ConflictException(
          'Cette transaction de paiement est déjà enregistrée.',
        );
      }

      throw new ConflictException(
        'Une donnée unique est déjà utilisée par un autre dossier.',
      );
    }
  }
}