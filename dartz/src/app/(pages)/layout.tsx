import type { Metadata } from "next";
import "../globals.css";
import { UserProvider } from "../components/userProvider/userProvider";

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
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
