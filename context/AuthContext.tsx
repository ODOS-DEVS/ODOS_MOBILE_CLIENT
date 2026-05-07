import {
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
} from "@/constants/auth";
import {
  normalizeRoles,
  normalizeVendorStatus,
  type AppRole,
  type VendorStatus,
} from "@/types/vendor";
import * as SecureStore from "expo-secure-store";
import { Alert, AppState } from "react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  city: string | null;
  region: string | null;
  allow_notifications: boolean;
  discount_notifications: boolean;
  store_notifications: boolean;
  system_notifications: boolean;
  location_notifications: boolean;
  location_updates: boolean;
  role: string;
  roles: AppRole[];
  vendorStatus: VendorStatus;
  vendorId: string | null;
  vendorRejectionReason: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

type ProfileUpdatePayload = {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  city?: string | null;
  region?: string | null;
  avatarUrl?: string | null;
  allowNotifications?: boolean;
  discountNotifications?: boolean;
  storeNotifications?: boolean;
  systemNotifications?: boolean;
  locationNotifications?: boolean;
  locationUpdates?: boolean;
};

type AuthFieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  region?: string;
  general?: string;
};

type AuthResult = {
  success: boolean;
  fieldErrors?: AuthFieldErrors;
  message?: string;
  requiresVerification?: boolean;
  user?: AuthUser | null;
  resetToken?: string;
};

type AuthContextType = {
  accessToken: string | null;
  user: AuthUser | null;
  isHydrating: boolean;
  isRefreshingSession: boolean;
  isSigningIn: boolean;
  isSigningUp: boolean;
  isSigningOut: boolean;
  isUpdatingProfile: boolean;
  isVerifyingEmail: boolean;
  isResendingVerificationCode: boolean;
  isRequestingPasswordReset: boolean;
  isVerifyingResetCode: boolean;
  isResettingPassword: boolean;
  signIn: (payload: LoginPayload) => Promise<AuthResult>;
  signUp: (payload: SignupPayload) => Promise<AuthResult>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<AuthResult>;
  verifyEmail: (code: string) => Promise<AuthResult>;
  resendVerificationCode: () => Promise<AuthResult>;
  requestPasswordResetCode: (email: string) => Promise<AuthResult>;
  verifyPasswordResetCode: (email: string, code: string) => Promise<AuthResult>;
  resetPassword: (
    email: string,
    resetToken: string,
    newPassword: string,
  ) => Promise<AuthResult>;
  refreshCurrentUser: () => Promise<AuthUser | null>;
  approveVendorLocally: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ACCOUNT_BLOCKED_ERROR_CODE = "ACCOUNT_BLOCKED";
const SESSION_REFRESH_INTERVAL_MS = 15_000;

type ParsedAuthError = {
  status: number;
  detail: unknown;
  code: string | null;
};

function isSameAuthUser(currentUser: AuthUser | null, nextUser: AuthUser | null) {
  if (!currentUser || !nextUser) {
    return currentUser === nextUser;
  }

  return (
    currentUser.id === nextUser.id &&
    currentUser.full_name === nextUser.full_name &&
    currentUser.email === nextUser.email &&
    currentUser.phone_number === nextUser.phone_number &&
    currentUser.avatar_url === nextUser.avatar_url &&
    currentUser.date_of_birth === nextUser.date_of_birth &&
    currentUser.gender === nextUser.gender &&
    currentUser.city === nextUser.city &&
    currentUser.region === nextUser.region &&
    currentUser.allow_notifications === nextUser.allow_notifications &&
    currentUser.discount_notifications === nextUser.discount_notifications &&
    currentUser.store_notifications === nextUser.store_notifications &&
    currentUser.system_notifications === nextUser.system_notifications &&
    currentUser.location_notifications === nextUser.location_notifications &&
    currentUser.location_updates === nextUser.location_updates &&
    currentUser.role === nextUser.role &&
    currentUser.vendorStatus === nextUser.vendorStatus &&
    currentUser.vendorId === nextUser.vendorId &&
    currentUser.vendorRejectionReason === nextUser.vendorRejectionReason &&
    currentUser.is_active === nextUser.is_active &&
    currentUser.is_verified === nextUser.is_verified &&
    currentUser.last_login_at === nextUser.last_login_at &&
    currentUser.created_at === nextUser.created_at &&
    currentUser.updated_at === nextUser.updated_at &&
    currentUser.roles.length === nextUser.roles.length &&
    currentUser.roles.every((role, index) => role === nextUser.roles[index])
  );
}

function normalizeAuthUser(payload: Record<string, unknown>) {
  const roles = normalizeRoles(payload.roles, payload.role);

  return {
    id: String(payload.id ?? ""),
    full_name: String(payload.full_name ?? ""),
    email: String(payload.email ?? ""),
    phone_number:
      typeof payload.phone_number === "string" ? payload.phone_number : null,
    avatar_url:
      typeof payload.avatar_url === "string" ? payload.avatar_url : null,
    date_of_birth:
      typeof payload.date_of_birth === "string" ? payload.date_of_birth : null,
    gender: typeof payload.gender === "string" ? payload.gender : null,
    city: typeof payload.city === "string" ? payload.city : null,
    region: typeof payload.region === "string" ? payload.region : null,
    allow_notifications: Boolean(payload.allow_notifications),
    discount_notifications: Boolean(payload.discount_notifications),
    store_notifications: Boolean(payload.store_notifications),
    system_notifications: Boolean(payload.system_notifications),
    location_notifications: Boolean(payload.location_notifications),
    location_updates: Boolean(payload.location_updates),
    role:
      typeof payload.role === "string"
        ? payload.role
        : roles.includes("vendor")
          ? "vendor"
          : roles[0] ?? "customer",
    roles,
    vendorStatus: normalizeVendorStatus(
      payload.vendorStatus ?? payload.vendor_status,
      roles,
    ),
    vendorId:
      typeof payload.vendorId === "string"
        ? payload.vendorId
        : typeof payload.vendor_id === "string"
          ? payload.vendor_id
          : null,
    vendorRejectionReason:
      typeof payload.vendorRejectionReason === "string"
        ? payload.vendorRejectionReason
        : typeof payload.vendor_rejection_reason === "string"
          ? payload.vendor_rejection_reason
          : null,
    is_active: Boolean(payload.is_active),
    is_verified: Boolean(payload.is_verified),
    last_login_at:
      typeof payload.last_login_at === "string" ? payload.last_login_at : null,
    created_at: String(payload.created_at ?? ""),
    updated_at: String(payload.updated_at ?? ""),
  } satisfies AuthUser;
}

async function parseErrorResponse(response: Response): Promise<ParsedAuthError> {
  try {
    const payload = await response.json();
    return {
      status: response.status,
      detail: payload?.detail,
      code:
        typeof payload?.code === "string"
          ? payload.code
          : typeof payload?.detail?.code === "string"
            ? payload.detail.code
            : response.headers.get("X-Error-Code"),
    };
  } catch {
    // ignore JSON parse failures and fall back to status text
  }

  return {
    status: response.status,
    detail: response.statusText || "Something went wrong.",
    code: response.headers.get("X-Error-Code"),
  };
}

function normalizeMessage(detail: unknown) {
  if (
    detail &&
    typeof detail === "object" &&
    "message" in detail &&
    typeof detail.message === "string" &&
    detail.message.trim()
  ) {
    return detail.message;
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  return "Something went wrong.";
}

function isBlockedAccountError(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: unknown }).code === ACCOUNT_BLOCKED_ERROR_CODE
  );
}

function isUnauthorizedSessionError(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "status" in error &&
    Number((error as { status?: unknown }).status) === 401
  );
}

function mapValidationErrors(detail: unknown): AuthFieldErrors {
  if (!Array.isArray(detail)) {
    return {};
  }

  return detail.reduce<AuthFieldErrors>((errors, issue) => {
    const field = Array.isArray(issue?.loc)
      ? String(issue.loc[issue.loc.length - 1] ?? "")
      : "";
    const message =
      typeof issue?.msg === "string" ? issue.msg : "Please check this field.";

    if (field === "full_name") {
      errors.fullName = message;
    } else if (field === "email") {
      errors.email = message;
    } else if (field === "password") {
      errors.password = message;
    } else if (field === "phone_number") {
      errors.phoneNumber = message;
    } else if (field === "date_of_birth") {
      errors.dateOfBirth = message;
    } else if (field === "gender") {
      errors.gender = message;
    } else if (field === "city") {
      errors.city = message;
    } else if (field === "region") {
      errors.region = message;
    } else {
      errors.general = message;
    }

    return errors;
  }, {});
}

function buildSignInError(
  detail: unknown,
  status: number,
  code?: string | null,
): AuthResult {
  const message = normalizeMessage(detail);

  if (code === ACCOUNT_BLOCKED_ERROR_CODE) {
    return {
      success: false,
      fieldErrors: {
        general: message,
      },
    };
  }

  if (status === 401) {
    return {
      success: false,
      fieldErrors: {
        general: "Email or password is incorrect.",
      },
    };
  }

  if (status === 422) {
    return {
      success: false,
      fieldErrors: mapValidationErrors(detail),
    };
  }

  return {
    success: false,
    fieldErrors: {
      general: message,
    },
  };
}

function buildSignUpError(detail: unknown, status: number): AuthResult {
  const message = normalizeMessage(detail);

  if (status === 409 && /email/i.test(message)) {
    return {
      success: false,
      fieldErrors: {
        email: "An account with this email already exists.",
      },
    };
  }

  if (status === 409 && /phone/i.test(message)) {
    return {
      success: false,
      fieldErrors: {
        general: "An account with this phone number already exists.",
      },
    };
  }

  if (status === 422) {
    return {
      success: false,
      fieldErrors: mapValidationErrors(detail),
    };
  }

  return {
    success: false,
    fieldErrors: {
      general: message,
    },
  };
}

function buildProfileError(detail: unknown, status: number): AuthResult {
  const message = normalizeMessage(detail);

  if (status === 409 && /phone/i.test(message)) {
    return {
      success: false,
      fieldErrors: {
        phoneNumber: "This phone number is already in use.",
      },
    };
  }

  if (status === 422) {
    const mapped = mapValidationErrors(detail);
    return {
      success: false,
      fieldErrors: {
        fullName: mapped.fullName,
        phoneNumber: mapped.phoneNumber,
        dateOfBirth: mapped.dateOfBirth,
        gender: mapped.gender,
        city: mapped.city,
        region: mapped.region,
        general: mapped.general,
      },
    };
  }

  return {
    success: false,
    fieldErrors: {
      general: message,
    },
  };
}

async function fetchCurrentUser(token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return normalizeAuthUser((await response.json()) as Record<string, unknown>);
}

async function loginRequest(payload: LoginPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }

  const responsePayload = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: Record<string, unknown>;
  };

  return {
    access_token: responsePayload.access_token,
    token_type: responsePayload.token_type,
    expires_in: responsePayload.expires_in,
    user: normalizeAuthUser(responsePayload.user),
  };
}

async function signupRequest(payload: SignupPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: payload.fullName,
      email: payload.email,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
}

async function updateProfileRequest(token: string, payload: ProfileUpdatePayload) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      full_name: payload.fullName,
      phone_number: payload.phoneNumber,
      date_of_birth: payload.dateOfBirth,
      gender: payload.gender,
      city: payload.city,
      region: payload.region,
      avatar_url: payload.avatarUrl,
      allow_notifications: payload.allowNotifications,
      discount_notifications: payload.discountNotifications,
      store_notifications: payload.storeNotifications,
      system_notifications: payload.systemNotifications,
      location_notifications: payload.locationNotifications,
      location_updates: payload.locationUpdates,
    }),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }

  return normalizeAuthUser((await response.json()) as Record<string, unknown>);
}

async function verifyEmailRequest(token: string, code: string) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }

  return normalizeAuthUser((await response.json()) as Record<string, unknown>);
}

async function resendVerificationCodeRequest(token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification-code`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }

  return (await response.json()) as { message: string };
}

async function requestPasswordResetCodeRequest(email: string) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }

  return (await response.json()) as { message: string };
}

async function verifyPasswordResetCodeRequest(email: string, code: string) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }

  return (await response.json()) as { message: string; reset_token: string };
}

async function resetPasswordRequest(
  email: string,
  resetToken: string,
  newPassword: string,
) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      reset_token: resetToken,
      new_password: newPassword,
    }),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }

  return (await response.json()) as { message: string };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isResendingVerificationCode, setIsResendingVerificationCode] =
    useState(false);
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] =
    useState(false);
  const [isVerifyingResetCode, setIsVerifyingResetCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const accessTokenRef = useRef<string | null>(null);
  const blockedAlertShownRef = useRef(false);

  const clearLocalSession = useCallback(
    async ({ showBlockedAlert = false }: { showBlockedAlert?: boolean } = {}) => {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_STORAGE_KEY);
      accessTokenRef.current = null;
      setAccessToken(null);
      setUser(null);

      if (showBlockedAlert && !blockedAlertShownRef.current) {
        blockedAlertShownRef.current = true;
        Alert.alert(
          "Account blocked",
          "Your ODOS account has been blocked. Please contact support to restore access.",
        );
      }
    },
    [],
  );

  const syncCurrentUser = useCallback(
    async (
      token: string,
      { showBlockedAlert = true }: { showBlockedAlert?: boolean } = {},
    ) => {
      try {
        const currentUser = await fetchCurrentUser(token);
        setUser((existingUser) =>
          isSameAuthUser(existingUser, currentUser) ? existingUser : currentUser,
        );
        return currentUser;
      } catch (error) {
        if (isBlockedAccountError(error)) {
          await clearLocalSession({ showBlockedAlert });
        } else if (isUnauthorizedSessionError(error)) {
          await clearLocalSession();
        }

        throw error;
      }
    },
    [clearLocalSession],
  );

  useEffect(() => {
    accessTokenRef.current = accessToken;
    if (accessToken) {
      blockedAlertShownRef.current = false;
    }
  }, [accessToken]);

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(
          ACCESS_TOKEN_STORAGE_KEY,
        );
        if (!storedToken) {
          return;
        }

        const currentUser = await syncCurrentUser(storedToken, {
          showBlockedAlert: true,
        });
        accessTokenRef.current = storedToken;
        setAccessToken(storedToken);
        setUser(currentUser);
      } catch {
        await clearLocalSession();
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateAuth();
  }, [clearLocalSession, syncCurrentUser]);

  useEffect(() => {
    const originalFetch = global.fetch.bind(global);

    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);

      if (
        accessTokenRef.current &&
        response.status === 403 &&
        response.headers.get("X-Error-Code") === ACCOUNT_BLOCKED_ERROR_CODE
      ) {
        void clearLocalSession({ showBlockedAlert: true });
      }

      return response;
    };

    return () => {
      global.fetch = originalFetch;
    };
  }, [clearLocalSession]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const refreshSession = () => {
      if (AppState.currentState === "active") {
        void syncCurrentUser(accessToken, { showBlockedAlert: true }).catch(() => {
          // session cleanup is already handled inside syncCurrentUser
        });
      }
    };

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void syncCurrentUser(accessToken, { showBlockedAlert: true }).catch(() => {
          // session cleanup is already handled inside syncCurrentUser
        });
      }
    });

    const intervalId = setInterval(refreshSession, SESSION_REFRESH_INTERVAL_MS);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [accessToken, syncCurrentUser]);

  const signIn = useCallback(
    async ({ email, password }: LoginPayload) => {
      setIsSigningIn(true);

      try {
        const payload = await loginRequest({
          email: email.trim().toLowerCase(),
          password,
        });

        await SecureStore.setItemAsync(
          ACCESS_TOKEN_STORAGE_KEY,
          payload.access_token,
        );

        setAccessToken(payload.access_token);
        setUser(payload.user);
        return {
          success: true,
          requiresVerification: !payload.user.is_verified,
          user: payload.user,
        };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          "detail" in error
        ) {
          const errorCode =
            "code" in error && typeof error.code === "string" ? error.code : null;

          return buildSignInError(
            (error as { detail: unknown }).detail,
            Number((error as { status: unknown }).status),
            errorCode,
          );
        }

        return {
          success: false,
          fieldErrors: {
            general:
              "We couldn't reach the server. Check your connection and try again.",
          },
        };
      } finally {
        setIsSigningIn(false);
        setIsHydrating(false);
      }
    },
    [],
  );

  const signUp = useCallback(
    async ({ fullName, email, password }: SignupPayload) => {
      setIsSigningUp(true);

      try {
        const normalizedEmail = email.trim().toLowerCase();
        await signupRequest({
          fullName: fullName.trim(),
          email: normalizedEmail,
          password,
        });

        const payload = await loginRequest({
          email: normalizedEmail,
          password,
        });

        await SecureStore.setItemAsync(
          ACCESS_TOKEN_STORAGE_KEY,
          payload.access_token,
        );

        setAccessToken(payload.access_token);
        setUser(payload.user);
        return {
          success: true,
          requiresVerification: !payload.user.is_verified,
          user: payload.user,
        };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          "detail" in error
        ) {
          return buildSignUpError(
            (error as { detail: unknown }).detail,
            Number((error as { status: unknown }).status),
          );
        }

        return {
          success: false,
          fieldErrors: {
            general:
              "We couldn't reach the server. Check your connection and try again.",
          },
        };
      } finally {
        setIsSigningUp(false);
        setIsHydrating(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    setIsSigningOut(true);

    try {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
        });
      } catch {
        // ignore backend logout failures for now and clear the local session
      }

      await clearLocalSession();
    } finally {
      setIsSigningOut(false);
    }
  }, [clearLocalSession]);

  const refreshCurrentUser = useCallback(async () => {
    if (!accessToken) {
      return null;
    }

    setIsRefreshingSession(true);

    try {
      return await syncCurrentUser(accessToken, { showBlockedAlert: true });
    } catch {
      return null;
    } finally {
      setIsRefreshingSession(false);
    }
  }, [accessToken, syncCurrentUser]);

  const approveVendorLocally = useCallback(() => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const nextRoles = normalizeRoles(
        [...currentUser.roles, "vendor"],
        "vendor",
      );

      return {
        ...currentUser,
        role: "vendor",
        roles: nextRoles,
        vendorStatus: "approved",
        vendorId: currentUser.vendorId || `local-vendor-${currentUser.id}`,
        vendorRejectionReason: null,
      };
    });
  }, []);

  const updateProfile = useCallback(
    async ({
      fullName,
      phoneNumber,
      dateOfBirth,
      gender,
      city,
      region,
      avatarUrl,
    }: ProfileUpdatePayload) => {
      if (!accessToken) {
        return {
          success: false,
          fieldErrors: {
            general: "You need to sign in again before updating your profile.",
          },
        };
      }

      setIsUpdatingProfile(true);

      try {
        const updatedUser = await updateProfileRequest(accessToken, {
          fullName: fullName?.trim(),
          phoneNumber: phoneNumber?.trim() || undefined,
          dateOfBirth,
          gender: gender?.trim() || null,
          city: city?.trim() || null,
          region: region?.trim() || null,
          avatarUrl,
        });

        setUser(updatedUser);
        return { success: true };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          "detail" in error
        ) {
          return buildProfileError(
            (error as { detail: unknown }).detail,
            Number((error as { status: unknown }).status),
          );
        }

        return {
          success: false,
          fieldErrors: {
            general:
              "We couldn't save your profile right now. Please try again.",
          },
        };
      } finally {
        setIsUpdatingProfile(false);
      }
    },
    [accessToken],
  );

  const verifyEmail = useCallback(
    async (code: string) => {
      if (!accessToken) {
        return {
          success: false,
          fieldErrors: {
            general: "Sign in again to verify your email address.",
          },
        };
      }

      setIsVerifyingEmail(true);

      try {
        const updatedUser = await verifyEmailRequest(accessToken, code);
        setUser(updatedUser);
        return {
          success: true,
          user: updatedUser,
        };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          "detail" in error
        ) {
          return {
            success: false,
            fieldErrors: {
              general: normalizeMessage((error as { detail: unknown }).detail),
            },
          };
        }

        return {
          success: false,
          fieldErrors: {
            general:
              "We couldn't verify that code right now. Check your connection and try again.",
          },
        };
      } finally {
        setIsVerifyingEmail(false);
      }
    },
    [accessToken],
  );

  const resendVerificationCode = useCallback(async () => {
    if (!accessToken) {
      return {
        success: false,
        fieldErrors: {
          general: "Sign in again to request a new verification code.",
        },
      };
    }

    setIsResendingVerificationCode(true);

    try {
      const payload = await resendVerificationCodeRequest(accessToken);
      return {
        success: true,
        message: payload.message,
      };
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        "detail" in error
      ) {
        return {
          success: false,
          fieldErrors: {
            general: normalizeMessage((error as { detail: unknown }).detail),
          },
        };
      }

      return {
        success: false,
        fieldErrors: {
          general:
            "We couldn't send a new code right now. Check your connection and try again.",
        },
      };
    } finally {
      setIsResendingVerificationCode(false);
    }
  }, [accessToken]);

  const requestPasswordResetCode = useCallback(async (email: string) => {
    setIsRequestingPasswordReset(true);

    try {
      const payload = await requestPasswordResetCodeRequest(
        email.trim().toLowerCase(),
      );
      return {
        success: true,
        message: payload.message,
      };
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        "detail" in error
      ) {
        return {
          success: false,
          fieldErrors: {
            general: normalizeMessage((error as { detail: unknown }).detail),
          },
        };
      }

      return {
        success: false,
        fieldErrors: {
          general:
            "We couldn't send a reset code right now. Check your connection and try again.",
        },
      };
    } finally {
      setIsRequestingPasswordReset(false);
    }
  }, []);

  const verifyPasswordResetCode = useCallback(
    async (email: string, code: string) => {
      setIsVerifyingResetCode(true);

      try {
        const payload = await verifyPasswordResetCodeRequest(
          email.trim().toLowerCase(),
          code,
        );
        return {
          success: true,
          message: payload.message,
          resetToken: payload.reset_token,
        };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          "detail" in error
        ) {
          return {
            success: false,
            fieldErrors: {
              general: normalizeMessage((error as { detail: unknown }).detail),
            },
          };
        }

        return {
          success: false,
          fieldErrors: {
            general:
              "We couldn't verify that reset code right now. Check your connection and try again.",
          },
        };
      } finally {
        setIsVerifyingResetCode(false);
      }
    },
    [],
  );

  const resetPassword = useCallback(
    async (email: string, resetToken: string, newPassword: string) => {
      setIsResettingPassword(true);

      try {
        const payload = await resetPasswordRequest(
          email.trim().toLowerCase(),
          resetToken,
          newPassword,
        );
        return {
          success: true,
          message: payload.message,
        };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          "detail" in error
        ) {
          return {
            success: false,
            fieldErrors: {
              general: normalizeMessage((error as { detail: unknown }).detail),
            },
          };
        }

        return {
          success: false,
          fieldErrors: {
            general:
              "We couldn't reset the password right now. Check your connection and try again.",
          },
        };
      } finally {
        setIsResettingPassword(false);
      }
    },
    [],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      accessToken,
      user,
      isHydrating,
      isRefreshingSession,
      isSigningIn,
      isSigningUp,
      isSigningOut,
      isUpdatingProfile,
      isVerifyingEmail,
      isResendingVerificationCode,
      isRequestingPasswordReset,
      isVerifyingResetCode,
      isResettingPassword,
      signIn,
      signUp,
      updateProfile,
      verifyEmail,
      resendVerificationCode,
      requestPasswordResetCode,
      verifyPasswordResetCode,
      resetPassword,
      refreshCurrentUser,
      approveVendorLocally,
      signOut,
    }),
    [
      accessToken,
      approveVendorLocally,
      isHydrating,
      isRefreshingSession,
      isSigningIn,
      isSigningOut,
      isSigningUp,
      isUpdatingProfile,
      isVerifyingEmail,
      isResendingVerificationCode,
      isRequestingPasswordReset,
      isVerifyingResetCode,
      isResettingPassword,
      resendVerificationCode,
      requestPasswordResetCode,
      verifyPasswordResetCode,
      resetPassword,
      refreshCurrentUser,
      signIn,
      signOut,
      signUp,
      updateProfile,
      verifyEmail,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
