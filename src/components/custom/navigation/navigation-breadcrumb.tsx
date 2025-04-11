import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export function NavigationBreadcrumb({
	isProductDetails,
	isOrderDetails,
	isSeamstressDetails,
	segments,
	formattedPage,
}: {
	isProductDetails: boolean;
	isOrderDetails: boolean;
	isSeamstressDetails: boolean;
	segments: string[];
	formattedPage: string;
}) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				{isProductDetails || isOrderDetails || isSeamstressDetails ? (
					<>
						<BreadcrumbItem>
							<BreadcrumbLink href={`/dashboard/${segments[1]}`}>{segments[1].charAt(0).toUpperCase() + segments[1].slice(1)}</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{formattedPage}</BreadcrumbPage>
						</BreadcrumbItem>
					</>
				) : (
					<BreadcrumbItem>
						<BreadcrumbPage>{formattedPage}</BreadcrumbPage>
					</BreadcrumbItem>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
