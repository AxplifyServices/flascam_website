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

type VideoUploadContext = {
  folder: string;
  associationId: string | null;
};

type MarketplaceMediaKind =
  | 'IMAGE'
  | 'VIDEO';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

async uploadPublicImage(
  file: Express.Multer.File,
  user: AuthUser,
  folder = 'associations/logos',
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

const normalizedFolder =
  folder
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9/_-]/g, '');

const objectKey =
  `${normalizedFolder}/${storedFilename}`;

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


async uploadPublicNewsMedia(
  file: Express.Multer.File,
  user: AuthUser,
  folder = 'news',
) {
    if (!file) {
      throw new BadRequestException(
        'Aucun fichier reçu.',
      );
    }

    const imageMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    const videoMimeTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    const isImage =
      imageMimeTypes.includes(
        file.mimetype,
      );

    const isVideo =
      videoMimeTypes.includes(
        file.mimetype,
      );

    if (
      !isImage &&
      !isVideo
    ) {
      throw new BadRequestException(
        'Format non autorisé. Formats acceptés : JPG, PNG, WEBP, MP4, WEBM et MOV.',
      );
    }

    const maxSizeMb =
      isVideo
        ? Number(
            this.config.get<string>(
              'UPLOAD_MAX_VIDEO_SIZE_MB',
              '100',
            ),
          )
        : Number(
            this.config.get<string>(
              'UPLOAD_MAX_IMAGE_SIZE_MB',
              '10',
            ),
          );

    const maxSizeBytes =
      maxSizeMb *
      1024 *
      1024;

    if (
      file.size >
      maxSizeBytes
    ) {
      throw new BadRequestException(
        `Fichier trop lourd. Taille maximale : ${maxSizeMb} Mo.`,
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
  `${folder}/${storedFilename}`;

    const checksum =
      createHash('sha256')
        .update(file.buffer)
        .digest('hex');

    const s3 =
      new S3Client({
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
          ContentType:
            file.mimetype,
        }),
      );
    } catch {
      throw new BadGatewayException(
        'Impossible de joindre le serveur de stockage MinIO.',
      );
    }

    const asset =
      await this.prisma.media_assets.create({
        data: {
          uploaded_by_user_id:
            user.id,

          storage_provider:
            'MINIO',

          bucket_name:
            bucket,

          object_key:
            objectKey,

          original_filename:
            file.originalname,

          stored_filename:
            storedFilename,

          file_extension:
            extension.replace(
              '.',
              '',
            ),

          mime_type:
            file.mimetype,

          media_type:
            isImage
              ? 'IMAGE'
              : 'VIDEO',

          visibility:
            'PUBLIC',

          status:
            'PUBLISHED',

          size_bytes:
            file.size,

          checksum_sha256:
            checksum,

          title:
            file.originalname,

          alt_text:
            isImage
              ? file.originalname
              : null,

          metadata: {
            module:
              'NEWS',
          },
        },
      });

    return {
      id:
        asset.id,

      url:
        this.mediaUrl(
          asset.object_key,
        ),

      mediaType:
        asset.media_type,

      originalFilename:
        asset.original_filename,

      mimeType:
        asset.mime_type,

      sizeBytes:
        Number(
          asset.size_bytes,
        ),
    };
  } 

async uploadMarketplaceMedia(
  file: Express.Multer.File,
  user: AuthUser,
  mediaKind: MarketplaceMediaKind,
) {
  if (!file) {
    throw new BadRequestException(
      mediaKind === 'IMAGE'
        ? 'Aucune image reçue.'
        : 'Aucune vidéo reçue.',
    );
  }

  const imageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
  ];

  const videoMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];

  const videoExtensions = [
    '.mp4',
    '.webm',
    '.mov',
  ];

  const mimeType =
    file.mimetype
      .trim()
      .toLowerCase();

  const extension =
    extname(
      file.originalname,
    ).toLowerCase();

  const isImage =
    mediaKind ===
    'IMAGE';

  const allowedMimeTypes =
    isImage
      ? imageMimeTypes
      : videoMimeTypes;

  const allowedExtensions =
    isImage
      ? imageExtensions
      : videoExtensions;

  if (
    !allowedMimeTypes.includes(
      mimeType,
    ) ||
    !allowedExtensions.includes(
      extension,
    )
  ) {
    throw new BadRequestException(
      isImage
        ? 'Format image non autorisé. Formats acceptés : JPG, PNG et WEBP.'
        : 'Format vidéo non autorisé. Formats acceptés : MP4, WEBM et MOV.',
    );
  }

  const extensionMatchesMimeType =
    isImage
      ? (
          (
            mimeType ===
              'image/jpeg' &&
            [
              '.jpg',
              '.jpeg',
            ].includes(
              extension,
            )
          ) ||
          (
            mimeType ===
              'image/png' &&
            extension ===
              '.png'
          ) ||
          (
            mimeType ===
              'image/webp' &&
            extension ===
              '.webp'
          )
        )
      : (
          (
            mimeType ===
              'video/mp4' &&
            extension ===
              '.mp4'
          ) ||
          (
            mimeType ===
              'video/webm' &&
            extension ===
              '.webm'
          ) ||
          (
            mimeType ===
              'video/quicktime' &&
            extension ===
              '.mov'
          )
        );

  if (
    !extensionMatchesMimeType
  ) {
    throw new BadRequestException(
      isImage
        ? 'L’extension du fichier ne correspond pas à son format image.'
        : 'L’extension du fichier ne correspond pas à son format vidéo.',
    );
  }

  const configuredLimit =
    Number(
      this.config.get<string>(
        isImage
          ? 'UPLOAD_MAX_IMAGE_SIZE_MB'
          : 'UPLOAD_MAX_VIDEO_SIZE_MB',

        isImage
          ? '10'
          : '250',
      ),
    );

  if (
    !Number.isFinite(
      configuredLimit,
    ) ||
    configuredLimit <= 0
  ) {
    throw new BadRequestException(
      'La limite de taille des fichiers marketplace est mal configurée.',
    );
  }

  const maxSizeBytes =
    configuredLimit *
    1024 *
    1024;

  if (
    file.size >
    maxSizeBytes
  ) {
    throw new BadRequestException(
      `Fichier trop lourd. Taille maximale : ${configuredLimit} Mo.`,
    );
  }

  const bucket =
    this.getPublicBucket();

  /*
   * Chaque utilisateur possède son propre dossier.
   * Cela simplifie l’administration du stockage tout en
   * évitant les collisions entre vendeurs.
   */
  const folder =
    this.normalizeFolder(
      `marketplace/${user.id}/${
        isImage
          ? 'images'
          : 'videos'
      }`,
    );

  const storedFilename =
    `${randomUUID()}${extension}`;

  const objectKey =
    `${folder}/${storedFilename}`;

  const checksum =
    createHash(
      'sha256',
    )
      .update(
        file.buffer,
      )
      .digest(
        'hex',
      );

  await this.putObject({
    bucket,
    objectKey,
    buffer:
      file.buffer,
    mimeType,
  });

  const asset =
    await this.prisma.media_assets.create({
      data: {
        uploaded_by_user_id:
          user.id,

        storage_provider:
          'MINIO',

        bucket_name:
          bucket,

        object_key:
          objectKey,

        original_filename:
          file.originalname,

        stored_filename:
          storedFilename,

        file_extension:
          extension.replace(
            '.',
            '',
          ),

        mime_type:
          mimeType,

        media_type:
          mediaKind,

        visibility:
          'PUBLIC',

        /*
         * PUBLISHED signifie ici que le fichier est exploitable.
         * Cela ne publie pas automatiquement une annonce.
         */
        status:
          'PUBLISHED',

        size_bytes:
          file.size,

        checksum_sha256:
          checksum,

        title:
          file.originalname,

        alt_text:
          isImage
            ? file.originalname
            : null,

        metadata: {
          module:
            'MARKETPLACE',

          uploadPurpose:
            mediaKind,

          uploadedByRole:
            user.role,

          regionalAssociationId:
            user.regionalAssociationId ??
            null,
        },
      },
    });

  return {
    id:
      asset.id,

    mediaAssetId:
      asset.id,

    url:
      this.mediaUrl(
        asset.object_key,
      ),

    mediaType:
      asset.media_type,

    originalFilename:
      asset.original_filename,

    mimeType:
      asset.mime_type,

    sizeBytes:
      Number(
        asset.size_bytes,
      ),
  };
}  
  
async uploadVideo(
  file: Express.Multer.File,
  user: AuthUser,
  context: VideoUploadContext,
) {
  if (
    !file
  ) {
    throw new BadRequestException(
      'Aucun fichier vidéo reçu.',
    );
  }

  const allowedMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];

  const allowedExtensions = [
    '.mp4',
    '.webm',
    '.mov',
  ];

  const mimeType =
    file.mimetype
      .trim()
      .toLowerCase();

  const extension =
    extname(
      file.originalname,
    ).toLowerCase();

  if (
    !allowedMimeTypes.includes(
      mimeType,
    ) ||
    !allowedExtensions.includes(
      extension,
    )
  ) {
    throw new BadRequestException(
      'Format vidéo non autorisé. Formats acceptés : MP4, WEBM et MOV.',
    );
  }

  /*
   * La vérification porte à la fois sur le MIME et l’extension.
   * Cela évite qu’un fichier PHP, ZIP ou exécutable soit importé
   * avec un simple Content-Type falsifié.
   */
  const extensionMatchesMimeType =
    (
      mimeType ===
        'video/mp4' &&
      extension ===
        '.mp4'
    ) ||
    (
      mimeType ===
        'video/webm' &&
      extension ===
        '.webm'
    ) ||
    (
      mimeType ===
        'video/quicktime' &&
      extension ===
        '.mov'
    );

  if (
    !extensionMatchesMimeType
  ) {
    throw new BadRequestException(
      'L’extension du fichier ne correspond pas à son format vidéo.',
    );
  }

  const maxSizeMb =
    Number(
      this.config.get<string>(
        'UPLOAD_MAX_VIDEO_SIZE_MB',
        '250',
      ),
    );

  if (
    !Number.isFinite(
      maxSizeMb,
    ) ||
    maxSizeMb <=
      0
  ) {
    throw new BadRequestException(
      'La limite de taille des vidéos est mal configurée.',
    );
  }

  const maxSizeBytes =
    maxSizeMb *
    1024 *
    1024;

  if (
    file.size >
    maxSizeBytes
  ) {
    throw new BadRequestException(
      `Vidéo trop lourde. Taille maximale : ${maxSizeMb} Mo.`,
    );
  }

  const bucket =
    this.getPublicBucket();

  const normalizedFolder =
    this.normalizeFolder(
      context.folder,
    );

  const storedFilename =
    `${randomUUID()}${extension}`;

  const objectKey =
    `${normalizedFolder}/${storedFilename}`;

  const checksum =
    createHash(
      'sha256',
    )
      .update(
        file.buffer,
      )
      .digest(
        'hex',
      );

  await this.putObject({
    bucket,
    objectKey,
    buffer:
      file.buffer,
    mimeType,
  });

  const asset =
    await this.prisma.media_assets.create({
      data: {
        uploaded_by_user_id:
          user.id,

        storage_provider:
          'MINIO',

        bucket_name:
          bucket,

        object_key:
          objectKey,

        original_filename:
          file.originalname,

        stored_filename:
          storedFilename,

        file_extension:
          extension.replace(
            '.',
            '',
          ),

        mime_type:
          mimeType,

        media_type:
          'VIDEO',

        /*
         * Le fichier est techniquement accessible dans le bucket
         * public, mais son existence ne publie pas une entrée
         * de vidéothèque.
         *
         * Seul l’enregistrement videos avec status PUBLISHED
         * sera exposé par les routes publiques.
         */
        visibility:
          'PUBLIC',

        status:
          'PUBLISHED',

        size_bytes:
          file.size,

        checksum_sha256:
          checksum,

        title:
          file.originalname,

        alt_text:
          null,

        metadata: {
          module:
            'VIDEOS',

          uploadPurpose:
            'VIDEO',

          regionalAssociationId:
            context.associationId,

          uploadedByRole:
            user.role,
        },
      },
    });

  return {
    id:
      asset.id,

    url:
      this.mediaUrl(
        asset.object_key,
      ),

    mediaType:
      asset.media_type,

    originalFilename:
      asset.original_filename,

    mimeType:
      asset.mime_type,

    sizeBytes:
      Number(
        asset.size_bytes,
      ),

    associationId:
      context.associationId,
  };
}

async uploadVideoThumbnail(
  file: Express.Multer.File,
  user: AuthUser,
  context: VideoUploadContext,
) {
  if (
    !file
  ) {
    throw new BadRequestException(
      'Aucune miniature reçue.',
    );
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  const allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
  ];

  const mimeType =
    file.mimetype
      .trim()
      .toLowerCase();

  const extension =
    extname(
      file.originalname,
    ).toLowerCase();

  if (
    !allowedMimeTypes.includes(
      mimeType,
    ) ||
    !allowedExtensions.includes(
      extension,
    )
  ) {
    throw new BadRequestException(
      'Format de miniature non autorisé. Formats acceptés : JPG, PNG et WEBP.',
    );
  }

  const extensionMatchesMimeType =
    (
      mimeType ===
        'image/jpeg' &&
      [
        '.jpg',
        '.jpeg',
      ].includes(
        extension,
      )
    ) ||
    (
      mimeType ===
        'image/png' &&
      extension ===
        '.png'
    ) ||
    (
      mimeType ===
        'image/webp' &&
      extension ===
        '.webp'
    );

  if (
    !extensionMatchesMimeType
  ) {
    throw new BadRequestException(
      'L’extension du fichier ne correspond pas à son format d’image.',
    );
  }

  const maxSizeMb =
    Number(
      this.config.get<string>(
        'UPLOAD_MAX_IMAGE_SIZE_MB',
        '10',
      ),
    );

  if (
    !Number.isFinite(
      maxSizeMb,
    ) ||
    maxSizeMb <=
      0
  ) {
    throw new BadRequestException(
      'La limite de taille des images est mal configurée.',
    );
  }

  const maxSizeBytes =
    maxSizeMb *
    1024 *
    1024;

  if (
    file.size >
    maxSizeBytes
  ) {
    throw new BadRequestException(
      `Miniature trop lourde. Taille maximale : ${maxSizeMb} Mo.`,
    );
  }

  const bucket =
    this.getPublicBucket();

  const normalizedFolder =
    this.normalizeFolder(
      context.folder,
    );

  const storedFilename =
    `${randomUUID()}${extension}`;

  const objectKey =
    `${normalizedFolder}/${storedFilename}`;

  const checksum =
    createHash(
      'sha256',
    )
      .update(
        file.buffer,
      )
      .digest(
        'hex',
      );

  await this.putObject({
    bucket,
    objectKey,
    buffer:
      file.buffer,
    mimeType,
  });

  const asset =
    await this.prisma.media_assets.create({
      data: {
        uploaded_by_user_id:
          user.id,

        storage_provider:
          'MINIO',

        bucket_name:
          bucket,

        object_key:
          objectKey,

        original_filename:
          file.originalname,

        stored_filename:
          storedFilename,

        file_extension:
          extension.replace(
            '.',
            '',
          ),

        mime_type:
          mimeType,

        media_type:
          'IMAGE',

        visibility:
          'PUBLIC',

        status:
          'PUBLISHED',

        size_bytes:
          file.size,

        checksum_sha256:
          checksum,

        title:
          file.originalname,

        alt_text:
          file.originalname,

        metadata: {
          module:
            'VIDEOS',

          uploadPurpose:
            'THUMBNAIL',

          regionalAssociationId:
            context.associationId,

          uploadedByRole:
            user.role,
        },
      },
    });

  return {
    id:
      asset.id,

    url:
      this.mediaUrl(
        asset.object_key,
      ),

    mediaType:
      asset.media_type,

    originalFilename:
      asset.original_filename,

    mimeType:
      asset.mime_type,

    sizeBytes:
      Number(
        asset.size_bytes,
      ),

    associationId:
      context.associationId,
  };
}

private getPublicBucket() {
  return (
    this.config.get<string>(
      'S3_PUBLIC_BUCKET',
    ) ||
    this.config.get<string>(
      'MINIO_PUBLIC_BUCKET',
    ) ||
    'flascam-public'
  );
}

private normalizeFolder(
  folder: string,
) {
  const normalized =
    folder
      .trim()
      .replace(
        /^\/+|\/+$/g,
        '',
      )
      .replace(
        /[^a-zA-Z0-9/_-]/g,
        '',
      )
      .replace(
        /\/{2,}/g,
        '/',
      );

  if (
    !normalized
  ) {
    throw new BadRequestException(
      'Le dossier de stockage est invalide.',
    );
  }

  if (
    normalized.includes(
      '..',
    )
  ) {
    throw new BadRequestException(
      'Le dossier de stockage est invalide.',
    );
  }

  return normalized;
}

private async putObject(
  input: {
    bucket: string;
    objectKey: string;
    buffer: Buffer;
    mimeType: string;
  },
) {
  const s3 =
    new S3Client({
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
        ) ===
        'true',

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
        Bucket:
          input.bucket,

        Key:
          input.objectKey,

        Body:
          input.buffer,

        ContentType:
          input.mimeType,

        /*
         * Empêche le navigateur d’essayer d’interpréter
         * le fichier comme du HTML ou du script.
         */
        ContentDisposition:
          'inline',

        CacheControl:
          'public, max-age=31536000, immutable',

        Metadata: {
          uploadedFor:
            'videos',
        },
      }),
    );
  } catch {
    throw new BadGatewayException(
      'Impossible de joindre le serveur de stockage MinIO.',
    );
  }
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