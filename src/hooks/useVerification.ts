import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  verificationApi,
  type DocumentType,
  type VerificationStatusResponse,
  type VerificationDocument,
} from "@/api";

export const verificationKeys = {
  all: ["verification"] as const,
  status: (listingId: number) => [...verificationKeys.all, "status", listingId] as const,
  documents: (listingId: number) =>
    [...verificationKeys.all, "documents", listingId] as const,
  history: (listingId: number) =>
    [...verificationKeys.all, "history", listingId] as const,
  pending: () => [...verificationKeys.all, "pending"] as const,
};

export function useVerificationStatus(listingId: number) {
  return useQuery<VerificationStatusResponse>({
    queryKey: verificationKeys.status(listingId),
    queryFn: () => verificationApi.getStatus(listingId),
    enabled: !!listingId,
  });
}

export function useVerificationDocuments(listingId: number) {
  return useQuery<VerificationDocument[]>({
    queryKey: verificationKeys.documents(listingId),
    queryFn: () => verificationApi.getDocuments(listingId),
    enabled: !!listingId,
  });
}

export function useUploadVerificationDocument(listingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      documentType,
    }: {
      file: File;
      documentType: DocumentType;
    }) => verificationApi.uploadDocument(listingId, file, documentType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: verificationKeys.status(listingId),
      });
      queryClient.invalidateQueries({
        queryKey: verificationKeys.documents(listingId),
      });
    },
  });
}

export function useDeleteVerificationDocument(listingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: number) =>
      verificationApi.deleteDocument(listingId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: verificationKeys.status(listingId),
      });
      queryClient.invalidateQueries({
        queryKey: verificationKeys.documents(listingId),
      });
    },
  });
}
