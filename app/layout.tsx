import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stathead YGT — Strokes Gained Explorer",
  description:
    "Explore Your Golf Tour strokes gained. Compare players, categories, and stops with an interactive leaderboard and heatmap.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
