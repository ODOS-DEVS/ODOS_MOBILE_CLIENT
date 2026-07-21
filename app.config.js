const appJson = require("./app.json");

function getGoogleIosUrlScheme(iosClientId) {
  const clientId = (iosClientId ?? "").trim();
  if (!clientId.endsWith(".apps.googleusercontent.com")) {
    return null;
  }

  const prefix = clientId.replace(/\.apps\.googleusercontent.com$/, "");
  return prefix ? `com.googleusercontent.apps.${prefix}` : null;
}

const enableGoogleMaps = process.env.EXPO_PUBLIC_ENABLE_GOOGLE_MAPS === "true";
const googleIosUrlScheme = getGoogleIosUrlScheme(
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
);
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const iosGoogleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY || googleMapsApiKey;
const androidGoogleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY || googleMapsApiKey;

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
  ...(enableGoogleMaps && iosGoogleMapsApiKey
    ? { googleMapsApiKey: iosGoogleMapsApiKey }
    : {}),
};

const androidConfig = {
  ...(appJson.expo.android?.config ?? {}),
  ...(enableGoogleMaps && androidGoogleMapsApiKey
    ? {
        googleMaps: {
          ...(appJson.expo.android?.config?.googleMaps ?? {}),
          apiKey: androidGoogleMapsApiKey,
        },
      }
    : {}),
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
