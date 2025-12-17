import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyLearningPrep",
    short_name: "LearnPrep",
    description:
      "AI-Powered Learning Preparation - Ace your next technical interview",
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    // Prefer fullscreen where supported; fallback to standalone.
    display_override: ["fullscreen", "standalone"],
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
