import { fetchDeliveryQuote, type DeliveryQuoteItem } from "@/services/deliveryApi";
import {
  buildDeliveryOptions,
  FREE_SHIPPING_THRESHOLD,
  resolveActiveDeliveryMethod,
  resolveDeliveryAmount,
  type DeliveryMethodId,
  type DeliveryOption,
  type DeliveryPackageQuote,
} from "@/utils/delivery";
import { useEffect, useMemo, useState } from "react";

type UseDeliveryQuoteResult = {
  options: DeliveryOption[];
  selectedMethod: DeliveryMethodId;
  shippingAmount: number;
  freeShippingThreshold: number;
  sameDayCutoffPassed: boolean;
  /**
   * One entry per shop in the cart. Empty until the server quote lands, and
   * empty for a single-shop cart where there is nothing to break down.
   */
  packages: DeliveryPackageQuote[];
  isLoading: boolean;
  error: string | null;
};

export function useDeliveryQuote(input: {
  subtotal: number;
  region?: string | null;
  city?: string | null;
  selectedMethod: DeliveryMethodId;
  /**
   * The cart lines. Delivery is priced per shop, so without these the quote
   * can only guess with a single platform-default package — which is what the
   * local fallback below does while the server quote is in flight.
   */
  items?: DeliveryQuoteItem[];
}): UseDeliveryQuoteResult {
  const [options, setOptions] = useState<DeliveryOption[]>(() =>
    buildDeliveryOptions({
      subtotal: input.subtotal,
      region: input.region,
      city: input.city,
    }),
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(FREE_SHIPPING_THRESHOLD);
  const [packages, setPackages] = useState<DeliveryPackageQuote[]>([]);
  const [sameDayCutoffPassed, setSameDayCutoffPassed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The cart lines only matter to the quote by product/quantity/price, so the
  // effect keys off that rather than the array identity — which changes on
  // every render of the screen above and would otherwise refetch endlessly.
  const itemsKey = useMemo(
    () =>
      (input.items ?? [])
        .map((item) => `${item.product_id}:${item.quantity}:${item.unit_price}`)
        .join("|"),
    [input.items],
  );

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
      items: input.items,
    })
      .then((quote) => {
        if (cancelled) {
          return;
        }
        setOptions(quote.options);
        setFreeShippingThreshold(quote.freeShippingThreshold);
        setSameDayCutoffPassed(quote.sameDayCutoffPassed);
        setPackages(quote.packages);
        setError(null);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setOptions(fallback);
        // Cleared rather than left stale: a breakdown that no longer matches
        // the estimate above it is worse than no breakdown.
        setPackages([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.city, input.region, input.selectedMethod, input.subtotal, itemsKey]);

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
    packages,
    isLoading,
    error,
  };
}
