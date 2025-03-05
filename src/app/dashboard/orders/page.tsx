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
import { Order } from "@/utils/schemas/global.types";
import { ArrowUpDown, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "client" | "due_date" | "order_quantity" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function getOrders() {
      const response = await fetch("/api/orders");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      const { data } = result;

      setOrders(data);
    }
    getOrders();
  }, []);

  // filter orders based on search query
  const filteredOrders = orders.filter((order) =>
    [order.id, order.client, order.contact]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // sort orders based on selected column
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortBy) return 0;
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === "due_date") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else if (sortBy === "order_quantity") {
      valA = Number(valA);
      valB = Number(valB);
    }

    return sortOrder === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
  });

  // toggle sorting function
  const toggleSort = (column: "client" | "due_date" | "order_quantity") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const Modal = ({
    order,
    onClose,
  }: {
    order: Order | null;
    onClose: () => void;
  }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Order Details</h2>
            <button onClick={onClose} className="p-1">
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <p>
                <strong>Order ID:</strong> {order.id}
              </p>
              <p>
                <strong>Client:</strong> {order.client}
              </p>
              <p>
                <strong>Contact:</strong> {order.contact}
              </p>
            </div>
            <div className="space-y-3">
              <p>
                <strong>Order Quantity:</strong> {order.order_quantity}
              </p>
              <p>
                <strong>Due Date:</strong>{" "}
                {new Date(order.due_date).toLocaleDateString("en-US")}
              </p>
              <p>
                <strong>Product ID:</strong> {order.product_id}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <HeaderContainer className="mb-4">
        <Header text="Orders" />
        <Description text="Manage and track customer orders." />
      </HeaderContainer>

      {/* search Input and New Order button */}
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search orders by ID, client, or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Button asChild>
          <a href="/dashboard/orders/new">
            <Plus size={16} className="mr-2" />
            New Order
          </a>
        </Button>
      </div>

      {/* Orders Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => toggleSort("client")}>
                Client <ArrowUpDown size={16} />
              </Button>
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => toggleSort("order_quantity")}
              >
                Quantity <ArrowUpDown size={16} />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => toggleSort("due_date")}>
                Due Date <ArrowUpDown size={16} />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.length ? (
            sortedOrders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedOrder(order)}
              >
                <TableCell>{order.client}</TableCell>
                <TableCell>{order.contact}</TableCell>
                <TableCell>{order.order_quantity}</TableCell>
                <TableCell>
                  {new Date(order.due_date).toLocaleDateString("en-US")}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedOrder && (
        <Modal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
