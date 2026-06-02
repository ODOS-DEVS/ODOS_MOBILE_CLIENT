const appJson = require("./app.json");

const enableGoogleMaps = process.env.EXPO_PUBLIC_ENABLE_GOOGLE_MAPS === "true";
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const iosGoogleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY || googleMapsApiKey;
const androidGoogleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY || googleMapsApiKey;

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
      config: iosConfig,
    },
    android: {
      ...appJson.expo.android,
      config: androidConfig,
    },
  },
};
