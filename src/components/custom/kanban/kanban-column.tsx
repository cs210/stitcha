import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/schemas/global.types";
import { Droppable, DroppableProvided } from "@hello-pangea/dnd";
import { P } from "../text/text";
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
    <div className="flex flex-col w-full min-w-[300px] max-w-md h-full bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" className="text-sm px-4 py-1">
          {title}
        </Badge>
        <P text={`(${orders.length})`} color="light-gray" className="text-sm" />
      </div>
      <Droppable droppableId={id}>
        {(provided: DroppableProvided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 space-y-2 overflow-y-auto"
          >
            {orders.map((order, index) => (
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