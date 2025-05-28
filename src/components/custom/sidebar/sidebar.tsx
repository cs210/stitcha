'use client';

import {
	Sidebar as SidebarComponent,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UserButton, useUser } from '@clerk/nextjs';
import { GraduationCapIcon, HeartPulseIcon, KanbanIcon, LoaderIcon, SettingsIcon, ShirtIcon, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { H4 } from '../text/headings';

// Sidebar component for the dashboard
export function Sidebar({ dict }: { dict: any }) {
	const pathname = usePathname();
	const { user } = useUser();

	const adminRoutes = [
		{
			title: dict.general.sidebar.admins.kanban,
			url: '/dashboard/kanban',
			icon: KanbanIcon,
		},
		{
			title: dict.general.sidebar.admins.products,
			url: '/dashboard/products',
			icon: ShirtIcon,
		},
		{
			title: dict.general.sidebar.admins.seamstresses,
			url: '/dashboard/seamstresses',
			icon: Users,
		},
		{
			title: dict.general.sidebar.admins.wellness,
			url: '/dashboard/wellness',
			icon: HeartPulseIcon,
		}
	];

	const seamstressRoutes = [
		{
			title: dict.general.sidebar.seamstresses.education,
			url: '/dashboard/education',
			icon: GraduationCapIcon,
		},
		{
			title: dict.general.sidebar.seamstresses.progress,
			url: `/dashboard/progress/${user?.id}`,
			icon: LoaderIcon,
		},
	];

	const generalRoutes = [
		{
			title: dict.general.sidebar.general.settings,
			url: '/dashboard/settings',
			icon: SettingsIcon,
		},
	];

	return (
		<SidebarComponent>
			<Link href='/dashboard/products'>
				<SidebarHeader className='flex flex-row items-center p-4'>
					<Image src='/images/orientavida.jpeg' alt={dict.general.sidebar.stitcha} width={30} height={30} />

					<H4>{dict.general.sidebar.stitcha}</H4>
				</SidebarHeader>
			</Link>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>{dict.general.sidebar.admins.label}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{adminRoutes.map((adminRoute) => (
								<SidebarMenuItem key={adminRoute.title}>
									<SidebarMenuButton asChild isActive={pathname.startsWith(adminRoute.url)}>
										<Link href={adminRoute.url} className='flex items-center gap-3'>
											<adminRoute.icon />
											<span>{adminRoute.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>{dict.general.sidebar.seamstresses.label}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{seamstressRoutes.map((seamstressRoute) => (
								<SidebarMenuItem key={seamstressRoute.title}>
									<SidebarMenuButton asChild isActive={pathname.startsWith(seamstressRoute.url)}>
										<Link href={seamstressRoute.url} className='flex items-center gap-3'>
											<seamstressRoute.icon />
											<span>{seamstressRoute.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>{dict.general.sidebar.general.label}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{generalRoutes.map((generalRoute) => (
								<SidebarMenuItem key={generalRoute.title}>
									<SidebarMenuButton asChild isActive={pathname.startsWith(generalRoute.url)}>
										<Link href={generalRoute.url} className='flex items-center gap-3'>
											<generalRoute.icon />
											<span>{generalRoute.title}</span>
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
