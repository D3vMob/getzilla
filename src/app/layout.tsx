import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "GETziLLa - The Ultimate Task & Catalog Manager for Music Production",
  description:
    "GETziLLa is the ultimate task management app for music producers and labels, offering advanced catalog management for audio files from stems to final masters. Automate workflows and leverage AI analysis to streamline music production and audio processing.",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <div className="absolute top-4 right-6 bg-white/10 p-2 rounded-md backdrop-blur-sm hover:bg-white/20 transition-colors duration-200 ease-in-out cursor-pointer">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </div>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
