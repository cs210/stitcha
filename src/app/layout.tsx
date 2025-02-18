import { MyRuntimeProvider } from '@/app/MyRuntimeProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import './globals.css';

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { WhatsAppSidebar } from "@/components/whatsapp-sidebar"
import { useState } from "react"
import { seamstresses } from "@/types/seamstress"

const inter = Inter({ subsets: ["latin"] })


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
	const [selectedSeamstress, setSelectedSeamstress] = useState(seamstresses[0])

	return (
		<ClerkProvider>
			<MyRuntimeProvider>
				<html lang='en' suppressHydrationWarning>
				<body className={inter.className}>
					<div className="flex h-screen">
					<Sidebar />
					<main className="flex-1 overflow-hidden">{children}</main>
					<WhatsAppSidebar seamstresses={seamstresses} setSelectedSeamstress={setSelectedSeamstress} />
					</div>
				</body>
				</html>
			</MyRuntimeProvider>
		</ClerkProvider>
	);
}
