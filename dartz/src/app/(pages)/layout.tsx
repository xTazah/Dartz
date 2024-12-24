import type { Metadata } from "next";
import "../globals.css";
import { UserProvider } from "../components/userProvider/userProvider";
import { Toaster } from "sonner";

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
      <body>
        <Toaster closeButton />
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
