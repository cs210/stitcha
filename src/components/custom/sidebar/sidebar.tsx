"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import {
	BrainIcon,
	ChevronLeft,
	ClipboardIcon,
	KanbanIcon,
	SettingsIcon,
	ShirtIcon,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navRoutes = [
  { href: "/dashboard/assistant", icon: BrainIcon, label: "Stitcha AI" },
  { href: "/dashboard/kanban", icon: KanbanIcon, label: "Kanban" },
  { href: "/dashboard/products", icon: ShirtIcon, label: "Products" },
  { href: "/dashboard/orders", icon: ClipboardIcon, label: "Orders" },
  { href: "/dashboard/seamstresses", icon: Users, label: "Seamstresses" },
  { href: "/dashboard/settings", icon: SettingsIcon, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  const [isExpanded, setIsExpanded] = useState(false);

  return (
		<div className={cn('flex h-full flex-col border-r p-4 transition-all duration-300', isExpanded ? 'w-[200px]' : 'w-[72px]')}>
			<div className='flex justify-center items-center mb-6'>
				<div className={cn('flex items-center w-full', isExpanded ? 'justify-between' : 'justify-center')}>
					<div className='flex items-center' onClick={() => setIsExpanded(!isExpanded)}>
						<Image src='/images/orientavida.jpeg' alt='Stitcha Logo' width={30} height={30} className={cn('rounded-lg', !isExpanded && 'cursor-pointer')} />

						{isExpanded && <span className='ml-3 font-semibold'>Stitcha</span>}
					</div>
					{isExpanded && (
						<Button variant='ghost' size='icon' onClick={() => setIsExpanded(false)} className='h-8 w-8'>
							<ChevronLeft className='h-4 w-4' />
						</Button>
					)}
				</div>				
			</div>

			<div className='flex flex-col gap-4'>
				{navRoutes.map(({ href, icon: Icon, label }) => {
					const isActive = pathname === href;

					// TODO: We should use a Link component instead of a Button
					return (
						<Button
							key={href}
							variant='ghost'
							className={cn(
								'w-full justify-start',
								isActive && 'bg-primary text-white hover:bg-primary/90 hover:text-white',
								!isExpanded && 'w-10 h-10 justify-center'
							)}
							asChild
						>
							<Link href={href}>
								<Icon className='h-5 w-5' />
								{isExpanded && <span className='ml-2'>{label}</span>}
								{!isExpanded && <span className='sr-only'>{label}</span>}
							</Link>
						</Button>
					);
				})}
			</div>

			<div className='mx-auto mt-auto'>
				<UserButton />
			</div>
		</div>
	);
}
