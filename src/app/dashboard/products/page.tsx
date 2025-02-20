"use client";

import { Description } from "@/components/custom/description";
import { Header } from "@/components/custom/header";
import { HeaderContainer } from "@/components/custom/header-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchProducts } from "@/lib/supabase"; // ✅ Import API function
import { ArrowUpDown, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

interface Product {
  id: string;
  name: string;
  system_code: string;
  inmetro_cert_number: string;
  barcode: string;
  description: string;
  weight: number;
  width: number;
  height: number;
  percent_pieces_lost: number;
  image_url: string;
  product_type: string;
  progress_level: "In Progress" | "Not Started" | "Done";
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nameFilter, setNameFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "name" | "weight" | "product_type" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function getProducts() {
      const data = await fetchProducts();
      setProducts(data);
    }
    getProducts();
  }, []);

  // Get unique product names
  const productNames = [
    "all",
    ...new Set(products.map((product) => product.name)),
  ];

  // Update filtered products to include search functionality
  const filteredProducts = products.filter((product) => {
    const matchesNameFilter =
      nameFilter === "all" || product.name === nameFilter;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesNameFilter && matchesSearch;
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

  const Modal = ({
    product,
    onClose,
  }: {
    product: Product | null;
    onClose: () => void;
  }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <button onClick={onClose} className="p-1">
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 object-contain rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <p>
                <strong>System Code:</strong> {product.system_code}
              </p>
              <p>
                <strong>Cert Number:</strong> {product.inmetro_cert_number}
              </p>
              <p>
                <strong>Barcode:</strong> {product.barcode}
              </p>
              <p>
                <strong>Product Type:</strong> {product.product_type}
              </p>
            </div>
            <div className="space-y-3">
              <p>
                <strong>Weight:</strong> {product.weight} kg
              </p>
              <p>
                <strong>Width:</strong> {product.width} cm
              </p>
              <p>
                <strong>Height:</strong> {product.height} cm
              </p>
              <p>
                <strong>Lost %:</strong> {product.percent_pieces_lost}%
              </p>
            </div>
            <div className="col-span-2">
              <p className="font-bold mb-2">Description:</p>
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
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

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={nameFilter} onValueChange={setNameFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by name" />
          </SelectTrigger>
          <SelectContent>
            {productNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name === "all" ? "All Products" : name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pb-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
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
                    // Prevent row click when clicking on the actions dropdown
                    if (
                      !(e.target as HTMLElement).closest(".actions-dropdown")
                    ) {
                      setSelectedProduct(product);
                    }
                  }}
                >
                  <TableCell>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover"
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
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
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              // Handle edit action
                              console.log("Edit product:", product.id);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // Handle delete action
                              console.log("Delete product:", product.id);
                            }}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
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
                <TableCell colSpan={3} className="text-center">
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

      {selectedProduct && (
        <Modal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
