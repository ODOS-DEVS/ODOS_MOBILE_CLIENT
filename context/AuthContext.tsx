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

type AuthFieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  general?: string;
};

type AuthResult = {
  success: boolean;
  fieldErrors?: AuthFieldErrors;
  message?: string;
};

type AuthContextType = {
  accessToken: string | null;
  user: AuthUser | null;
  isHydrating: boolean;
  isSigningIn: boolean;
  isSigningUp: boolean;
  isSigningOut: boolean;
  signIn: (payload: LoginPayload) => Promise<AuthResult>;
  signUp: (payload: SignupPayload) => Promise<AuthResult>;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
        return { success: true };
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
        return { success: true };
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

  const value = useMemo<AuthContextType>(
    () => ({
      accessToken,
      user,
      isHydrating,
      isSigningIn,
      isSigningUp,
      isSigningOut,
      signIn,
      signUp,
      signOut,
    }),
    [
      accessToken,
      isHydrating,
      isSigningIn,
      isSigningOut,
      isSigningUp,
      signIn,
      signOut,
      signUp,
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
