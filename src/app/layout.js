import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Smart OMR",
  description: "Advanced OMR scanning system",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        
        {/* Navbar-টি ঠিক এখানে, অর্থাৎ main এর উপরে থাকতে হবে! */}
        <Navbar /> 

        <main className="flex-grow">{children}</main>

      </body>
    </html>
  );
}