"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Order } from "@/lib/schemas/global.types";
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { KanbanColumn } from "./kanban-column";

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
  const [orders, setOrders] = useState<Record<string, Order[]>>({
    notStarted: [],
    inProgress: [],
    done: [],
  });
  const [currentSort, setCurrentSort] = useState<string>("Custom");

	const sortOptions = [
		{ label: "Latest to earliest", ascending: false },
		{ label: "Earliest to latest", ascending: true },
	];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error);
        }

        const { data } = result;

        const getColumnId = (progress_level: string) => {
          return (
            REVERSE_STATUS_MAPPING[
              progress_level as keyof typeof REVERSE_STATUS_MAPPING
            ] || "notStarted"
          );
        };

        const organized = data.reduce(
          (acc: Record<string, Order[]>, order: Order) => {
            const columnId = getColumnId(order.progress_level || "notStarted");
						
            return {
              ...acc,
              [columnId]: [...(acc[columnId] || []), order],
            };
          },
          {
            notStarted: [],
            inProgress: [],
            done: [],
          }
        );

        setOrders(organized);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const newOrders = { ...orders };
    const sourceColumn = [...newOrders[source.droppableId]];
    const destColumn =
      source.droppableId === destination.droppableId
        ? sourceColumn
        : [...newOrders[destination.droppableId]];

    const [removed] = sourceColumn.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, removed);
    } else {
      destColumn.splice(destination.index, 0, removed);
    }

    const updated = {
      ...newOrders,
      [source.droppableId]: sourceColumn,
    };

    if (source.droppableId !== destination.droppableId) {
      updated[destination.droppableId] = destColumn;
    }

    setOrders(updated);
    setCurrentSort("Custom");

    // Only make API call if moving between columns
    if (source.droppableId !== destination.droppableId) {
      try {
        const newStatus =
          STATUS_MAPPING[
            destination.droppableId as keyof typeof STATUS_MAPPING
          ];
        const response = await fetch(`/api/orders/${draggableId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            progress_level: newStatus,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update order status");
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        
        setOrders(newOrders);
      }
    }
  };

  const onDelete = async (orderId: string) => {
    try {    
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }
      const newOrders = { ...orders };

      Object.keys(newOrders).forEach((key) => {
        newOrders[key] = newOrders[key].filter((order) => order.id !== orderId);
      });

      setOrders(newOrders);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const sortOrdersByDueDate = (ascending: boolean) => {
    const newOrders = { ...orders };

    Object.keys(newOrders).forEach((key) => {
      newOrders[key] = [...newOrders[key]].sort((a, b) => {
        const comparison =
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        return ascending ? comparison : -comparison;
      });
    });

    setOrders(newOrders);
    setCurrentSort(ascending ? "Earliest to latest" : "Latest to earliest");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-sm bg-white hover:bg-gray-50"
            >
              <span className="text-gray-500 mr-2">Sort by</span>
              <span>{currentSort}</span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            {sortOptions.map(({ label, ascending }) => (
              <DropdownMenuItem
                key={label}
                onClick={() => sortOrdersByDueDate(ascending)}
                className="flex items-center justify-between"
              >
                <span>{label}</span>
                {currentSort === label && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </DropdownMenuItem>
            ))}
            {currentSort === "Custom" && (
              <DropdownMenuItem
                className="flex items-center justify-between"
                disabled
              >
                <span>Custom</span>
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
			
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full">
            <KanbanColumn
              title="Not Started"
              id="notStarted"
              orders={orders.notStarted}
              onDelete={onDelete}
            />
            <KanbanColumn
              title="In Progress"
              id="inProgress"
              orders={orders.inProgress}
              onDelete={onDelete}
            />
            <KanbanColumn
              title="Done"
              id="done"
              orders={orders.done}
              onDelete={onDelete}
            />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
