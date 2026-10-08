import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Shayth Campaign Center", template: "%s · Shayth Center" },
  description:
    "Centro privado de campañas y gestión comercial de Inflables Shayth",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};
export const viewport: Viewport = {
  themeColor: "#9256d9",
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <ServiceWorker />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
