const appJson = require("./app.json");

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const iosGoogleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY || googleMapsApiKey;
const androidGoogleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY || googleMapsApiKey;

const iosConfig = {
  ...(appJson.expo.ios?.config ?? {}),
  ...(iosGoogleMapsApiKey ? { googleMapsApiKey: iosGoogleMapsApiKey } : {}),
};

const androidConfig = {
  ...(appJson.expo.android?.config ?? {}),
  ...(androidGoogleMapsApiKey
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
