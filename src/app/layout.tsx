import { MyRuntimeProvider } from '@/app/MyRuntimeProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import './globals.css';

// TODO: How can we update this based on the language
export const metadata: Metadata = {
	title: 'Stitcha',
	description: 'Get stitching.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<MyRuntimeProvider>
				<html lang='en' suppressHydrationWarning>
					<head />
					<body>
						<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
							{children}
						</ThemeProvider>
					</body>
				</html>
			</MyRuntimeProvider>
		</ClerkProvider>
	);
}
