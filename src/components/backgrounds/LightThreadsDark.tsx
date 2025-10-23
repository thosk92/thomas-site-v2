"use client";
import LightThreadsBase from "./LightThreadsBase";

export default function LightThreadsDark({ motionEnabled = true }: { motionEnabled?: boolean }) {
  return (
    <LightThreadsBase
      motionEnabled={motionEnabled}
      palette={{
        background: "#0A1014",
        threads: [
          "rgba(20, 50, 74, 0.32)",  // deep blue
          "rgba(11, 72, 92, 0.30)",  // teal
          "rgba(102, 115, 2, 0.22)", // olive glow
          "rgba(28, 64, 84, 0.28)",  // steel blue
        ],
        glow: "rgba(18, 40, 56, 0.6)",
      }}
    />
  );
}
