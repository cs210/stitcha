'use client';

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type LucideIcon } from 'lucide-react';

export function NavMain({
	items,
}: {
	items: {
		name: string;
		url: string;
		icon: LucideIcon;
	}[];
}) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Stitcha</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<SidebarMenuItem key={item.name}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.name}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</TooltipTrigger>
							<TooltipContent>
								<p>{item.name}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
