import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dawn - Crypto Wallet",
  description: "The most intuitive crypto wallet. Manage your digital assets with ease.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
