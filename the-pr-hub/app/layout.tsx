import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The PR Hub — Strategic PR & Corporate Communications",
  description:
    "We turn commercial performance, leadership expertise and company milestones into external credibility for founder-led, high-growth businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
