'use client';

import { NavigationBreadcrumb } from '@/components/custom/navigation/navigation-breadcrumb';
import { Sidebar } from '@/components/custom/sidebar/sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { getDictionary } from '../locales';
import { LangContext } from '../layout';

export default function Layout({ children }: { children: React.ReactNode }) {
	const { lang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();

	const pathname = usePathname();
	const segments = pathname.split('/').filter(Boolean);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const dict = await getDictionary(lang);

			setDict(dict);
			setLoading(false);
		})();
	}, [lang]);

	if (loading) {
		return;
	}

	return (
		<SidebarProvider>
			<div className='flex w-full h-screen'>
				<Sidebar dict={dict} />

				<main className='flex-1 overflow-x-hidden overflow-y-auto p-8'>
					<header className='flex items-center gap-4'>
						<SidebarTrigger />

						<NavigationBreadcrumb segments={segments} formattedPage={segments[segments.length - 1]} />
					</header>

					<div className='flex-1 flex-col h-full pt-8'>{children}</div>
				</main>

				<Toaster />
			</div>
		</SidebarProvider>
	);
}
