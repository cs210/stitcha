import { Order } from "@/lib/schemas/global.types";
import { Droppable, DroppableProvided } from "@hello-pangea/dnd";
import { KanbanOrderCard } from "./kanban-order-card";

export function KanbanColumn({
  title,
  id,
  orders = [],
  onDelete,
}: {
  title: string;
  id: string;
  orders: Order[];
  onDelete: (orderId: string) => void;
}) {
  return (
    <div className="flex flex-col w-full min-w-[350px] max-w-md h-full bg-white">
      <div className="flex items-center gap-2 mb-4 px-3">
        <div className="bg-gray-100 px-2 py-1 rounded-full">
          <h2 className="text-sm font-medium text-gray-700">{title}</h2>
        </div>
        <span className="text-sm text-gray-500">({orders.length})</span>
      </div>
      <Droppable droppableId={id}>
        {(provided: DroppableProvided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 space-y-2 overflow-y-auto px-3"
          >
            {(orders || []).map((order, index) => (
              <KanbanOrderCard
                key={order.id}
                order={order}
                index={index}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
