import type { VendorReturnQueueTab, VendorReturnRequest } from "@/types/store";

const OPEN_RETURN_STATUSES = new Set(["requested", "under_review", "approved"]);

export function isOpenVendorReturn(status: string) {
  return OPEN_RETURN_STATUSES.has(status);
}

export function filterVendorReturnsByTab(
  returns: VendorReturnRequest[],
  tab: VendorReturnQueueTab,
) {
  return returns.filter((item) =>
    tab === "open" ? isOpenVendorReturn(item.status) : !isOpenVendorReturn(item.status),
  );
}

export function formatVendorReturnStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatVendorReturnType(requestType: string) {
  if (requestType === "refund") {
    return "Refund request";
  }
  if (requestType === "exchange") {
    return "Exchange request";
  }
  return "Return request";
}
