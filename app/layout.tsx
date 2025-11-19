import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/contexts/app-context"
import { NotificationProvider } from "@/components/ui/notification"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "XpMarket",
   icons: "/sinfondo.ico"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </AppProvider>
      </body>
    </html>
  )
}
