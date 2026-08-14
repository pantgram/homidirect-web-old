import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: LucideIcon;
  className: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  PENDING: {
    label: "Pending",
    variant: "secondary",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  CONFIRMED: {
    label: "Confirmed",
    variant: "default",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  DECLINED: {
    label: "Declined",
    variant: "destructive",
    icon: XCircle,
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "outline",
    icon: Ban,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

interface BookingStatusBadgeProps {
  status: BookingStatus | string;
  showIcon?: boolean;
  className?: string;
}

export function BookingStatusBadge({ status, showIcon = true, className }: BookingStatusBadgeProps) {
  const config = statusConfigs[status] || {
    label: status,
    variant: "outline" as const,
    icon: Clock,
    className: "",
  };

  return (
    <Badge className={`${config.className} ${className || ""}`}>
      {showIcon && <config.icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
