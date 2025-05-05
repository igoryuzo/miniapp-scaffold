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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

const frameEmbed = {
  version: "next",
  imageUrl: `${baseUrl}/miniapp-scaffolding.png`,
  button: {
    title: "Start Building",
    action: {
      type: "launch_frame",
      name: "Mini App Scaffold",
      url: `${baseUrl}/`,
      splashImageUrl: `${baseUrl}/loading-icon.png`,
      splashBackgroundColor: "#0f172a",
    },
  },
};

export const metadata: Metadata = {
  title: "Mini App Scaffold",
  description: "Quick-start scaffold for Farcaster Mini Apps with authentication, notifications, and data persistence",
  icons: {
    icon: "/scaffolding-icon.png",
    apple: "/scaffolding-icon.png",
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
