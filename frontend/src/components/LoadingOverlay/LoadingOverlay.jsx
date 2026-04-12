import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/lottie/loading.json";
import { useLoading } from "./LoadingProvider";
import "./LoadingOverlay.css";

export default function LoadingOverlay() {
  const { active } = useLoading();

  if (!active) return null;

  return (
    <div className="ss-loading-overlay" role="status" aria-live="polite" aria-label="Loading">
      <div className="ss-loading-card">
        <Lottie
          animationData={loadingAnimation}
          loop
          autoplay
          rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
