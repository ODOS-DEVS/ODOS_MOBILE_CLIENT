import {
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
} from "@/constants/auth";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  role: string;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
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
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function parseErrorResponse(response: Response) {
  try {
    const payload = await response.json();
    return {
      status: response.status,
      detail: payload?.detail,
    };
  } catch {
    // ignore JSON parse failures and fall back to status text
  }

  return {
    status: response.status,
    detail: response.statusText || "Something went wrong.",
  };
}

function normalizeMessage(detail: unknown) {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  return "Something went wrong.";
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

function buildSignInError(detail: unknown, status: number): AuthResult {
  const message = normalizeMessage(detail);

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
    const error = await parseErrorResponse(response);
    throw new Error(normalizeMessage(error.detail));
  }

  return (await response.json()) as AuthUser;
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

  return (await response.json()) as AuthTokenResponse;
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
    }),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }

  return (await response.json()) as AuthUser;
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

  return (await response.json()) as AuthUser;
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

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(
          ACCESS_TOKEN_STORAGE_KEY,
        );
        if (!storedToken) {
          return;
        }

        const currentUser = await fetchCurrentUser(storedToken);
        setAccessToken(storedToken);
        setUser(currentUser);
      } catch {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_STORAGE_KEY);
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateAuth();
  }, []);

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
          return buildSignInError(
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

      await SecureStore.deleteItemAsync(ACCESS_TOKEN_STORAGE_KEY);
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsSigningOut(false);
    }
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
      signOut,
    }),
    [
      accessToken,
      isHydrating,
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
