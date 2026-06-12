import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import BackToTop from "@/components/ui/back-to-top";

export const metadata: Metadata = {
  title: "SIMS Portfolio",
  description: "Smart Inventory Management System dashboard built with Next.js and shadcn/ui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script
          id="appearance-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var root = document.documentElement;
                  var theme = localStorage.getItem('sims-settings-theme');
                  var density = localStorage.getItem('sims-settings-density');
                  var accent = localStorage.getItem('sims-settings-accent');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.dataset.theme = theme === 'dark' || theme === 'light' ? theme : systemTheme;
                  root.dataset.density = density === 'compact' || density === 'comfortable' ? density : 'comfortable';
                  root.dataset.accent = accent === 'blue' || accent === 'violet' || accent === 'slate' ? accent : 'teal';
                  root.style.colorScheme = root.dataset.theme;
                } catch (error) {}
              })();
            `,
          }}
        />
        <ToastProvider>{children}</ToastProvider>
        <BackToTop />
      </body>
    </html>
  );
}
