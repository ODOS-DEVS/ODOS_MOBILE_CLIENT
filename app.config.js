const appJson = require("./app.json");

function getGoogleIosUrlScheme(iosClientId) {
  const clientId = (iosClientId ?? "").trim();
  if (!clientId.endsWith(".apps.googleusercontent.com")) {
    return null;
  }

  const prefix = clientId.replace(/\.apps\.googleusercontent.com$/, "");
  return prefix ? `com.googleusercontent.apps.${prefix}` : null;
}

// Google Sign-In only. The Google *Maps* keys that used to live here went with
// the switch to Mapbox -- the map SDK now authenticates with
// EXPO_PUBLIC_MAPBOX_TOKEN at runtime, and nothing native needs a key.
// This scheme is unrelated to maps and must stay: it is the OAuth redirect
// target, without which Google sign-in never comes back to the app.
const googleIosUrlScheme = getGoogleIosUrlScheme(
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
);

const iosInfoPlist = {
  ...(appJson.expo.ios?.infoPlist ?? {}),
  ...(googleIosUrlScheme
    ? {
        CFBundleURLTypes: [
          ...(appJson.expo.ios?.infoPlist?.CFBundleURLTypes ?? []),
          {
            CFBundleURLSchemes: [googleIosUrlScheme],
          },
        ],
      }
    : {}),
};

const iosConfig = {
  ...(appJson.expo.ios?.config ?? {}),
};

const androidConfig = {
  ...(appJson.expo.android?.config ?? {}),
};

const androidIntentFilters = [
  ...(appJson.expo.android?.intentFilters ?? []),
  {
    action: "VIEW",
    category: ["BROWSABLE", "DEFAULT"],
    data: [
      {
        scheme: "com.paul.odos",
        path: "/oauthredirect",
      },
    ],
  },
];

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      eas: {
        ...appJson.expo.extra?.eas,
        projectId: "afc10185-dcf7-4297-8056-e5ad4f0e22a3",
      },
    },
    ios: {
      ...appJson.expo.ios,
      infoPlist: iosInfoPlist,
      config: iosConfig,
    },
    android: {
      ...appJson.expo.android,
      config: androidConfig,
      intentFilters: androidIntentFilters,
    },
  },
};
