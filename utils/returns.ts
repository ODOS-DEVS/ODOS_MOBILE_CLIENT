import type { ThemeColors } from "@/constants/theme";
import type { ReturnRequest } from "@/hooks/useOrders";

export const OPEN_RETURN_STATUSES = new Set(["requested", "under_review", "approved"]);

export function isOpenReturnStatus(status: string) {
  return OPEN_RETURN_STATUSES.has(status);
}

export type ReturnStatusMeta = {
  label: string;
  backgroundColor: string;
  textColor: string;
};

export function getReturnStatusMeta(
  status: ReturnRequest["status"],
  colors: ThemeColors,
): ReturnStatusMeta {
  switch (status) {
    case "requested":
      return { label: "Requested", backgroundColor: colors.warningSoft, textColor: colors.warningText };
    case "under_review":
      return { label: "Under Review", backgroundColor: colors.infoSoft, textColor: colors.infoText };
    case "approved":
      return { label: "Approved", backgroundColor: colors.successSoft, textColor: colors.successText };
    case "rejected":
      return { label: "Declined", backgroundColor: colors.dangerSoft, textColor: colors.dangerText };
    case "refunded":
      return { label: "Refunded", backgroundColor: colors.successSoft, textColor: colors.successText };
    case "exchanged":
      return { label: "Exchanged", backgroundColor: colors.infoSoft, textColor: colors.infoText };
    default:
      return {
        label: status.replace(/_/g, " "),
        backgroundColor: colors.surfaceMuted,
        textColor: colors.textSecondary,
      };
  }
}
