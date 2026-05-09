import type {Metadata} from 'next';
import './globals.css';
import { TimerProvider } from '@/lib/TimerContext';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Remainder Clock',
  description: 'Global timer application',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning className="font-sans antialiased bg-[#050505] text-[#e0e0e0] min-h-screen relative overflow-x-hidden flex flex-col">
        <div className="fixed inset-0 opacity-20 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900 rounded-full blur-[120px]"></div>
        </div>
        <TimerProvider>
          {children}
        </TimerProvider>
      </body>
    </html>
  );
}
