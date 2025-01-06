import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dartz",
    short_name: "Dartz",
    description: "Dartz tracking dart games",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/images/dartzIcon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/dartzIcon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
