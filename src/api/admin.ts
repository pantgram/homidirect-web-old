import { apiClient } from "./client";
import type { ReviewVerificationRequest, ReviewVerificationResponse, PendingVerificationListing } from "@/types";

export const adminVerificationsApi = {
  async getPending(): Promise<PendingVerificationListing[]> {
    const response = await apiClient.get<{ listings: PendingVerificationListing[] }>(
      "/admin/verifications/pending"
    );
    return response.data.listings;
  },

  async review(
    listingId: number,
    data: ReviewVerificationRequest
  ): Promise<ReviewVerificationResponse> {
    const response = await apiClient.post<ReviewVerificationResponse>(
      `/admin/verifications/${listingId}/verification/review`,
      data
    );
    return response.data;
  },
};
