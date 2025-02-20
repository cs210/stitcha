import { Draggable } from "@hello-pangea/dnd"
import { Clock, User, Pencil, Trash2 } from "lucide-react"
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
          className="bg-white rounded-lg shadow p-4 pt-10 space-y-4 relative group"
        >
          <div className="absolute top-1 right-1 flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => router.push(`/edit/${product.id}`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-red-600"
              onClick={() => onDelete(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image 
              src={product.image.startsWith('/') ? product.image : `/images/${product.image}`} 
              alt={product.title} 
              fill 
              className="object-cover" 
            />
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-600">
            {product.type}
          </Badge>
          <h3 className="font-medium">{product.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {product.date}
            </div>
            {assignedSeamstress && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{assignedSeamstress.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>{product.quantity ? `${product.quantity} units` : product.progress}</div>
            <div className="flex -space-x-2">
              {product.assignees.map((assignee, i) => (
                <Avatar key={i} className="border-2 border-white w-6 h-6">
                  <AvatarImage 
                    src={assignee.avatar.startsWith('/') ? assignee.avatar : `/images/${assignee.avatar}`} 
                  />
                  <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
          {product.description && (
            <p className="text-sm text-gray-500">{product.description}</p>
          )}
        </div>
      )}
    </Draggable>
  )
}
