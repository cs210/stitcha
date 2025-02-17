import { Droppable } from "@hello-pangea/dnd"
import { MoreHorizontal, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { ProductCard } from "./product-card"

interface KanbanColumnProps {
  title: string
  id: string
  products: any[]
  seamstresses: any[]
  onAssign: (productId: string, seamstress: any) => void
}

export function KanbanColumn({ title, id, products, seamstresses, onAssign }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Droppable droppableId={id}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                seamstresses={seamstresses}
                onAssign={onAssign}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
