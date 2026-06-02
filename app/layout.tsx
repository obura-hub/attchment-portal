import type { Metadata } from "next";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nairobi City County - Student Attachment Application Portal",
  description: "Apply for industrial attachment opportunities at Nairobi City County Government",
};

// Client wrapper with alert blocker
function ClientProviders({ children }: { children: React.ReactNode }) {
  // Alert blocker code goes here in a separate client component
  return <ToastProvider>{children}</ToastProvider>;
}

// Separate client component for alert blocker
function AlertBlocker({ children }: { children: React.ReactNode }) {
  if (typeof window !== 'undefined') {
    const originalAlert = window.alert;
    window.alert = function(message) {
      console.warn('Alert blocked:', message);
      // Don't show the browser alert
      // originalAlert(message); // Uncomment if you want to still show it
    };
  }
  return <>{children}</>;
}

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