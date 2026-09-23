import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Waypoint - Fleet Dispatch Console",
  description: "Request, approve, and track company transport in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className="min-h-full flex flex-col bg-ink text-text"
        cz-shortcut-listen="true"
      >
        {children}
      </body>
    </html>
  );
}
