"use client";

import { Sidebar } from "@/components/custom/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [productName, setProductName] = useState<string>("");
  const [orderClient, setOrderClient] = useState<string>("");
  const [seamstressName, setSeamstressName] = useState<string>("");

  // Fetch product, order, or seamstress details if we're on a details page
  useEffect(() => {
    async function getDetails() {
      if (
        segments[1] === "products" &&
        segments.length === 3 &&
        segments[2] !== "new"
      ) {
        try {
          const response = await fetch(`/api/products/${segments[2]}`);
          const data = await response.json();
          if (data?.name) {
            setProductName(data.name);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      } else if (
        segments[1] === "orders" &&
        segments.length === 3 &&
        segments[2] !== "new"
      ) {
        try {
          const response = await fetch(`/api/orders/${segments[2]}`);
          const data = await response.json();
          if (data?.client) {
            setOrderClient(data.client);
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        }
      } else if (segments[1] === "seamstresses" && segments.length === 3) {
        try {
          const response = await fetch(`/api/seamstresses/${segments[2]}`);
          const { data } = await response.json();
          if (data?.first_name && data?.last_name) {
            setSeamstressName(`${data.first_name} ${data.last_name}`);
          }
        } catch (error) {
          console.error("Error fetching seamstress:", error);
        }
      }
    }
    getDetails();
  }, [segments]);

  // Determine what to show in the breadcrumb
  const isProductDetails =
    segments[1] === "products" &&
    segments.length === 3 &&
    segments[2] !== "new";
  const isOrderDetails =
    segments[1] === "orders" && segments.length === 3 && segments[2] !== "new";
  const isSeamstressDetails =
    segments[1] === "seamstresses" && segments.length === 3;
  const isNewProduct = segments[1] === "products" && segments[2] === "new";
  const isNewOrder = segments[1] === "orders" && segments[2] === "new";

  const currentPage = segments[segments.length - 1];
  const formattedPage = isProductDetails
    ? productName
    : isOrderDetails
    ? orderClient
    : isSeamstressDetails
    ? seamstressName
    : isNewProduct
    ? "New Product"
    : isNewOrder
    ? "New Order"
    : currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
        <header>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {isProductDetails ||
              isOrderDetails ||
              isSeamstressDetails ||
              isNewProduct ||
              isNewOrder ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/dashboard/${segments[1]}`}>
                      {segments[1].charAt(0).toUpperCase() +
                        segments[1].slice(1)}
                    </BreadcrumbLink>
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
        </header>

        <div className="flex-1 flex-col h-full pt-8">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
