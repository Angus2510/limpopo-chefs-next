import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import ThemeProvider from "@/context/Theme";

const inter = localFont({
  src: "./fonts/Inter/InterVF.ttf",
  variable: "--font-inter",
  weight: "100 200 300 400 500 600 700 800 900",
});
const spaceGrotesk = localFont({
  src: "./fonts/Space_Grotesk/SpaceGroteskVF.ttf",
  variable: "--font-space-grotesk",
  weight: "100 200 300 400 500 600 700 800 900",
});
export const metadata: Metadata = {
  title: "Limpopo Chefs | Portal | Home",
  description: "Limpopo Chefs Student Portal Home",
  icons: {
    icon: "img/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${spaceGrotesk.variable}  antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
