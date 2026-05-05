import type { Metadata } from "next";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nairobi City County - Student Attachment Application Portal",
  description: "Apply for industrial attachment opportunities at Nairobi City County Government",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}