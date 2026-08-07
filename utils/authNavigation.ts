import type { Href } from "expo-router";

import { HOME_TAB_HREF, VENDOR_HOME_TAB_HREF, type RouterLike } from "@/utils/navigation";
import { useWorkspaceModeStore } from "@/stores/workspaceModeStore";
import {
  canAccessVendorDashboard,
  type AppRole,
  type VendorStatus,
} from "@/types/vendor";
import {
  clearPasswordResetSession,
  setPasswordResetSession,
} from "@/utils/passwordResetSession";

// Kept minimal (rather than importing AuthUser from AuthContext) to avoid a
// circular import — AuthContext itself imports navigation helpers from this file.
type HomeRedirectUser = { roles: AppRole[]; vendorStatus: VendorStatus } | null | undefined;

function resolveHomeHref(user: HomeRedirectUser): Href {
  if (!user) {
    return HOME_TAB_HREF;
  }

  const workspace = useWorkspaceModeStore.getState();
  const isSellOnlyVendorHome =
    workspace.hydrated &&
    workspace.mode === "sell_only" &&
    canAccessVendorDashboard(user.roles, user.vendorStatus);

  return isSellOnlyVendorHome ? VENDOR_HOME_TAB_HREF : HOME_TAB_HREF;
}

export const AUTH_SIGN_IN_HREF = "/(root)/(auth)/signin" as Href;
export const AUTH_SIGN_UP_HREF = "/(root)/(auth)/signup" as Href;
export const AUTH_FORGOT_PASSWORD_HREF = "/(root)/(auth)/forgotpassword" as Href;
export const AUTH_VERIFICATION_HREF = "/(root)/(auth)/verification" as Href;
export const AUTH_CREATE_PASSWORD_HREF = "/(root)/(auth)/createpassword" as Href;
export const AUTH_ONBOARDING_HREF = "/(root)/(auth)/onboarding" as Href;

type AuthRouteParams = {
  email?: string;
  mode?: "password-reset";
};

function replaceWithParams(
  router: RouterLike,
  pathname: Href,
  params?: AuthRouteParams,
) {
  if (params && Object.keys(params).length > 0) {
    router.replace({ pathname, params } as Href);
    return;
  }

  router.replace(pathname);
}

/** Open an auth screen from the main app so users cannot navigate back to browsing. */
function openAuthFromApp(router: RouterLike, href: Href) {
  if (typeof router.dismissTo === "function") {
    router.dismissTo(href);
    return;
  }

  if (typeof router.dismissAll === "function") {
    router.dismissAll();
  }

  router.replace(href);
}

/** Sign in from home, profile prompts, cart, etc. — no back to the previous screen. */
export function openSignInFromApp(router: RouterLike) {
  openAuthFromApp(router, AUTH_SIGN_IN_HREF);
}

/** Sign up from the main app — no back to the previous screen. */
export function openSignUpFromApp(router: RouterLike) {
  openAuthFromApp(router, AUTH_SIGN_UP_HREF);
}

/**
 * Leave auth entirely and open the main app home tab — or, for an approved vendor
 * currently in "sell_only" workspace mode, the Seller Center home (the shopper
 * home tab is hidden for them, so HOME_TAB_HREF would land on a dead tab).
 */
export function exitAuthToHome(router: RouterLike, user?: HomeRedirectUser) {
  // Replace only — dismissTo/back pops are blocked on sign-in/sign-up screens.
  router.replace(resolveHomeHref(user));
}

/** Reset the flow to sign in (e.g. after logout or password reset complete). */
export function resetAuthStackToSignIn(router: RouterLike) {
  openAuthFromApp(router, AUTH_SIGN_IN_HREF);
}

export function goToSignIn(router: RouterLike) {
  router.replace(AUTH_SIGN_IN_HREF);
}

export function goToSignUp(router: RouterLike) {
  router.replace(AUTH_SIGN_UP_HREF);
}

export function openForgotPassword(
  router: RouterLike,
  email?: string,
  options?: { replace?: boolean },
) {
  clearPasswordResetSession();
  const params = email ? { email } : undefined;
  const useReplace = options?.replace ?? false;

  if (useReplace) {
    replaceWithParams(router, AUTH_FORGOT_PASSWORD_HREF, params);
    return;
  }

  if (typeof router.push === "function") {
    router.push(
      params
        ? ({ pathname: AUTH_FORGOT_PASSWORD_HREF, params } as Href)
        : AUTH_FORGOT_PASSWORD_HREF,
    );
    return;
  }

  replaceWithParams(router, AUTH_FORGOT_PASSWORD_HREF, params);
}

export function goToEmailVerification(router: RouterLike, email: string) {
  replaceWithParams(router, AUTH_VERIFICATION_HREF, { email });
}

export function goToPasswordResetVerification(router: RouterLike, email: string) {
  replaceWithParams(router, AUTH_VERIFICATION_HREF, {
    email,
    mode: "password-reset",
  });
}

export function goToCreatePassword(
  router: RouterLike,
  email: string,
  resetToken: string,
) {
  setPasswordResetSession(email, resetToken);
  // Never put the JWT in route params — Expo Router URL-encodes and can mangle it.
  replaceWithParams(router, AUTH_CREATE_PASSWORD_HREF, { email });
}
