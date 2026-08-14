import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

interface BackButtonProps {
  to?: string;
  label: string;
  className?: string;
}

export function BackButton({ to, label, className }: BackButtonProps) {
  const navigate = useNavigate();

  if (to) {
    return (
      <Button variant="ghost" asChild className={className || "mb-6 -ml-2"}>
        <Link to={to}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={() => navigate(-1)}
      className={className || "mb-6 -ml-2"}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
