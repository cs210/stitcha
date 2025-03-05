'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/functions/utils';
import { UserButton } from '@clerk/nextjs';
import { ClipboardIcon, LayoutGridIcon, Settings2Icon, ShoppingCart, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const navRoutes = [
	{ href: '/dashboard/kanban', icon: LayoutGridIcon, label: 'Kanban' },
	{ href: '/dashboard/products', icon: ClipboardIcon, label: 'Products' },
	{ href: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
	{ href: '/dashboard/seamstresses', icon: Users, label: 'Seamstresses' },
	{ href: '/dashboard/settings', icon: Settings2Icon, label: 'Settings' },
	{ href: '/dashboard/assistant', icon: MessageSquare, label: 'Assistant' },
];

export function Sidebar() {
	const pathname = usePathname();

	return (
		<div className='flex h-full w-[72px] flex-col items-center border-r px-3 py-5'>
			<div className='flex flex-col gap-4'>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<UserButton />
						</TooltipTrigger>
						<TooltipContent>
							<p>Sign out</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				{navRoutes.map(({ href, icon: Icon, label }) => (
					<TooltipProvider key={href}>
						<Tooltip>
							<TooltipTrigger>
								<Button variant='ghost' size='icon' className={cn('h-10 w-10', pathname === href && 'bg-primary text-white')} asChild>
									<Link href={href}>
										<Icon className='h-5 w-5' />
									</Link>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{label}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				))}
			</div>
		</div>
	);
}
