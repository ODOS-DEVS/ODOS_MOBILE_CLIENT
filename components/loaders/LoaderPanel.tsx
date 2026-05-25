import LoadingSpinner from "@/components/loaders/LoadingSpinner";
import React from "react";

type LoaderPanelProps = {
  label: string;
  sublabel?: string;
  tone?: "default" | "inverse";
};

export default function LoaderPanel({
  label,
  sublabel,
  tone = "default",
}: LoaderPanelProps) {
  return <LoadingSpinner label={label} sublabel={sublabel} tone={tone} />;
}
