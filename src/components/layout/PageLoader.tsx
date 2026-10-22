import { Loader2 } from "lucide-react";
import { PageLayout } from "./PageLayout";

export function PageLoader() {
  return (
    <PageLayout>
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </PageLayout>
  );
}
