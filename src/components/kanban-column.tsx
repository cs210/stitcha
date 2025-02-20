import { Droppable } from "@hello-pangea/dnd"
import { MoreHorizontal, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { ProductCard } from "./product-card"
import type { Product, Seamstress } from "@/types/kanban"

interface KanbanColumnProps {
  title: string
  id: string
  products: Product[]
  seamstresses: Seamstress[]
  onAssign: (productId: string, seamstress: Seamstress) => void
  onDelete: (productId: string) => void
}

export function KanbanColumn({ title, id, products, seamstresses, onAssign, onDelete }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[350px] max-w-[350px]">
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
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef} 
            className="space-y-4 min-h-[200px] overflow-y-auto max-h-[calc(100vh-12rem)] p-1"
          >
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                seamstresses={seamstresses}
                onAssign={onAssign}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
