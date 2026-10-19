import type { Metadata } from "next";
import { Bagel_Fat_One, Plus_Jakarta_Sans } from "next/font/google";
import "leaflet/dist/leaflet.css"; // before globals.css so our overrides win
import "./globals.css";

const display = Bagel_Fat_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bagel",
});
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "ijul & dapta",
  description: "a map of every place ijul and dapta have been, together and apart",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
