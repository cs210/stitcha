"use client";

import { NavigationBreadcrumb } from "@/components/custom/navigation/navigation-breadcrumb";
import { Sidebar } from "@/components/custom/sidebar/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // const [productName, setProductName] = useState<string>("");
  // const [orderClient, setOrderClient] = useState<string>("");
  // const [seamstressName, setSeamstressName] = useState<string>("");

	useEffect(() => {
		// async function getDetails() {
		// 	// Get product details based on segments
		// 	if (segments[1] === 'products' && segments.length === 3) {
		// 		try {
		// 			const response = await fetch(`/api/products/${segments[2]}`);
		// 			const data = await response.json();

		// 			if (data?.name) {
		// 				setProductName(data.name);
		// 			}
		// 		} catch (error) {
		// 			console.error('Error fetching product:', error);
		// 		}
		// 	}
		// 	// Get order details based on segments
		// 	else if (segments[1] === 'orders' && segments.length === 3) {
		// 		try {
		// 			const response = await fetch(`/api/orders/${segments[2]}`);
		// 			const data = await response.json();

		// 			if (data?.client) {
		// 				setOrderClient(data.client);
		// 			}
		// 		} catch (error) {
		// 			console.error('Error fetching order:', error);
		// 		}
		// 	}
		// 	// Get seamstress details based on segments
		// 	else if (segments[1] === 'seamstresses' && segments.length === 3) {
		// 		try {
		// 			const response = await fetch(`/api/seamstresses/${segments[2]}`);
		// 			const { data } = await response.json();

		// 			if (data?.first_name && data?.last_name) {
		// 				setSeamstressName(`${data.first_name} ${data.last_name}`);
		// 			}
		// 		} catch (error) {
		// 			console.error('Error fetching seamstress:', error);
		// 		}
		// 	}
		// }

		// getDetails();
	}, [segments]);

  // Determine what to show in the breadcrumb
  const isProductDetails = segments[1] === "products" && segments.length === 3;
  const isOrderDetails = segments[1] === "orders" && segments.length === 3;
  const isSeamstressDetails =
    segments[1] === "seamstresses" && segments.length === 3;

  const currentPage = segments[segments.length - 1];
  let formattedPage =
    currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

	return (
		<div className='flex h-screen'>
			<Sidebar />

			<main className='flex-1 overflow-x-hidden overflow-y-auto p-8'>
				<header>
					<NavigationBreadcrumb
						isProductDetails={isProductDetails}
						isOrderDetails={isOrderDetails}
						isSeamstressDetails={isSeamstressDetails}
						segments={segments}
						formattedPage={formattedPage}
					/>
				</header>

				<div className='flex-1 flex-col h-full pt-8'>{children}</div>
			</main>

			<Toaster />
		</div>
	);
}
