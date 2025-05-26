import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UP Cebu Dormitory Management System",
  description: "Efficiently manage dormitory facilities, residents, and room assignments",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <footer className="bg-[#7a1818] text-white py-4">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm">CMSC 127 - Group B2</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
