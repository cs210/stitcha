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
    <div className="flex flex-col w-full min-w-[350px] max-w-md h-full bg-gray-50 p-4 rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <Droppable droppableId={id}>
        {(provided: DroppableProvided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 space-y-4 overflow-y-auto"
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
