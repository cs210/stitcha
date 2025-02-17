import { Draggable } from "@hello-pangea/dnd"
import { Clock, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: any
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  const router = useRouter()
  const assignedSeamstress = product.assignees[0]

  return (
    <Draggable draggableId={product.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white rounded-lg shadow p-4 pt-10 space-y-4 relative"
        >
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 px-2 py-1"
            onClick={() => router.push(`/edit/${product.id}`)}
          >
            Edit
          </Button>
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-600">
            {product.type}
          </Badge>
          <h3 className="font-medium">{product.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {product.date}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{assignedSeamstress.name}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>{product.progress}</div>
            <div className="flex -space-x-2">
              {product.assignees.map((assignee: any, i: number) => (
                <Avatar key={i} className="border-2 border-white w-6 h-6">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
