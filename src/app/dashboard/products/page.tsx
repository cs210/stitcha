"use client";

import { Description } from "@/components/custom/description";
import { Header } from "@/components/custom/header";
import { HeaderContainer } from "@/components/custom/header-container";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/utils/schemas/global.types";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [progressFilter, setProgressFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "name" | "weight" | "product_type" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function getProducts() {
      try {
        const response = await fetch("/api/products");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error);
        }

        const { data } = result;

        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    getProducts();
  }, []);

  // Get unique progress levels and product types
  const progressLevels = [
    "all",
    ...new Set(products.map((product) => product.progress_level)),
  ];

  const productTypes = [
    "all",
    ...new Set(products.map((product) => product.product_type)),
  ];

  // Update filtered products to include type filter
  const filteredProducts = products.filter((product) => {
    const matchesProgressFilter =
      progressFilter === "all" || product.progress_level === progressFilter;
    const matchesTypeFilter =
      typeFilter === "all" || product.product_type === typeFilter;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesProgressFilter && matchesTypeFilter && matchesSearch;
  });

  // 🔄 Sort products based on selected column
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortBy) return 0;
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === "weight") {
      valA = Number(valA);
      valB = Number(valB);
    }

    return sortOrder === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
  });

  // 🔀 Toggle sorting function
  const toggleSort = (column: "name" | "weight" | "product_type") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // Remove the product from the local state
      setProducts(products.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="p-6 pb-12 h-screen overflow-auto">
      <HeaderContainer className="mb-4">
        <div className="flex-1 flex justify-between items-center">
          <div>
            <Header text="Products" />
            <Description text="Comprehensive overview of all current and past goods producted by Orientavida." />
          </div>
          <Button
            size="default"
            variant="ghost"
            className="rounded-full hover:bg-primary hover:text-white px-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </div>
      </HeaderContainer>

      <div className="flex gap-4 mb-4 w-full">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-5/6"
        />
        <div className="flex gap-4 w-1/6">
          <Select
            value={progressFilter}
            onValueChange={setProgressFilter}
            className="w-1/2"
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by progress" />
            </SelectTrigger>
            <SelectContent>
              {progressLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level === "all" ? "Progress" : level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
            className="w-1/2"
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pb-10">
        <Table className="border-t-0">
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Image</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("name")}>
                  Name <ArrowUpDown size={16} />
                </Button>
              </TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length ? (
              currentItems.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={(e) => {
                    if (
                      !(e.target as HTMLElement).closest(".actions-dropdown")
                    ) {
                      router.push(`/dashboard/products/${product.id}`);
                    }
                  }}
                >
                  <TableCell className="py-6">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-40 h-40 object-contain rounded-lg bg-white p-2 border"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="text-lg font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Type: {product.product_type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-base">
                      <div
                        className={`h-4 w-4 rounded-full ${
                          product.progress_level === "In Progress"
                            ? "bg-yellow-400"
                            : product.progress_level === "Done"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      {product.progress_level}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="actions-dropdown">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/dashboard/products/${product.id}`);
                            }}
                            className="text-base py-3"
                          >
                            <Pencil className="mr-2 h-5 w-5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
                            }}
                            className="text-red-600 text-base py-3"
                          >
                            <Trash className="mr-2 h-5 w-5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-lg">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, sortedProducts.length)} of{" "}
            {sortedProducts.length} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
