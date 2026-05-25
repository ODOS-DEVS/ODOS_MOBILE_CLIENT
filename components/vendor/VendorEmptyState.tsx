import { AccountEmptyState } from "@/components/account/AccountUi";
import type { Ionicons } from "@expo/vector-icons";
import React from "react";

type VendorEmptyStateProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function VendorEmptyState({
  actionLabel,
  icon,
  message,
  onAction,
  title,
}: VendorEmptyStateProps) {
  return (
    <AccountEmptyState
      icon={icon}
      title={title}
      message={message}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}
