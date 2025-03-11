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

  // Fetch product name if we're on a product details page
  useEffect(() => {
    async function getProductName() {
      if (segments[1] === "products" && segments.length === 3) {
        try {
          const response = await fetch(`/api/products/${segments[2]}`);
          const data = await response.json();
          if (data?.name) {
            setProductName(data.name);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      }
    }
    getProductName();
  }, [segments]);

  // Determine what to show in the breadcrumb
  const isProductDetails = segments[1] === "products" && segments.length === 3;
  const isProductsPage = segments[1] === "products" && segments.length === 2;
  const currentPage = segments[segments.length - 1];
  const formattedPage = isProductDetails
    ? productName
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
              {isProductDetails ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard/products">
                      Products
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
