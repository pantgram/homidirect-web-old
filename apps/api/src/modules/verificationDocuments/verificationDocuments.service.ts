import { eq, desc } from "drizzle-orm";
import { db } from "config/db";
import { verificationDocuments } from "./verificationDocuments.model";
import { verificationHistory } from "modules/verificationHistory/verificationHistory.model";
import { listings } from "modules/listings/listings.model";
import { uploadToR2, deleteFromR2, getKeyFromUrl } from "plugins/r2";
import {
  VerificationDocumentResponse,
  VerificationStatusResponse,
  VerificationHistoryResponse,
  DocumentType,
} from "./verificationDocuments.types";
import { NotFoundError, ValidationError, ForbiddenError } from "utils/errors";

export const VerificationDocumentService = {
  async getDocumentsByListingId(
    listingId: number,
  ): Promise<VerificationDocumentResponse[]> {
    const docs = await db
      .select({
        id: verificationDocuments.id,
        listingId: verificationDocuments.listingId,
        documentType: verificationDocuments.documentType,
        url: verificationDocuments.url,
        fileName: verificationDocuments.fileName,
        uploadedBy: verificationDocuments.uploadedBy,
        createdAt: verificationDocuments.createdAt,
      })
      .from(verificationDocuments)
      .where(eq(verificationDocuments.listingId, listingId))
      .orderBy(desc(verificationDocuments.createdAt));

    return docs as VerificationDocumentResponse[];
  },

  async getVerificationHistory(
    listingId: number,
  ): Promise<VerificationHistoryResponse[]> {
    const history = await db
      .select({
        id: verificationHistory.id,
        listingId: verificationHistory.listingId,
        previousStatus: verificationHistory.previousStatus,
        newStatus: verificationHistory.newStatus,
        notes: verificationHistory.notes,
        reviewedBy: verificationHistory.reviewedBy,
        createdAt: verificationHistory.createdAt,
      })
      .from(verificationHistory)
      .where(eq(verificationHistory.listingId, listingId))
      .orderBy(desc(verificationHistory.createdAt));

    return history as VerificationHistoryResponse[];
  },

  async getVerificationStatus(
    listingId: number,
  ): Promise<VerificationStatusResponse> {
    const [listing] = await db
      .select({
        id: listings.id,
        verificationStatus: listings.verificationStatus,
        verifiedAt: listings.verifiedAt,
      })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    const documents = await this.getDocumentsByListingId(listingId);
    const history = await this.getVerificationHistory(listingId);

    // Can resubmit if status is REJECTED
    const canResubmit = listing.verificationStatus === "REJECTED";

    return {
      listingId: listing.id,
      verificationStatus: listing.verificationStatus,
      verifiedAt: listing.verifiedAt,
      documents,
      history,
      canResubmit,
    };
  },

  async uploadDocument(
    listingId: number,
    userId: number,
    documentType: DocumentType,
    fileBuffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<VerificationDocumentResponse> {
    // Check listing exists and get current status
    const [listing] = await db
      .select({
        id: listings.id,
        verificationStatus: listings.verificationStatus,
        landlordId: listings.landlordId,
      })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    // Only allow upload if status is PENDING or REJECTED (resubmission)
    if (listing.verificationStatus === "APPROVED") {
      throw new ValidationError(
        "Cannot upload documents for an already approved listing",
      );
    }

    // Upload to R2
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `listings/${listingId}/documents/${timestamp}-${sanitizedFilename}`;

    const url = await uploadToR2(key, fileBuffer, mimetype);

    // Insert document record
    const [newDocument] = await db
      .insert(verificationDocuments)
      .values({
        listingId,
        documentType,
        url,
        fileName: filename,
        uploadedBy: userId,
      })
      .returning({
        id: verificationDocuments.id,
        listingId: verificationDocuments.listingId,
        documentType: verificationDocuments.documentType,
        url: verificationDocuments.url,
        fileName: verificationDocuments.fileName,
        uploadedBy: verificationDocuments.uploadedBy,
        createdAt: verificationDocuments.createdAt,
      });

    // If this is a resubmission (status was REJECTED), update to PENDING
    if (listing.verificationStatus === "REJECTED") {
      await db
        .update(listings)
        .set({ verificationStatus: "PENDING" })
        .where(eq(listings.id, listingId));

      // Add history entry for resubmission
      await db.insert(verificationHistory).values({
        listingId,
        previousStatus: "REJECTED",
        newStatus: "PENDING",
        notes: "Documents resubmitted for review",
      });
    }

    return newDocument as VerificationDocumentResponse;
  },

  async deleteDocument(
    documentId: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<boolean> {
    const [document] = await db
      .select({
        id: verificationDocuments.id,
        url: verificationDocuments.url,
        listingId: verificationDocuments.listingId,
        uploadedBy: verificationDocuments.uploadedBy,
      })
      .from(verificationDocuments)
      .where(eq(verificationDocuments.id, documentId))
      .limit(1);

    if (!document) {
      return false;
    }

    // Check ownership unless admin
    if (!isAdmin && document.uploadedBy !== userId) {
      throw new ForbiddenError("You can only delete your own documents");
    }

    // Check listing status
    const [listing] = await db
      .select({ verificationStatus: listings.verificationStatus })
      .from(listings)
      .where(eq(listings.id, document.listingId))
      .limit(1);

    if (listing && listing.verificationStatus === "APPROVED") {
      throw new ValidationError(
        "Cannot delete documents from an approved listing",
      );
    }

    // Delete from R2
    const key = getKeyFromUrl(document.url);
    await deleteFromR2(key);

    // Delete from database
    const result = await db
      .delete(verificationDocuments)
      .where(eq(verificationDocuments.id, documentId))
      .returning({ id: verificationDocuments.id });

    return result.length > 0;
  },

  async reviewVerification(
    listingId: number,
    reviewerId: number,
    status: "APPROVED" | "REJECTED",
    notes?: string,
  ): Promise<void> {
    const [listing] = await db
      .select({
        id: listings.id,
        verificationStatus: listings.verificationStatus,
      })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    if (listing.verificationStatus === status) {
      throw new ValidationError(`Listing is already ${status.toLowerCase()}`);
    }

    // Update listing status
    await db
      .update(listings)
      .set({
        verificationStatus: status,
        verifiedAt: status === "APPROVED" ? new Date() : null,
        verifiedBy: status === "APPROVED" ? reviewerId : null,
      })
      .where(eq(listings.id, listingId));

    // Add history entry
    await db.insert(verificationHistory).values({
      listingId,
      previousStatus: listing.verificationStatus,
      newStatus: status,
      notes: notes || null,
      reviewedBy: reviewerId,
    });
  },

  async getPendingVerifications(): Promise<any[]> {
    const pendingListings = await db
      .select({
        id: listings.id,
        title: listings.title,
        city: listings.city,
        landlordId: listings.landlordId,
        verificationStatus: listings.verificationStatus,
        createdAt: listings.createdAt,
      })
      .from(listings)
      .where(eq(listings.verificationStatus, "PENDING"))
      .orderBy(listings.createdAt);

    // Get documents for each listing
    const result = await Promise.all(
      pendingListings.map(async (listing) => {
        const documents = await this.getDocumentsByListingId(listing.id);
        return {
          ...listing,
          documents,
        };
      }),
    );

    return result;
  },
};
