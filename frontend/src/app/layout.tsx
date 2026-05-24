import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'LiverSeg Pro',
  description: 'Liver tumor 3D volume upload and segmentation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        {/* <AppProviders>{children}</AppProviders> */}
        {children}
      </body>
    </html>
  )
}
