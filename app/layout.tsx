import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToasterClient from "@/components/ui/ToasterClient";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sombrerito Check",
  description: "Admin dashboard para monitoreo de bots de WhatsApp",
  icons: {
    icon: [{ url: "/logo_sombrerito_check.png", type: "image/png" }],
    apple: [{ url: "/logo_sombrerito_check.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('sc_theme');if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full bg-background text-text-primary font-sans">
        <AuthProvider>{children}</AuthProvider>
        <ToasterClient />
      </body>
    </html>
  );
}
