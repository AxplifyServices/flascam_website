import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  Request,
} from 'express';

import {
  AuditLogsService,
} from '../audit-logs/audit-logs.service';

import {
  PrismaService,
} from '../prisma/prisma.service';

import type {
  AuthUser,
} from '../auth/types/auth-user.type';

import {
  CreateContactMessageDto,
} from './dto/create-contact-message.dto';

import {
  UpdateContactStatusDto,
} from './dto/update-contact-status.dto';

import {
  UpdateInstitutionalContentDto,
} from './dto/update-institutional-content.dto';

@Injectable()
export class InstitutionalService {
  constructor(
    private readonly prisma:
      PrismaService,
    private readonly auditLogs:
      AuditLogsService,
  ) {}

  async getPublicContent() {
    const content =
      await this.prisma
        .institutional_contents
        .findFirst({
          where: {
            slug: 'home',
            is_published: true,
          },
        });

    if (!content) {
      throw new NotFoundException(
        'Le portail institutionnel n’est pas publié.',
      );
    }

    const [
      missions,
      keyFigures,
      executiveMembers,
      partners,
      documents,
    ] = await Promise.all([
      this.prisma
        .institutional_missions
        .findMany({
          where: {
            is_published: true,
          },
          orderBy: {
            display_order: 'asc',
          },
        }),

      this.prisma
        .institutional_key_figures
        .findMany({
          where: {
            is_published: true,
          },
          orderBy: {
            display_order: 'asc',
          },
        }),

      this.prisma.executive_members.findMany({
        where: {
          is_published: true,
        },
        orderBy: {
          display_order: 'asc',
        },
      }),

      this.prisma
        .institutional_partners
        .findMany({
          where: {
            is_published: true,
          },
          orderBy: {
            display_order: 'asc',
          },
        }),

      this.prisma
        .institutional_documents
        .findMany({
          where: {
            is_published: true,
          },
          orderBy: [
            {
              display_order: 'asc',
            },
            {
              publication_date: 'desc',
            },
          ],
        }),
    ]);

    return this.formatContent({
      content,
      missions,
      keyFigures,
      executiveMembers,
      partners,
      documents,
    });
  }

  async getAdminContent() {
    const content =
      await this.prisma
        .institutional_contents
        .findUnique({
          where: {
            slug: 'home',
          },
        });

    if (!content) {
      throw new NotFoundException(
        'Le contenu institutionnel est introuvable.',
      );
    }

    const [
      missions,
      keyFigures,
      executiveMembers,
      partners,
      documents,
    ] = await Promise.all([
      this.prisma
        .institutional_missions
        .findMany({
          orderBy: {
            display_order: 'asc',
          },
        }),

      this.prisma
        .institutional_key_figures
        .findMany({
          orderBy: {
            display_order: 'asc',
          },
        }),

      this.prisma.executive_members.findMany({
        orderBy: {
          display_order: 'asc',
        },
      }),

      this.prisma
        .institutional_partners
        .findMany({
          orderBy: {
            display_order: 'asc',
          },
        }),

      this.prisma
        .institutional_documents
        .findMany({
          orderBy: {
            display_order: 'asc',
          },
        }),
    ]);

    return this.formatContent({
      content,
      missions,
      keyFigures,
      executiveMembers,
      partners,
      documents,
    });
  }

  async updateContent(
    dto: UpdateInstitutionalContentDto,
    user: AuthUser,
    request: Request,
  ) {
    await this.prisma.$transaction(
      async (transaction) => {
        await transaction
          .institutional_contents
          .upsert({
            where: {
              slug: dto.slug,
            },
            create: {
              slug: dto.slug,

              hero_eyebrow:
                dto.heroEyebrow,
              hero_title:
                dto.heroTitle,
              hero_subtitle:
                dto.heroSubtitle,

              hero_primary_cta_label:
                dto.heroPrimaryCtaLabel,
              hero_primary_cta_url:
                dto.heroPrimaryCtaUrl,

              hero_secondary_cta_label:
                dto.heroSecondaryCtaLabel,
              hero_secondary_cta_url:
                dto.heroSecondaryCtaUrl,

              federation_eyebrow:
                dto.federationEyebrow,
              federation_title:
                dto.federationTitle,
              federation_body:
                dto.federationBody,

              missions_eyebrow:
                dto.missionsEyebrow,
              missions_title:
                dto.missionsTitle,
              missions_body:
                dto.missionsBody,

              governance_eyebrow:
                dto.governanceEyebrow,
              governance_title:
                dto.governanceTitle,
              governance_body:
                dto.governanceBody,

              executive_office_eyebrow:
                dto.executiveOfficeEyebrow,
              executive_office_title:
                dto.executiveOfficeTitle,
              executive_office_body:
                dto.executiveOfficeBody,

              partners_eyebrow:
                dto.partnersEyebrow,
              partners_title:
                dto.partnersTitle,
              partners_body:
                dto.partnersBody,

              documents_eyebrow:
                dto.documentsEyebrow,
              documents_title:
                dto.documentsTitle,
              documents_body:
                dto.documentsBody,

              contact_eyebrow:
                dto.contactEyebrow,
              contact_title:
                dto.contactTitle,
              contact_body:
                dto.contactBody,

              contact_email:
                dto.contactEmail,
              contact_phone:
                dto.contactPhone,
              contact_address:
                dto.contactAddress,

              seo_title:
                dto.seoTitle,
              seo_description:
                dto.seoDescription,

              is_published:
                dto.isPublished,
            },
            update: {
              hero_eyebrow:
                dto.heroEyebrow,
              hero_title:
                dto.heroTitle,
              hero_subtitle:
                dto.heroSubtitle,

              hero_primary_cta_label:
                dto.heroPrimaryCtaLabel,
              hero_primary_cta_url:
                dto.heroPrimaryCtaUrl,

              hero_secondary_cta_label:
                dto.heroSecondaryCtaLabel,
              hero_secondary_cta_url:
                dto.heroSecondaryCtaUrl,

              federation_eyebrow:
                dto.federationEyebrow,
              federation_title:
                dto.federationTitle,
              federation_body:
                dto.federationBody,

              missions_eyebrow:
                dto.missionsEyebrow,
              missions_title:
                dto.missionsTitle,
              missions_body:
                dto.missionsBody,

              governance_eyebrow:
                dto.governanceEyebrow,
              governance_title:
                dto.governanceTitle,
              governance_body:
                dto.governanceBody,

              executive_office_eyebrow:
                dto.executiveOfficeEyebrow,
              executive_office_title:
                dto.executiveOfficeTitle,
              executive_office_body:
                dto.executiveOfficeBody,

              partners_eyebrow:
                dto.partnersEyebrow,
              partners_title:
                dto.partnersTitle,
              partners_body:
                dto.partnersBody,

              documents_eyebrow:
                dto.documentsEyebrow,
              documents_title:
                dto.documentsTitle,
              documents_body:
                dto.documentsBody,

              contact_eyebrow:
                dto.contactEyebrow,
              contact_title:
                dto.contactTitle,
              contact_body:
                dto.contactBody,

              contact_email:
                dto.contactEmail,
              contact_phone:
                dto.contactPhone,
              contact_address:
                dto.contactAddress,

              seo_title:
                dto.seoTitle,
              seo_description:
                dto.seoDescription,

              is_published:
                dto.isPublished,

              updated_at: new Date(),
            },
          });

        await transaction
          .institutional_missions
          .deleteMany();

        if (dto.missions.length > 0) {
          await transaction
            .institutional_missions
            .createMany({
              data: dto.missions.map(
                (item) => ({
                  title: item.title,
                  description:
                    item.description,
                  display_order:
                    item.displayOrder,
                  is_published:
                    item.isPublished,
                }),
              ),
            });
        }

        await transaction
          .institutional_key_figures
          .deleteMany();

        if (dto.keyFigures.length > 0) {
          await transaction
            .institutional_key_figures
            .createMany({
              data: dto.keyFigures.map(
                (item) => ({
                  value: item.value,
                  label: item.label,
                  description:
                    item.description,
                  display_order:
                    item.displayOrder,
                  is_published:
                    item.isPublished,
                }),
              ),
            });
        }

        await transaction
          .executive_members
          .deleteMany();

        if (
          dto.executiveMembers.length > 0
        ) {
          await transaction
            .executive_members
            .createMany({
              data:
                dto.executiveMembers.map(
                  (item) => ({
                    full_name:
                      item.fullName,
                    position:
                      item.position,
                    biography:
                      item.biography,
                    image_url:
                      item.imageUrl,
                    linkedin_url:
                      item.linkedinUrl,
                    display_order:
                      item.displayOrder,
                    is_published:
                      item.isPublished,
                  }),
                ),
            });
        }

        await transaction
          .institutional_partners
          .deleteMany();

        if (dto.partners.length > 0) {
          await transaction
            .institutional_partners
            .createMany({
              data: dto.partners.map(
                (item) => ({
                  name: item.name,
                  description:
                    item.description,
                  logo_url:
                    item.logoUrl,
                  website_url:
                    item.websiteUrl,
                  display_order:
                    item.displayOrder,
                  is_published:
                    item.isPublished,
                }),
              ),
            });
        }

        await transaction
          .institutional_documents
          .deleteMany();

        if (dto.documents.length > 0) {
          await transaction
            .institutional_documents
            .createMany({
              data: dto.documents.map(
                (item) => ({
                  title: item.title,
                  description:
                    item.description,
                  document_type:
                    item.documentType,
                  file_url:
                    item.fileUrl,
                  file_size_label:
                    item.fileSizeLabel,
                  publication_date:
                    item.publicationDate
                      ? new Date(
                          item.publicationDate,
                        )
                      : null,
                  display_order:
                    item.displayOrder,
                  is_published:
                    item.isPublished,
                }),
              ),
            });
        }
      },
    );

    await this.auditLogs.log({
      userId: user.id,
      action:
        'INSTITUTIONAL_CONTENT_UPDATED',
      entityType:
        'INSTITUTIONAL_CONTENT',
      description:
        'Mise à jour du portail institutionnel.',
      ipAddress:
        request.ip,
      userAgent:
        request.get('user-agent'),
    });

    return this.getAdminContent();
  }

  async createContactMessage(
    dto: CreateContactMessageDto,
    request: Request,
  ) {
    const message =
      await this.prisma
        .contact_messages
        .create({
          data: {
            full_name:
              dto.fullName,
            email: dto.email,
            phone: dto.phone,
            subject: dto.subject,
            message: dto.message,
          },
          select: {
            id: true,
            created_at: true,
          },
        });

    await this.auditLogs.log({
      action:
        'CONTACT_MESSAGE_CREATED',
      entityType:
        'CONTACT_MESSAGE',
      entityId: message.id,
      description:
        'Nouveau message reçu depuis le portail public.',
      metadata: {
        email: dto.email,
        subject: dto.subject,
      },
      ipAddress:
        request.ip,
      userAgent:
        request.get('user-agent'),
    });

    return {
      success: true,
      id: message.id,
      createdAt:
        message.created_at,
    };
  }

  async getContactMessages() {
    const messages =
      await this.prisma
        .contact_messages
        .findMany({
          orderBy: {
            created_at: 'desc',
          },
        });

    return messages.map(
      (message) => ({
        id: message.id,
        fullName:
          message.full_name,
        email: message.email,
        phone: message.phone,
        subject:
          message.subject,
        message:
          message.message,
        status: message.status,
        processedByUserId:
          message.processed_by_user_id,
        processedAt:
          message.processed_at,
        createdAt:
          message.created_at,
      }),
    );
  }

  async updateContactStatus(
    id: string,
    dto: UpdateContactStatusDto,
    user: AuthUser,
    request: Request,
  ) {
    const existing =
      await this.prisma
        .contact_messages
        .findUnique({
          where: {
            id,
          },
        });

    if (!existing) {
      throw new NotFoundException(
        'Message introuvable.',
      );
    }

    const message =
      await this.prisma
        .contact_messages
        .update({
          where: {
            id,
          },
          data: {
            status: dto.status,
            processed_by_user_id:
              dto.status === 'NEW'
                ? null
                : user.id,
            processed_at:
              dto.status === 'NEW'
                ? null
                : new Date(),
            updated_at:
              new Date(),
          },
        });

    await this.auditLogs.log({
      userId: user.id,
      action:
        'CONTACT_MESSAGE_STATUS_UPDATED',
      entityType:
        'CONTACT_MESSAGE',
      entityId: id,
      description:
        `Statut du message modifié : ${dto.status}.`,
      metadata: {
        previousStatus:
          existing.status,
        newStatus:
          dto.status,
      },
      ipAddress:
        request.ip,
      userAgent:
        request.get('user-agent'),
    });

    return {
      id: message.id,
      status: message.status,
      processedAt:
        message.processed_at,
    };
  }

  private formatContent(data: {
    content: {
      id: string;
      slug: string;

      hero_eyebrow: string | null;
      hero_title: string;
      hero_subtitle: string | null;

      hero_primary_cta_label:
        string | null;
      hero_primary_cta_url:
        string | null;

      hero_secondary_cta_label:
        string | null;
      hero_secondary_cta_url:
        string | null;

      federation_eyebrow:
        string | null;
      federation_title:
        string | null;
      federation_body:
        string | null;

      missions_eyebrow:
        string | null;
      missions_title:
        string | null;
      missions_body:
        string | null;

      governance_eyebrow:
        string | null;
      governance_title:
        string | null;
      governance_body:
        string | null;

      executive_office_eyebrow:
        string | null;
      executive_office_title:
        string | null;
      executive_office_body:
        string | null;

      partners_eyebrow:
        string | null;
      partners_title:
        string | null;
      partners_body:
        string | null;

      documents_eyebrow:
        string | null;
      documents_title:
        string | null;
      documents_body:
        string | null;

      contact_eyebrow:
        string | null;
      contact_title:
        string | null;
      contact_body:
        string | null;

      contact_email:
        string | null;
      contact_phone:
        string | null;
      contact_address:
        string | null;

      seo_title:
        string | null;
      seo_description:
        string | null;

      is_published: boolean;
      created_at: Date;
      updated_at: Date;
    };

    missions: Array<{
      id: string;
      title: string;
      description: string;
      display_order: number;
      is_published: boolean;
    }>;

    keyFigures: Array<{
      id: string;
      value: string;
      label: string;
      description:
        string | null;
      display_order: number;
      is_published: boolean;
    }>;

    executiveMembers: Array<{
      id: string;
      full_name: string;
      position: string;
      biography:
        string | null;
      image_url:
        string | null;
      linkedin_url:
        string | null;
      display_order: number;
      is_published: boolean;
    }>;

    partners: Array<{
      id: string;
      name: string;
      description:
        string | null;
      logo_url:
        string | null;
      website_url:
        string | null;
      display_order: number;
      is_published: boolean;
    }>;

    documents: Array<{
      id: string;
      title: string;
      description:
        string | null;
      document_type:
        string | null;
      file_url: string;
      file_size_label:
        string | null;
      publication_date:
        Date | null;
      display_order: number;
      is_published: boolean;
    }>;
  }) {
    const {
      content,
      missions,
      keyFigures,
      executiveMembers,
      partners,
      documents,
    } = data;

    return {
      id: content.id,
      slug: content.slug,

      heroEyebrow:
        content.hero_eyebrow,
      heroTitle:
        content.hero_title,
      heroSubtitle:
        content.hero_subtitle,

      heroPrimaryCtaLabel:
        content.hero_primary_cta_label,
      heroPrimaryCtaUrl:
        content.hero_primary_cta_url,

      heroSecondaryCtaLabel:
        content.hero_secondary_cta_label,
      heroSecondaryCtaUrl:
        content.hero_secondary_cta_url,

      federationEyebrow:
        content.federation_eyebrow,
      federationTitle:
        content.federation_title,
      federationBody:
        content.federation_body,

      missionsEyebrow:
        content.missions_eyebrow,
      missionsTitle:
        content.missions_title,
      missionsBody:
        content.missions_body,

      governanceEyebrow:
        content.governance_eyebrow,
      governanceTitle:
        content.governance_title,
      governanceBody:
        content.governance_body,

      executiveOfficeEyebrow:
        content.executive_office_eyebrow,
      executiveOfficeTitle:
        content.executive_office_title,
      executiveOfficeBody:
        content.executive_office_body,

      partnersEyebrow:
        content.partners_eyebrow,
      partnersTitle:
        content.partners_title,
      partnersBody:
        content.partners_body,

      documentsEyebrow:
        content.documents_eyebrow,
      documentsTitle:
        content.documents_title,
      documentsBody:
        content.documents_body,

      contactEyebrow:
        content.contact_eyebrow,
      contactTitle:
        content.contact_title,
      contactBody:
        content.contact_body,

      contactEmail:
        content.contact_email,
      contactPhone:
        content.contact_phone,
      contactAddress:
        content.contact_address,

      seoTitle:
        content.seo_title,
      seoDescription:
        content.seo_description,

      isPublished:
        content.is_published,

      missions: missions.map(
        (item) => ({
          id: item.id,
          title: item.title,
          description:
            item.description,
          displayOrder:
            item.display_order,
          isPublished:
            item.is_published,
        }),
      ),

      keyFigures:
        keyFigures.map(
          (item) => ({
            id: item.id,
            value: item.value,
            label: item.label,
            description:
              item.description,
            displayOrder:
              item.display_order,
            isPublished:
              item.is_published,
          }),
        ),

      executiveMembers:
        executiveMembers.map(
          (item) => ({
            id: item.id,
            fullName:
              item.full_name,
            position:
              item.position,
            biography:
              item.biography,
            imageUrl:
              item.image_url,
            linkedinUrl:
              item.linkedin_url,
            displayOrder:
              item.display_order,
            isPublished:
              item.is_published,
          }),
        ),

      partners: partners.map(
        (item) => ({
          id: item.id,
          name: item.name,
          description:
            item.description,
          logoUrl:
            item.logo_url,
          websiteUrl:
            item.website_url,
          displayOrder:
            item.display_order,
          isPublished:
            item.is_published,
        }),
      ),

      documents:
        documents.map(
          (item) => ({
            id: item.id,
            title: item.title,
            description:
              item.description,
            documentType:
              item.document_type,
            fileUrl:
              item.file_url,
            fileSizeLabel:
              item.file_size_label,
            publicationDate:
              item.publication_date,
            displayOrder:
              item.display_order,
            isPublished:
              item.is_published,
          }),
        ),

      createdAt:
        content.created_at,
      updatedAt:
        content.updated_at,
    };
  }
}