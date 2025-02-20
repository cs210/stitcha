import { Draggable } from "@hello-pangea/dnd"
import { Clock, Pencil, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { Product } from "@/types/kanban"

interface ProductCardProps {
  product: Product
  index: number
  onDelete: (productId: string) => void
}

export function ProductCard({ product, index, onDelete }: ProductCardProps) {
  const router = useRouter()
  const assignedSeamstress = product.assignees[0]

  return (
    <Draggable draggableId={product.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white rounded-lg shadow px-5 py-3 relative group min-w-[380px] cursor-pointer"
          onClick={() => router.push(`/edit/${product.id}`)}
        >
          <div className="absolute top-3 right-5 flex gap-2 z-10">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-gray-600 h-7 w-7 bg-white/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/edit/${product.id}`)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-red-600 h-7 w-7 bg-white/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(product.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-4 pt-8">
            <div className="flex-1">
              <h3 className="font-medium line-clamp-1 pr-24">{product.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                  {product.type}
                </Badge>
                {assignedSeamstress && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={assignedSeamstress.avatar} />
                      <AvatarFallback>{assignedSeamstress.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{assignedSeamstress.name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {product.date}
                </div>
                <div>{product.quantity ? `${product.quantity} units` : product.progress}</div>
              </div>
            </div>

            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image 
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 96px"
                priority={index < 2}
                quality={75}
              />
            </div>
          </div>

          {product.assignees.length > 1 && (
            <div className="flex justify-end mt-2 -space-x-2">
              {product.assignees.slice(1).map((assignee, i) => (
                <Avatar 
                  key={`${product.id}-${assignee.id}-${i}-${Math.random().toString(36)}`}
                  className="border-2 border-white w-6 h-6"
                >
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
