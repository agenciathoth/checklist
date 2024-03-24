import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ToastContainer } from "react-toastify";

import { Header } from "@/components/Header";
import { Providers } from "./providers";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Checklist Thoth",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Providers>
          <ToastContainer />

          <div
            className={`relative flex flex-col max-w-[600px] min-h-screen mx-auto pb-8`}
          >
            <Header />

            <main className="flex-1 relative flex flex-col gap-8 px-4 -mt-5">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
