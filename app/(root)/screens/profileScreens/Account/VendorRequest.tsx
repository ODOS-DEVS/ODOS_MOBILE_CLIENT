import { Redirect } from "expo-router";

export default function VendorRequestRedirectScreen() {
  return <Redirect href={"/vendor/apply" as any} />;
}
