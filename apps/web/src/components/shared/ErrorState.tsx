import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useLanguage();

  return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <p className="text-destructive text-lg mb-2">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          {t("common.tryAgain")}
        </Button>
      )}
    </div>
  );
}
