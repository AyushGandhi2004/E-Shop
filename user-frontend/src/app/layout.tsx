import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/shared/widgets/Header";
import Providers from "./providers";

const roboto = Roboto({
  subsets : ["latin"],
  weight : ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable : "--font-roboto"
})

const poppins = Poppins({
  subsets : ["latin"],
  weight : ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable : "--font-poppins"
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Shop",
  description: "A distributed micro-service based full stack e-commerce application built using Next.js, React, Node.js, Express, MongoDB,Redis, Kafka and Docker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`min-h-full ${roboto.variable} ${poppins.variable}`}>
        <Providers>
          <Header/>
          {children}
        </Providers>
        
      </body>
    </html>
  );
}
