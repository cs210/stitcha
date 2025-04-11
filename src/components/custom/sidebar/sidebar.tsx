'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserButton } from '@clerk/nextjs';
import { BrainIcon, ClipboardIcon, KanbanIcon, SettingsIcon, ShirtIcon, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarTooltip } from './sidebar-tooltip';

const navRoutes = [
	{ href: '/dashboard/kanban', icon: KanbanIcon, label: 'Kanban' },
	{ href: '/dashboard/products', icon: ShirtIcon, label: 'Products' },
	{ href: '/dashboard/orders', icon: ClipboardIcon, label: 'Orders' },
	{ href: '/dashboard/seamstresses', icon: Users, label: 'Seamstresses' },
	{ href: '/dashboard/settings', icon: SettingsIcon, label: 'Settings' },
	{ href: '/dashboard/assistant', icon: BrainIcon, label: 'Assistant' },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<div className='flex h-full w-[72px] flex-col items-center border-r px-3 py-5'>
			<div className='flex flex-col gap-4'>
				{navRoutes.map(({ href, icon: Icon, label }) => (
					<SidebarTooltip key={href} label={label}>
						<Button variant='ghost' size='icon' className={cn('h-10 w-10', pathname === href && 'bg-primary text-white')} asChild>
							<Link href={href}>
								<Icon className='h-5 w-5' />
							</Link>
						</Button>
					</SidebarTooltip>
				))}
			</div>

			<div className='mt-auto'>
				<SidebarTooltip label='Sign out'>
					<UserButton />
				</SidebarTooltip>
			</div>
		</div>
	);
}
