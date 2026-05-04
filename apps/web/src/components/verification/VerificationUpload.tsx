import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Info,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  useVerificationStatus,
  useUploadVerificationDocument,
  useDeleteVerificationDocument,
} from "@/hooks/useVerification";
import { useLanguage } from "@/contexts/LanguageContext";
import type {
  DocumentType,
  VerificationDocument,
  VerificationHistoryEntry,
  VerificationStatus,
} from "@/api";

interface VerificationUploadProps {
  listingId: number;
  listingTitle?: string;
}

const DOCUMENT_TYPES: DocumentType[] = [
  "UTILITY_BILL",
  "TITLE_DEED",
  "LEASE_AGREEMENT",
  "PROPERTY_TAX",
  "OTHER",
];

const DOC_TYPE_KEY: Record<DocumentType, string> = {
  UTILITY_BILL: "utilityBill",
  TITLE_DEED: "titleDeed",
  LEASE_AGREEMENT: "leaseAgreement",
  PROPERTY_TAX: "propertyTax",
  OTHER: "other",
};

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string, language: string): string {
  return new Date(dateString).toLocaleDateString(language === "el" ? "el-GR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusConfig(status: VerificationStatus, t: (key: string) => string) {
  switch (status) {
    case "PENDING":
      return {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        badgeVariant: "secondary" as const,
        label: t("verification.status.pending"),
        description: t("verification.status.pendingDesc"),
      };
    case "APPROVED":
      return {
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        badgeVariant: "default" as const,
        label: t("verification.status.approved"),
        description: t("verification.status.approvedDesc"),
      };
    case "REJECTED":
      return {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        badgeVariant: "destructive" as const,
        label: t("verification.status.rejected"),
        description: t("verification.status.rejectedDesc"),
      };
  }
}

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  language: string;
}

function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isPdf = file.type === "application/pdf";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg",
          isPdf ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
        )}
      >
        {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={onRemove}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface DocumentCardProps {
  document: VerificationDocument;
  onDelete: (id: number) => void;
  isDeleting: boolean;
  canDelete: boolean;
  t: (key: string) => string;
  language: string;
}

function DocumentCard({ document, onDelete, isDeleting, canDelete, t, language }: DocumentCardProps) {
  const isPdf = document.fileName.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
          isPdf ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
        )}
      >
        {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{document.fileName}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {t(`verification.docType.${DOC_TYPE_KEY[document.documentType]}` as any)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(document.createdAt, language)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8"
        >
          <a href={document.url} target="_blank" rel="noopener noreferrer">
            {t("verification.view")}
          </a>
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(document.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

interface VerificationTimelineProps {
  history: VerificationHistoryEntry[];
  t: (key: string) => string;
  language: string;
}

function VerificationTimeline({ history, t, language }: VerificationTimelineProps) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">{t("verification.history")}</h4>
      <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
        {history.map((entry, index) => {
          const statusConfig = getStatusConfig(entry.newStatus as VerificationStatus, t);
          const Icon = statusConfig.icon;

          return (
            <div key={entry.id} className="relative">
              <div
                className={cn(
                  "absolute -left-6 w-4 h-4 rounded-full border-2 bg-background",
                  index === 0 ? statusConfig.borderColor : "border-muted"
                )}
              >
                <Icon
                  className={cn(
                    "w-2.5 h-2.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    index === 0 ? statusConfig.color : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={index === 0 ? statusConfig.badgeVariant : "outline"}
                    className="text-xs"
                  >
                    {entry.newStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(entry.createdAt, language)}
                  </span>
                </div>
                {entry.notes && (
                  <p className="text-sm text-muted-foreground">{entry.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VerificationUpload({ listingId, listingTitle }: VerificationUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("UTILITY_BILL");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useLanguage();

  const { data: verificationStatus, isLoading, error, refetch } = useVerificationStatus(listingId);
  const uploadMutation = useUploadVerificationDocument(listingId);
  const deleteMutation = useDeleteVerificationDocument(listingId);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return t("verification.invalidFileType");
    }
    if (file.size > MAX_FILE_SIZE) {
      return t("verification.fileTooLarge").replace("{size}", formatFileSize(MAX_FILE_SIZE));
    }
    return null;
  }, [t]);

  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      setSelectedFile(file);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        documentType,
      });

      setUploadProgress(100);
      clearInterval(progressInterval);

      toast.success(t("verification.docUploaded"));
      setSelectedFile(null);
      setUploadProgress(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      toast.error(err.response?.data?.message || t("verification.uploadFailed"));
    }
  }, [selectedFile, documentType, uploadMutation, t]);

  const handleDelete = useCallback(
    async (documentId: number) => {
      setDeletingId(documentId);
      try {
        await deleteMutation.mutateAsync(documentId);
        toast.success(t("verification.docDeleted"));
      } catch (err: any) {
        toast.error(err.response?.data?.message || t("verification.deleteFailed"));
      } finally {
        setDeletingId(null);
      }
    },
    [deleteMutation, t]
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("verification.errorTitle")}</AlertTitle>
        <AlertDescription>
          {t("verification.errorLoadingStatus")}
          <Button variant="link" className="p-0 h-auto ml-2" onClick={() => refetch()}>
            {t("verification.retry")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const status = verificationStatus?.verificationStatus || "PENDING";
  const statusConfig = getStatusConfig(status as VerificationStatus, t);
  const StatusIcon = statusConfig.icon;
  const canUpload = status !== "APPROVED";
  const canDelete = status !== "APPROVED";
  const documents = verificationStatus?.documents || [];
  const history = verificationStatus?.history || [];

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={cn("border-2", statusConfig.borderColor, statusConfig.bgColor)}>
        <CardContent className="flex items-start gap-4 p-4 sm:p-6">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full shrink-0",
              status === "PENDING" && "bg-yellow-100",
              status === "APPROVED" && "bg-green-100",
              status === "REJECTED" && "bg-red-100"
            )}
          >
            <StatusIcon className={cn("w-6 h-6", statusConfig.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{t("verification.statusTitle")}</h3>
              <Badge variant={statusConfig.badgeVariant}>{statusConfig.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{statusConfig.description}</p>
            {listingTitle && (
              <p className="text-sm font-medium mt-2">{t("verification.propertyLabel").replace("{title}", listingTitle)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rejection Alert with Resubmission CTA */}
      {status === "REJECTED" && verificationStatus?.canResubmit && (
        <Alert className="border-amber-200 bg-amber-50">
          <RefreshCw className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">{t("verification.resubmitAvailable")}</AlertTitle>
          <AlertDescription className="text-amber-700">
            {t("verification.resubmitDesc")}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      {canUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("verification.uploadTitle")}</CardTitle>
            <CardDescription>
              {t("verification.uploadDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Instructions */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t("verification.docRequirements")}</AlertTitle>
              <AlertDescription className="mt-2">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{t("verification.req1")}</li>
                  <li>{t("verification.req2")}</li>
                  <li>{t("verification.req3")}</li>
                  <li>{t("verification.req4")}</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Document Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("verification.docTypeLabel")}</label>
              <Select
                value={documentType}
                onValueChange={(value) => setDocumentType(value as DocumentType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex flex-col items-start">
                        <span>{t(`verification.docType.${DOC_TYPE_KEY[type]}` as any)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t(`verification.docTypeDesc.${DOC_TYPE_KEY[documentType]}` as any)}
              </p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                selectedFile && "border-solid border-primary/50 bg-primary/5"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleInputChange}
              />

              {selectedFile ? (
                <div className="space-y-4">
                  <FilePreview
                    file={selectedFile}
                    onRemove={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  />
                </div>
              ) : (
                <>
                  <Upload
                    className={cn(
                      "w-10 h-10 mx-auto mb-4",
                      isDragging ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <p className="text-sm font-medium">
                    {isDragging ? t("verification.dropHere") : t("verification.dragDrop")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("verification.orClickBrowse")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("verification.acceptedFormatsInfo")}
                  </p>
                </>
              )}
            </div>

            {/* Upload Progress */}
            {uploadMutation.isPending && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {t("verification.uploading").replace("{progress}", String(uploadProgress))}
                </p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t("verification.uploadingButton")}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {t("verification.uploadButton")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("verification.uploadedDocs")}</CardTitle>
            <CardDescription>
              {t("verification.docCount").replace("{count}", String(documents.length))}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDelete}
                isDeleting={deletingId === doc.id}
                canDelete={canDelete}
                t={t}
                language={language}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Verification History Timeline */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("verification.history")}</CardTitle>
          </CardHeader>
          <CardContent>
            <VerificationTimeline history={history} t={t} language={language} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
