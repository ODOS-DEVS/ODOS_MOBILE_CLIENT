import { useCallback, useState } from "react";

import {
  markAppReviewDeclined,
  openAppStoreListing,
  recordDeliveredOrderPrompt,
  requestNativeAppReview,
  shouldShowDeliveredOrderReviewPrompt,
  submitAppReview,
} from "@/utils/appReview";

type PromptContext = {
  source: "manual" | "delivered_order";
  orderId?: string;
};

export function useAppReview() {
  const [visible, setVisible] = useState(false);
  const [context, setContext] = useState<PromptContext>({ source: "manual" });

  const openPrompt = useCallback((nextContext: PromptContext = { source: "manual" }) => {
    setContext(nextContext);
    setVisible(true);
  }, []);

  const closePrompt = useCallback(() => {
    setVisible(false);
  }, []);

  const promptFromProfile = useCallback(() => {
    openPrompt({ source: "manual" });
  }, [openPrompt]);

  const maybePromptAfterDelivery = useCallback(
    async (orderId: string) => {
      const shouldPrompt = await shouldShowDeliveredOrderReviewPrompt(orderId);
      if (!shouldPrompt) {
        return false;
      }

      await recordDeliveredOrderPrompt(orderId);
      openPrompt({ source: "delivered_order", orderId });
      return true;
    },
    [openPrompt],
  );

  const handleRate = useCallback(async () => {
    closePrompt();
    try {
      await submitAppReview(context.source, context.orderId);
    } catch {
      await requestNativeAppReview().catch(() => openAppStoreListing());
    }
  }, [closePrompt, context.orderId, context.source]);

  const handleDismiss = useCallback(async () => {
    closePrompt();
    await markAppReviewDeclined();
  }, [closePrompt]);

  return {
    visible,
    openPrompt,
    closePrompt,
    promptFromProfile,
    maybePromptAfterDelivery,
    handleRate,
    handleDismiss,
  };
}
