import FeedbackBanner from "@/components/ui/FeedbackBanner";

type AuthErrorBannerProps = {
  message: string;
};

/** Auth-form error banner — thin wrapper over shared FeedbackBanner. */
export default function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  return <FeedbackBanner message={message} tone="danger" />;
}
