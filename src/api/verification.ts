import { apiClient } from "./client";
import type {
  DocumentType,
  VerificationDocument,
  VerificationHistoryEntry,
  VerificationStatusResponse,
} from "@/types";

export type {
  DocumentType,
  VerificationDocument,
  VerificationHistoryEntry,
  VerificationStatusResponse,
};

export const verificationApi = {
  async getStatus(listingId: number): Promise<VerificationStatusResponse> {
    const response = await apiClient.get<VerificationStatusResponse>(
      `/listings/${listingId}/verification`
    );
    return response.data;
  },

  async getDocuments(listingId: number): Promise<VerificationDocument[]> {
    const response = await apiClient.get<{ documents: VerificationDocument[] }>(
      `/listings/${listingId}/verification/documents`
    );
    return response.data.documents;
  },

  async getHistory(listingId: number): Promise<VerificationHistoryEntry[]> {
    const response = await apiClient.get<{ history: VerificationHistoryEntry[] }>(
      `/listings/${listingId}/verification/history`
    );
    return response.data.history;
  },

  async uploadDocument(
    listingId: number,
    file: File,
    documentType: DocumentType
  ): Promise<VerificationDocument> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    const response = await apiClient.post<{ document: VerificationDocument }>(
      `/listings/${listingId}/verification/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.document;
  },

  async deleteDocument(listingId: number, documentId: number): Promise<void> {
    await apiClient.delete(
      `/listings/${listingId}/verification/documents/${documentId}`
    );
  },
};
