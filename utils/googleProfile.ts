type GoogleUserInfo = {
  picture?: string | null;
};

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) {
      return null;
    }

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = globalThis.atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractPictureFromIdToken(idToken: string): string | null {
  const payload = decodeJwtPayload(idToken);
  const picture = payload?.picture;
  return typeof picture === "string" && picture.trim() ? picture.trim() : null;
}

export async function fetchGoogleProfilePicture(
  accessToken?: string | null,
): Promise<string | null> {
  if (!accessToken?.trim()) {
    return null;
  }

  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken.trim()}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as GoogleUserInfo;
    return typeof payload.picture === "string" && payload.picture.trim()
      ? payload.picture.trim()
      : null;
  } catch {
    return null;
  }
}

export async function resolveGoogleProfilePicture(
  idToken: string,
  accessToken?: string | null,
): Promise<string | null> {
  return (
    extractPictureFromIdToken(idToken) ??
    (await fetchGoogleProfilePicture(accessToken))
  );
}
