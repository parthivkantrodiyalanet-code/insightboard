import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "InsightBoard | Analytics Dashboard",
  description: "Advanced Excel to Dashboard SaaS Platform",
}

import Providers from '@/components/Providers';

const layout = ({children}: {children:React.ReactNode}) => {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default layout