import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ToasterProvider } from "@/lib/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DDDチックな家計簿アプリ",
  description: "DDDを参考にした、1周間単位で管理できる家計簿アプリ！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Clerk認証をアプリケーション全体で使用するため
    <ClerkProvider>
      <html lang="ja">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            {/* 未ログイン時の表示 */}
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button
                  type="button"
                  className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            {/* ログイン時の表示 */}
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
          {/* トーストをアプリケーション全体で使用するため */}
          <ToasterProvider />
        </body>
      </html>
    </ClerkProvider>
  );
}
