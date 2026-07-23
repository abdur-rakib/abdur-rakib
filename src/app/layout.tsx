import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { basePath, site } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: `${site.name} — ${site.role}`,
  description: site.bio,
  icons: { icon: `${basePath}/icon.png` },
  openGraph: { images: [`${basePath}/opengraph-image.png`] },
  twitter: { card: "summary_large_image", images: [`${basePath}/opengraph-image.png`] },
};

const themeScript = `(() => {
  let stored;
  try { stored = localStorage.getItem('theme'); } catch {}
  const theme = stored === 'light' || stored === 'dark'
    ? stored
    : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <Navbar />
        <main className="mx-auto max-w-[940px] px-6 py-14">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
