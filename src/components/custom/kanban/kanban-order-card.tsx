import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/schemas/global.types";
import { Draggable } from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";
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

  return (
    <Draggable draggableId={order.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white rounded-lg shadow px-4 py-3 relative group w-full cursor-pointer"
          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
        >
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-red-600 h-7 w-7 bg-white/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(order.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-2 pt-8">
            <h3 className="font-medium line-clamp-1 pr-10">{order.client}</h3>
            <Badge variant="outline" className="text-gray-600 w-fit">
              ID: {order.id}
            </Badge>
          </div>
        </div>
      )}
    </Draggable>
  );
}
