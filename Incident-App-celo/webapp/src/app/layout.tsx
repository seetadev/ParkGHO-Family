import { Inter } from 'next/font/google'
import "./style.css"
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DeciReport',
  description: 'Showcase how to use Web3 tech with the Theta Network blockchain',
}

// const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
