'use client';

import { Breadcrumb } from '@/components/custom/breadcrumb/breadcrumb';
import { Loader } from '@/components/custom/loader/loader';
import { Sidebar } from '@/components/custom/sidebar/sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { LangContext } from '@/lib/lang/LangContext';
import { getDictionary } from '@/lib/lang/locales';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
	const { lang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState(true);

	const pathname = usePathname();
	const segments = pathname.split('/').filter(Boolean);

	useEffect(() => {
		(async () => {
			const dict = await getDictionary(lang);

			setDict(dict);
			setLoading(false);
		})();
	}, [lang]);

	if (loading) return <Loader />;	

	return (
		<SidebarProvider>
			<div className='flex w-full h-screen'>
				<Sidebar dict={dict} />

				<main className='flex-1 overflow-x-hidden overflow-y-auto p-8'>
					<header className='flex items-center gap-4'>
						<SidebarTrigger />
						<Breadcrumb dict={dict} segments={segments} />
					</header>

					<div className='flex-1 flex-col h-full pt-8'>{children}</div>
				</main>

				<Toaster />
			</div>
		</SidebarProvider>
	);
}
