import { Analytics } from "@vercel/analytics/next";
import Navbar from "./components/Navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-gradient-to-b bg-no-repeat from-[#23262e] to-[#3d4450] text-slate-100`}
      >
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
