import { eq, count, isNull, and, lt } from "drizzle-orm";
import { db } from "config/db";
import { listingImages } from "./listingImages.model";
import { uploadToR2, deleteFromR2, copyInR2, getKeyFromUrl } from "plugins/r2";
import {
  ListingImageResponse,
  PendingImageResponse,
  MAX_IMAGES_PER_LISTING,
  MAX_IMAGES_PER_SESSION,
  PENDING_IMAGE_EXPIRY_HOURS,
} from "./listingImages.types";
import { ConflictError } from "utils/errors";

export const ListingImageService = {
  async getImagesByListingId(
    listingId: number,
  ): Promise<ListingImageResponse[]> {
    const images = await db
      .select({
        id: listingImages.id,
        url: listingImages.url,
        listingId: listingImages.listingId,
        uploadSessionId: listingImages.uploadSessionId,
        createdAt: listingImages.createdAt,
      })
      .from(listingImages)
      .where(eq(listingImages.listingId, listingId));

    return images;
  },

  async getImagesBySessionId(
    sessionId: string,
  ): Promise<PendingImageResponse[]> {
    const images = await db
      .select({
        id: listingImages.id,
        url: listingImages.url,
        uploadSessionId: listingImages.uploadSessionId,
        createdAt: listingImages.createdAt,
      })
      .from(listingImages)
      .where(
        and(
          eq(listingImages.uploadSessionId, sessionId),
          isNull(listingImages.listingId),
        ),
      );

    return images as PendingImageResponse[];
  },

  async getImageById(imageId: number): Promise<ListingImageResponse | null> {
    const [image] = await db
      .select({
        id: listingImages.id,
        url: listingImages.url,
        listingId: listingImages.listingId,
        uploadSessionId: listingImages.uploadSessionId,
        createdAt: listingImages.createdAt,
      })
      .from(listingImages)
      .where(eq(listingImages.id, imageId))
      .limit(1);

    return image || null;
  },

  async getImageCount(listingId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(listingImages)
      .where(eq(listingImages.listingId, listingId));

    return result?.count ?? 0;
  },

  async getSessionImageCount(sessionId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(listingImages)
      .where(
        and(
          eq(listingImages.uploadSessionId, sessionId),
          isNull(listingImages.listingId),
        ),
      );

    return result?.count ?? 0;
  },

  async uploadImage(
    listingId: number,
    fileBuffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<ListingImageResponse> {
    const currentCount = await this.getImageCount(listingId);
    if (currentCount >= MAX_IMAGES_PER_LISTING) {
      throw new ConflictError(
        `Maximum of ${MAX_IMAGES_PER_LISTING} images per listing reached`,
      );
    }

    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `listings/${listingId}/${timestamp}-${sanitizedFilename}`;

    const url = await uploadToR2(key, fileBuffer, mimetype);

    const [newImage] = await db
      .insert(listingImages)
      .values({
        url,
        listingId,
      })
      .returning({
        id: listingImages.id,
        url: listingImages.url,
        listingId: listingImages.listingId,
        uploadSessionId: listingImages.uploadSessionId,
        createdAt: listingImages.createdAt,
      });

    return newImage;
  },

  async uploadPendingImage(
    sessionId: string,
    fileBuffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<PendingImageResponse> {
    const currentCount = await this.getSessionImageCount(sessionId);
    if (currentCount >= MAX_IMAGES_PER_SESSION) {
      throw new ConflictError(
        `Maximum of ${MAX_IMAGES_PER_SESSION} images per upload session reached`,
      );
    }

    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `pending/${sessionId}/${timestamp}-${sanitizedFilename}`;

    const url = await uploadToR2(key, fileBuffer, mimetype);

    const [newImage] = await db
      .insert(listingImages)
      .values({
        url,
        uploadSessionId: sessionId,
      })
      .returning({
        id: listingImages.id,
        url: listingImages.url,
        uploadSessionId: listingImages.uploadSessionId,
        createdAt: listingImages.createdAt,
      });

    return newImage as PendingImageResponse;
  },

  async associateImagesToListing(
    sessionId: string,
    listingId: number,
  ): Promise<number> {
    const pendingImages = await this.getImagesBySessionId(sessionId);

    if (pendingImages.length === 0) {
      return 0;
    }

    const currentCount = await this.getImageCount(listingId);
    const availableSlots = MAX_IMAGES_PER_LISTING - currentCount;

    if (pendingImages.length > availableSlots) {
      throw new ConflictError(
        `Cannot associate ${pendingImages.length} images. Only ${availableSlots} slots available.`,
      );
    }

    for (const image of pendingImages) {
      const oldKey = getKeyFromUrl(image.url);
      const timestamp = Date.now();
      const filename = oldKey.split("/").pop() || "";
      const newKey = `listings/${listingId}/${timestamp}-${filename}`;

      const newUrl = await copyInR2(oldKey, newKey);
      await deleteFromR2(oldKey);

      await db
        .update(listingImages)
        .set({
          url: newUrl,
          listingId,
          uploadSessionId: null,
        })
        .where(eq(listingImages.id, image.id));
    }

    return pendingImages.length;
  },

  async deleteImage(imageId: number): Promise<boolean> {
    const image = await this.getImageById(imageId);
    if (!image) {
      return false;
    }

    const key = getKeyFromUrl(image.url);
    await deleteFromR2(key);

    const result = await db
      .delete(listingImages)
      .where(eq(listingImages.id, imageId))
      .returning({ id: listingImages.id });

    return result.length > 0;
  },

  async deletePendingImage(
    imageId: number,
    sessionId: string,
  ): Promise<boolean> {
    const image = await this.getImageById(imageId);
    if (
      !image ||
      image.uploadSessionId !== sessionId ||
      image.listingId !== null
    ) {
      return false;
    }

    const key = getKeyFromUrl(image.url);
    await deleteFromR2(key);

    const result = await db
      .delete(listingImages)
      .where(eq(listingImages.id, imageId))
      .returning({ id: listingImages.id });

    return result.length > 0;
  },

  async cleanupExpiredPendingImages(): Promise<number> {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() - PENDING_IMAGE_EXPIRY_HOURS);

    const expiredImages = await db
      .select({
        id: listingImages.id,
        url: listingImages.url,
      })
      .from(listingImages)
      .where(
        and(
          isNull(listingImages.listingId),
          lt(listingImages.createdAt, expiryDate),
        ),
      );

    for (const image of expiredImages) {
      const key = getKeyFromUrl(image.url);
      await deleteFromR2(key);
    }

    if (expiredImages.length > 0) {
      await db
        .delete(listingImages)
        .where(
          and(
            isNull(listingImages.listingId),
            lt(listingImages.createdAt, expiryDate),
          ),
        );
    }

    return expiredImages.length;
  },

  async deleteImagesByListingId(listingId: number): Promise<number> {
    const images = await this.getImagesByListingId(listingId);

    for (const image of images) {
      const key = getKeyFromUrl(image.url);
      await deleteFromR2(key);
    }

    if (images.length > 0) {
      await db
        .delete(listingImages)
        .where(eq(listingImages.listingId, listingId));
    }

    return images.length;
  },
};
