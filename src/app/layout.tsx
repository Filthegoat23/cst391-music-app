import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";
import SessionWrapper from "./SessionWrapper";

export const metadata: Metadata = {
  // Activity 6: updated title to "Music App"
  title: "Music App",
  description: "Filiberto Meraz — Music App built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CSS via CDN — avoids Turbopack CSS module resolution issues */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/* SessionWrapper makes useSession() available in all client components */}
        <SessionWrapper>
          <NavBar />
          {children}
        </SessionWrapper>
        {/* Bootstrap JS via CDN */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc4s9bIOgUxi8T/jzmg4sKb2bRiCvTzQ6lSHpXRkKSR"
          crossOrigin="anonymous"
          async
        />
      </body>
    </html>
  );
}
