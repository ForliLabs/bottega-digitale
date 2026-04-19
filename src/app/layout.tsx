import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bottega Digitale",
  description:
    "Toolkit digitale per botteghe, artigiani e piccole attività di Forlì.",
};

const navItems = [
  { label: "Funzioni", href: "/#funzioni" },
  { label: "Prezzi", href: "/#prezzi" },
  { label: "Testimonianze", href: "/#testimonianze" },
  { label: "Directory", href: "/directory" },
  { label: "Dashboard demo", href: "/dashboard" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-amber-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          <Navbar
            brand="Bottega Digitale"
            items={navItems}
            ctaLabel="Apri la demo"
            ctaHref="/dashboard"
          />
          <main className="flex-1">{children}</main>
          <Footer
            brand="Bottega Digitale"
            tagline="Il bancone digitale per artigiani, botteghe e piccole imprese di Forlì."
          />
        </div>
      </body>
    </html>
  );
}
