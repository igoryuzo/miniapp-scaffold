import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const frameEmbed = {
  version: "next",
  imageUrl: `https://www.scaffold.wiki/images/miniapp-scaffolding.png`,
  button: {
    title: "Start Building",
    action: {
      type: "launch_frame",
      name: "Mini App Scaffold",
      url: `https://www.scaffold.wiki/`,
      splashImageUrl: `https://www.scaffold.wiki/images/scaffolding-icon.png`,
      splashBackgroundColor: "#0f172a",
    },
  },
};

export const metadata: Metadata = {
  title: "Mini App Scaffold",
  description: "Quick-start scaffold for Farcaster Mini Apps with authentication, notifications, and data persistence",
  icons: {
    icon: "/images/scaffolding-icon.png",
    apple: "/images/scaffolding-icon.png",
  },
  other: {
    "fc:frame": JSON.stringify(frameEmbed),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
