'use client';

import {
	Sidebar as SidebarComponent,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UserButton } from '@clerk/nextjs';
import { BrainIcon, KanbanIcon, SettingsIcon, ShirtIcon, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { H4 } from '../text/headings';

// Sidebar component for the dashboard
export function Sidebar({ dict }: { dict: any }) {
	const pathname = usePathname();

	const navRoutes = [
		{
			title: dict.sidebar.stitchaAi,
			url: '/dashboard/assistant',
			icon: BrainIcon,
		},
		{
			title: dict.sidebar.kanban,
			url: '/dashboard/kanban',
			icon: KanbanIcon,
		},
		{
			title: dict.sidebar.products,
			url: '/dashboard/products',
			icon: ShirtIcon,
		},
		{
			title: dict.sidebar.seamstresses,
			url: '/dashboard/seamstresses',
			icon: Users,
		},
		{
			title: dict.sidebar.settings,
			url: '/dashboard/settings',
			icon: SettingsIcon,
		},
	];

	return (
		<SidebarComponent>
			<Link href='/dashboard/products'>
				<SidebarHeader className='flex flex-row items-center p-4'>
					<Image src='/images/orientavida.jpeg' alt='Stitcha Logo' width={30} height={30} />

					<H4>{dict.sidebar.stitcha}</H4>
				</SidebarHeader>
			</Link>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navRoutes.map((navRoute) => (
								<SidebarMenuItem key={navRoute.title}>
									<SidebarMenuButton asChild isActive={pathname.startsWith(navRoute.url)}>
										<Link href={navRoute.url} className='flex items-center gap-3'>
											<navRoute.icon />
											<span>{navRoute.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className='justify-center items-center p-4'>
				<UserButton
					appearance={{
						elements: {
							userButtonBox: {
								padding: '8px',
							},
						},
					}}
					showName={true}
				/>
			</SidebarFooter>
		</SidebarComponent>
	);
}
