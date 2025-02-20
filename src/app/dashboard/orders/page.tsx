"use client";

import { useEffect, useState } from "react";
import { fetchOrders } from "@/lib/supabase"; // ✅ Import API function
import { Header } from "@/components/custom/header";
import { HeaderContainer } from "@/components/custom/header-container";
import { Description } from "@/components/custom/description";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface Order {
  id: string;
  client: string;
  contact: string;
  order_quantity: number;
  due_date: string;
  product_id: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "client" | "due_date" | "order_quantity" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    async function getOrders() {
      const data = await fetchOrders(); // ✅ Fetch from supabase.ts
      setOrders(data);
    }
    getOrders();
  }, []);

  // 🔍 Filter orders based on search query
  const filteredOrders = orders.filter((order) =>
    [order.id, order.client, order.contact]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // 🔄 Sort orders based on selected column
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

  // 🔀 Toggle sorting function
  const toggleSort = (column: "client" | "due_date" | "order_quantity") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-6">
      <HeaderContainer>
        <Header text="Orders" />
        <Description text="Manage and track customer orders." />
      </HeaderContainer>

      {/* 🔍 Search Input */}
      <Input
        placeholder="Search orders by ID, client, or contact..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full"
      />

      {/* 📋 Orders Table */}
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
              <TableRow key={order.id}>
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
    </div>
  );
}
