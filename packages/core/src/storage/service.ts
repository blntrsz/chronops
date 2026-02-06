import { Effect, Schema } from "effect";
import { S3 } from "@effect-aws/client-s3";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.S3_BUCKET || "chronops-pdfs";
const PRESIGN_EXPIRY = parseInt(process.env.S3_PRESIGN_EXPIRY_SECONDS || "300", 10);

/**
 * Error thrown when storage operations fail.
 * @since 1.0.0
 * @category errors
 */
export class StorageError extends Schema.TaggedError<StorageError>("StorageError")("StorageError", {
  cause: Schema.Unknown,
}) {}

/**
 * Service for S3 storage operations including signed URLs and object retrieval.
 * @since 1.0.0
 * @category service
 */
export class StorageService extends Effect.Service<StorageService>()("StorageService", {
  effect: Effect.gen(function* () {
    const s3 = yield* S3.S3;

    /**
     * Generate a presigned URL for uploading an object to S3.
     * @since 1.0.0
     * @category service-method
     */
    const getSignedUploadUrl = Effect.fn(function* (key: string, contentType: string) {
      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
      });

      const url = yield* Effect.tryPromise({
        try: () => getSignedUrl(s3, command, { expiresIn: PRESIGN_EXPIRY }),
        catch: (error) => new StorageError({ cause: error }),
      });

      return url;
    });

    /**
     * Generate a presigned URL for downloading an object from S3.
     * @since 1.0.0
     * @category service-method
     */
    const getSignedDownloadUrl = Effect.fn(function* (key: string) {
      const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
      });

      const url = yield* Effect.tryPromise({
        try: () => getSignedUrl(s3, command, { expiresIn: PRESIGN_EXPIRY }),
        catch: (error) => new StorageError({ cause: error }),
      });

      return url;
    });

    /**
     * Get an object directly from S3.
     * @since 1.0.0
     * @category service-method
     */
    const getObject = Effect.fn(function* (key: string) {
      const result = yield* s3.getObject({
        Bucket: BUCKET,
        Key: key,
      }).pipe(
        Effect.catchAll((error) => new StorageError({ cause: error }))
      );

      return result;
    });

    return {
      getSignedUploadUrl,
      getSignedDownloadUrl,
      getObject,
    };
  }),
}) {}
