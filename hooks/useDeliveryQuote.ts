import { fetchDeliveryQuote } from "@/services/deliveryApi";
import {
  buildDeliveryOptions,
  resolveActiveDeliveryMethod,
  resolveDeliveryAmount,
  type DeliveryMethodId,
  type DeliveryOption,
} from "@/utils/delivery";
import { useEffect, useMemo, useState } from "react";

type UseDeliveryQuoteResult = {
  options: DeliveryOption[];
  selectedMethod: DeliveryMethodId;
  shippingAmount: number;
  freeShippingThreshold: number;
  sameDayCutoffPassed: boolean;
  isLoading: boolean;
  error: string | null;
};

export function useDeliveryQuote(input: {
  subtotal: number;
  region?: string | null;
  city?: string | null;
  selectedMethod: DeliveryMethodId;
}): UseDeliveryQuoteResult {
  const [options, setOptions] = useState<DeliveryOption[]>(() =>
    buildDeliveryOptions({
      subtotal: input.subtotal,
      region: input.region,
      city: input.city,
    }),
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(299);
  const [sameDayCutoffPassed, setSameDayCutoffPassed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fallback = buildDeliveryOptions({
      subtotal: input.subtotal,
      region: input.region,
      city: input.city,
    });

    setOptions(fallback);
    setIsLoading(true);
    setError(null);

    void fetchDeliveryQuote({
      subtotal: input.subtotal,
      region: input.region,
      city: input.city,
      selectedMethod: input.selectedMethod,
    })
      .then((quote) => {
        if (cancelled) {
          return;
        }
        setOptions(quote.options);
        setFreeShippingThreshold(quote.freeShippingThreshold);
        setSameDayCutoffPassed(quote.sameDayCutoffPassed);
        setError(null);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setOptions(fallback);
        setError("Using estimated rates until the server quote loads.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [input.city, input.region, input.selectedMethod, input.subtotal]);

  const selectedMethod = useMemo(
    () => resolveActiveDeliveryMethod(options, input.selectedMethod),
    [input.selectedMethod, options],
  );

  const shippingAmount = useMemo(
    () => resolveDeliveryAmount(options, selectedMethod),
    [options, selectedMethod],
  );

  return {
    options,
    selectedMethod,
    shippingAmount,
    freeShippingThreshold,
    sameDayCutoffPassed,
    isLoading,
    error,
  };
}
