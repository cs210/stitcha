import Image from "next/image"; // ✅ Import Image
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/schemas/global.types";
import { Draggable } from "@hello-pangea/dnd";
import { Trash2, Calendar, Box, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function KanbanOrderCard({
  order,
  index,
  onDelete,
}: {
  order: Order;
  index: number;
  onDelete: (orderId: string) => void;
}) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Draggable draggableId={order.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white border border-black/20 w-full cursor-pointer hover:border-black/40 transition-colors ${
            snapshot.isDragging ? "ring-2 ring-blue-500 shadow-lg" : ""
          }`}
          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
        >
          <div className="p-4 relative">
            <h3 className="font-medium text-base mb-3">#ORD-1001</h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{order.client}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Box className="h-4 w-4" />
                <span>2 products</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <div className="flex gap-2">
                  <span>Due:</span>
                  <span className="text-gray-900">
                    {formatDate(order.due_date)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600 h-7 w-7 bg-white/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(order.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
