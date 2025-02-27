import '@/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang='en' suppressHydrationWarning>
				<body className={inter.className}>{children}</body>
			</html>
		</ClerkProvider>
	);
}
