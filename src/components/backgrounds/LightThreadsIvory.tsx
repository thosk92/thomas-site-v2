"use client";
import LightThreadsBase from "./LightThreadsBase";

export default function LightThreadsIvory({ motionEnabled = true }: { motionEnabled?: boolean }) {
  return (
    <LightThreadsBase
      motionEnabled={motionEnabled}
      palette={{
        background: "#F9F8F3",
        threads: [
          "rgba(210, 186, 140, 0.35)", // pale gold
          "rgba(198, 176, 132, 0.35)", // sand beige
          "rgba(182, 160, 120, 0.35)", // warm beige
          "rgba(220, 196, 150, 0.35)", // ivory gold
        ],
        glow: "rgba(218, 192, 145, 0.6)",
      }}
    />
  );
}
