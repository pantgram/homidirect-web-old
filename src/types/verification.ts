import type { VerificationStatus } from "./listing";

export type DocumentType =
  | "UTILITY_BILL"
  | "TITLE_DEED"
  | "LEASE_AGREEMENT"
  | "PROPERTY_TAX"
  | "OTHER";

export interface VerificationDocument {
  id: number;
  listingId: number;
  documentType: DocumentType;
  url: string;
  fileName: string;
  uploadedBy: number;
  createdAt: string;
}

export interface VerificationHistoryEntry {
  id: number;
  listingId: number;
  previousStatus: string | null;
  newStatus: string;
  notes: string | null;
  reviewedBy: number | null;
  createdAt: string;
}

export interface VerificationStatusResponse {
  listingId: number;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  documents: VerificationDocument[];
  history: VerificationHistoryEntry[];
  canResubmit: boolean;
}

export interface PendingVerificationListing {
  id: number;
  title: string;
  city: string;
  landlordId: number;
  verificationStatus: VerificationStatus;
  createdAt: string;
  documents: VerificationDocument[];
}
