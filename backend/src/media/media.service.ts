import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import {
  createHash,
  randomUUID,
} from 'crypto';

import {
  extname,
} from 'path';

import {
  PrismaService,
} from '../prisma/prisma.service';

import type {
  AuthUser,
} from '../auth/types/auth-user.type';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async uploadPublicImage(
    file: Express.Multer.File,
    user: AuthUser,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Aucun fichier reçu.',
      );
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];

    if (
      !allowedMimeTypes.includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        'Format image non autorisé. Formats acceptés : JPG, PNG, WEBP, SVG.',
      );
    }

    const maxSizeMb =
      Number(
        this.config.get<string>(
          'UPLOAD_MAX_IMAGE_SIZE_MB',
          '10',
        ),
      );

    const maxSizeBytes =
      maxSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `Image trop lourde. Taille maximale : ${maxSizeMb} Mo.`,
      );
    }

    const bucket =
      this.config.get<string>(
        'S3_PUBLIC_BUCKET',
      ) ||
      this.config.get<string>(
        'MINIO_PUBLIC_BUCKET',
      ) ||
      'flascam-public';

    const extension =
      extname(
        file.originalname,
      ).toLowerCase();

    const storedFilename =
      `${randomUUID()}${extension}`;

    const objectKey =
      `associations/logos/${storedFilename}`;

    const checksum =
      createHash('sha256')
        .update(file.buffer)
        .digest('hex');

    const s3 = new S3Client({
      region:
        this.config.get<string>(
          'S3_REGION',
          'us-east-1',
        ),
      endpoint:
        this.config.get<string>(
          'S3_ENDPOINT',
        ),
      forcePathStyle:
        this.config.get<string>(
          'S3_FORCE_PATH_STYLE',
          'true',
        ) === 'true',
      credentials: {
        accessKeyId:
          this.config.getOrThrow<string>(
            'S3_ACCESS_KEY',
          ),
        secretAccessKey:
          this.config.getOrThrow<string>(
            'S3_SECRET_KEY',
          ),
      },
    });

try {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );
} catch {
  throw new BadGatewayException(
    'Impossible de joindre le serveur de stockage MinIO. Vérifiez que MinIO est lancé et accessible.',
  );
}

    const asset =
      await this.prisma.media_assets.create({
        data: {
          uploaded_by_user_id:
            user.id,
          storage_provider: 'MINIO',
          bucket_name: bucket,
          object_key: objectKey,
          original_filename:
            file.originalname,
          stored_filename:
            storedFilename,
          file_extension:
            extension.replace('.', ''),
          mime_type:
            file.mimetype,
          media_type: 'IMAGE',
          visibility: 'PUBLIC',
          status: 'PUBLISHED',
          size_bytes: file.size,
          checksum_sha256:
            checksum,
          title:
            file.originalname,
          alt_text:
            file.originalname,
        },
      });

    return {
      id: asset.id,
      url: this.mediaUrl(
        asset.object_key,
      ),
      originalFilename:
        asset.original_filename,
      mimeType:
        asset.mime_type,
      sizeBytes:
        Number(asset.size_bytes),
    };
  }

  private mediaUrl(
    objectKey: string,
  ) {
    const baseUrl =
      this.config.get<string>(
        'PUBLIC_MEDIA_BASE_URL',
        '',
      );

    if (!baseUrl) {
      return objectKey;
    }

    return `${baseUrl.replace(/\/$/, '')}/${objectKey.replace(/^\//, '')}`;
  }
}