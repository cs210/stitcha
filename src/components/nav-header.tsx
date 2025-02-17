'use client';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { GalleryVerticalEnd } from 'lucide-react';

export function NavHeader() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size='lg' asChild>
					<a href='/dashboard/stitcha-assistant'>
						<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
							<GalleryVerticalEnd className='size-4' />
						</div>
						<div className='flex flex-col gap-0.5 leading-none'>
							<span className='font-semibold'>Stitcha</span>
						</div>
					</a>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
