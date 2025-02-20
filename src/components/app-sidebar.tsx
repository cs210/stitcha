'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ClipboardIcon, LayoutGridIcon, LogOut, Settings2Icon, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function Sidebar() {
	const pathname = usePathname();

	const handleSignOut = async () => {
		try {
			// await signOut()
			// Let Clerk handle the redirect after sign out
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	return (
		<div className='flex h-full w-[72px] flex-col items-center border-r px-3 py-4'>
			<div className='flex flex-col gap-4'>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Button variant='ghost' size='icon' className={cn('h-10 w-10', pathname === '/kanban' && 'bg-primary text-white')} asChild>
								<Link href='/kanban'>
									<LayoutGridIcon className='h-5 w-5' />
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Kanban</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Button variant='ghost' size='icon' className={cn('h-10 w-10', pathname === '/dashboard/products' && 'bg-primary text-white')} asChild>
								<Link href='/dashboard/products'>
									<ClipboardIcon className='h-5 w-5' />
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Products</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Button variant='ghost' size='icon' className={cn('h-10 w-10', pathname === '/dashboard/orders' && 'bg-primary text-white')} asChild>
								<Link href='/dashboard/orders'>
									<ShoppingCart className='h-5 w-5' />
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Orders</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Button variant='ghost' size='icon' className={cn('h-10 w-10', pathname === '/seamstresses' && 'bg-primary text-white')} asChild>
								<Link href='/seamstresses'>
									<Users className='h-5 w-5' />
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Seamstresses</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Button variant='ghost' size='icon' className={cn('h-10 w-10', pathname === '/dashboard/settings' && 'bg-primary text-white')} asChild>
								<Link href='/dashboard/settings'>
									<Settings2Icon className='h-5 w-5' />
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Settings</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Button variant='ghost' size='icon' className='h-10 w-10' onClick={handleSignOut} asChild>
								<LogOut className='h-5 w-5' />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Sign out</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
}
