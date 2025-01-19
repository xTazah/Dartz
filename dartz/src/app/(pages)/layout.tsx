import type { Metadata } from "next";
import "../globals.css";
import { UserProvider } from "../components/userProvider/userProvider";
import { Toaster } from "sonner";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Dartz",
  description: "Dartz by Timinz & xTazah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body>
        <Toaster
          toastOptions={{
            className: "text-white bg-[var(--component-background)]",
          }}
          closeButton
        />
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
