import { useAuth } from "@/context/AuthContext";
import {
  formatPhoneInput,
  isGhanaPhoneVerified,
  normalizeGhanaPhone,
  validateGhanaPhone,
} from "@/utils/phone";
import { useCallback, useEffect, useMemo, useState } from "react";

type UsePhoneVerificationOptions = {
  /** When true, a successful verify also updates the account profile phone. */
  linkToProfile?: boolean;
  /** Skip OTP when this number was already verified on the account. */
  skipIfVerified?: boolean;
  /** Treat as verified when it matches this saved value (e.g. unchanged address phone). */
  treatAsVerifiedIf?: string | null;
};

export function usePhoneVerification(
  rawPhone: string,
  options: UsePhoneVerificationOptions = {},
) {
  const linkToProfile = options.linkToProfile ?? false;
  const skipIfVerified = options.skipIfVerified ?? true;
  const treatAsVerifiedIf = options.treatAsVerifiedIf ?? null;
  const normalizedTreatAsVerified = useMemo(
    () =>
      treatAsVerifiedIf ? normalizeGhanaPhone(formatPhoneInput(treatAsVerifiedIf)) : null,
    [treatAsVerifiedIf],
  );

  const {
    user,
    accessToken,
    isSendingPhoneVerificationCode,
    isVerifyingPhoneNumber,
    sendPhoneVerificationCode,
    verifyPhoneNumber,
    fetchVerifiedPhones,
    verifiedPhones,
  } = useAuth();

  const [codeSent, setCodeSent] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const normalizedPhone = useMemo(
    () => normalizeGhanaPhone(formatPhoneInput(rawPhone)),
    [rawPhone],
  );

  const phoneValidationError = useMemo(() => {
    const trimmed = rawPhone.trim();
    if (!trimmed) {
      return null;
    }
    return validateGhanaPhone(trimmed);
  }, [rawPhone]);

  const isVerified = useMemo(() => {
    if (!normalizedPhone || phoneValidationError) {
      return false;
    }

    if (
      normalizedTreatAsVerified &&
      normalizedPhone === normalizedTreatAsVerified
    ) {
      return true;
    }

    if (skipIfVerified) {
      if (
        isGhanaPhoneVerified(
          normalizedPhone,
          user?.phone_number,
          user?.phone_verified ?? false,
        )
      ) {
        return true;
      }

      if (verifiedPhones.includes(normalizedPhone)) {
        return true;
      }
    }

    return false;
  }, [
    normalizedPhone,
    normalizedTreatAsVerified,
    phoneValidationError,
    skipIfVerified,
    user?.phone_number,
    user?.phone_verified,
    verifiedPhones,
  ]);

  const showVerificationPanel = Boolean(
    normalizedPhone && !phoneValidationError && !isVerified,
  );

  useEffect(() => {
    setCodeSent(false);
    setVerificationError("");
  }, [normalizedPhone]);

  useEffect(() => {
    if (accessToken) {
      void fetchVerifiedPhones();
    }
  }, [accessToken, fetchVerifiedPhones]);

  const handleSendCode = useCallback(async () => {
    if (!normalizedPhone) {
      return {
        success: false,
        fieldErrors: { general: "Enter a valid phone number first." },
      };
    }

    setVerificationError("");
    const result = await sendPhoneVerificationCode(normalizedPhone, {
      linkToProfile,
    });
    if (result.success) {
      setCodeSent(true);
    } else {
      setVerificationError(
        result.fieldErrors?.general ||
          result.fieldErrors?.phoneNumber ||
          "We couldn't send a code.",
      );
    }
    return result;
  }, [linkToProfile, normalizedPhone, sendPhoneVerificationCode]);

  const handleVerify = useCallback(
    async (code: string) => {
      if (!normalizedPhone) {
        return {
          success: false,
          fieldErrors: { general: "Enter a valid phone number first." },
        };
      }

      setVerificationError("");
      const result = await verifyPhoneNumber(normalizedPhone, code, {
        linkToProfile,
      });
      if (!result.success) {
        setVerificationError(
          result.fieldErrors?.general || "That code could not be verified.",
        );
      } else {
        setCodeSent(false);
        await fetchVerifiedPhones();
      }
      return result;
    },
    [fetchVerifiedPhones, linkToProfile, normalizedPhone, verifyPhoneNumber],
  );

  return {
    normalizedPhone,
    phoneValidationError,
    isVerified,
    showVerificationPanel,
    codeSent,
    verificationError,
    setVerificationError,
    isSendingCode: isSendingPhoneVerificationCode,
    isVerifying: isVerifyingPhoneNumber,
    handleSendCode,
    handleVerify,
  };
}
