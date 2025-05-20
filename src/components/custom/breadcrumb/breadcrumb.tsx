'use client';

import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, Breadcrumb as NavigationBreadcrumb } from '@/components/ui/breadcrumb';

// Breadcrumb element for dashboard
export function Breadcrumb({ dict, segments }: { dict: any, segments: string[] }) {
	return (
		<NavigationBreadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href='/dashboard/products'>{dict.navigation.dashboard}</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href={`/dashboard/${segments[1]}`}>{segments[1].charAt(0).toUpperCase() + segments[1].slice(1)}</BreadcrumbLink>
				</BreadcrumbItem>
			</BreadcrumbList>
		</NavigationBreadcrumb>
	);
}
