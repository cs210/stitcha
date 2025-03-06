"use client";

import { User } from "@/lib/schemas/global.types";
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { KanbanColumn } from "./kanban-column";

interface Product {
  id: string;
  name: string;
  image_url: string;
  type: string;
  progress_level: string;
  created_at: string;
  assignees: User[];
  progress: string;
  description: string;
  quantity: number;
}

// Update the STATUS_MAPPING to have reverse mapping as well
const STATUS_MAPPING = {
  notStarted: "Not Started",
  inProgress: "In Progress",
  done: "Done",
} as const;

const REVERSE_STATUS_MAPPING = {
  "Not Started": "notStarted",
  "In Progress": "inProgress",
  Done: "done",
} as const;

export function KanbanBoard() {
  const [products, setProducts] = useState<Record<string, Product[]>>({
    notStarted: [],
    inProgress: [],
    done: [],
  });

  console.log("products", products);

  // Fetch products from API route on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error);
        }

        const { data } = result;

        // Map status to column IDs
        const getColumnId = (progress_level: string) => {
          return (
            REVERSE_STATUS_MAPPING[
              progress_level as keyof typeof REVERSE_STATUS_MAPPING
            ] || "notStarted"
          );
        };

        // Organize products by status and ensure unique IDs
        const organized = data.reduce(
          (acc: Record<string, Product[]>, product: Product) => {
            const columnId = getColumnId(product.progress_level);
            return {
              ...acc,
              [columnId]: [
                ...(acc[columnId] || []),
                {
                  id: product.id,
                  title: product.name || "Untitled",
                  image: product.image_url,
                  type: product.type || "Prototype",
                  date: new Date(product.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  ),
                  assignees: product.assignees || [],
                  progress: product.progress_level || "Not Started",
                  description: product.description || "",
                  quantity: product.quantity?.toString() || "0",
                },
              ],
            };
          },
          {
            notStarted: [],
            inProgress: [],
            done: [],
          }
        );

        setProducts(organized);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();

    // Set up polling for updates every 30 seconds
    const intervalId = setInterval(fetchProducts, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const newProducts = { ...products };
    const sourceColumn = [...newProducts[source.droppableId]];
    const destColumn =
      source.droppableId === destination.droppableId
        ? sourceColumn
        : [...newProducts[destination.droppableId]];

    // Remove from source
    const [removed] = sourceColumn.splice(source.index, 1);

    // Add to destination
    if (source.droppableId === destination.droppableId) {
      // If moving within same column, use the same array
      sourceColumn.splice(destination.index, 0, removed);
    } else {
      // If moving to different column, use destination array
      destColumn.splice(destination.index, 0, removed);
    }

    const updated = {
      ...newProducts,
      [source.droppableId]: sourceColumn,
    };

    // Only update destination column if it's different from source
    if (source.droppableId !== destination.droppableId) {
      updated[destination.droppableId] = destColumn;
    }

    console.log("updated", updated);

    // Update local state
    setProducts(updated);

    // Only make API call if moving between columns
    if (source.droppableId !== destination.droppableId) {
      // Extract original product ID from the unique ID

      // Update progress_level in Supabase
      try {
        const newStatus =
          STATUS_MAPPING[
            destination.droppableId as keyof typeof STATUS_MAPPING
          ];
        const response = await fetch(`/api/products/${draggableId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            progress_level: newStatus,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update product status");
        }
      } catch (error) {
        console.error("Error updating product status:", error);
        // Revert local state if update fails
        setProducts(newProducts);
      }
    }
  };

  const addNewProduct = async () => {
    // const defaultImage = 'default-product.png';
    // const newProduct = {
    // 	name: 'Untitled',
    // 	image_url: defaultImage,
    // 	type: 'Prototype',
    // 	progress_level: 'Not Started',
    // 	created_at: new Date().toISOString(),
    // 	assignees: [],
    // 	progress: '0/8',
    // 	description: '',
    // 	quantity: 0,
    // };
    // TODO: Add API endpoint to create new product
    // After creation, redirect to edit page
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <Button
            size="default"
            variant="ghost"
            className="rounded-full hover:bg-primary hover:text-white px-6"
            onClick={addNewProduct}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-6 p-6 pt-0 h-full">
            <KanbanColumn
              title="Not Started"
              id="notStarted"
              products={products.notStarted}
              seamstresses={[]}
              onAssign={() => {}}
              onDelete={() => {}}
            />
            <KanbanColumn
              title="In Progress"
              id="inProgress"
              products={products.inProgress}
              seamstresses={[]}
              onAssign={() => {}}
              onDelete={() => {}}
            />
            <KanbanColumn
              title="Done"
              id="done"
              products={products.done}
              seamstresses={[]}
              onAssign={() => {}}
              onDelete={() => {}}
            />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
