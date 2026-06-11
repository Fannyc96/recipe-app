import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '食譜本',
  description: '我的私房食譜',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
