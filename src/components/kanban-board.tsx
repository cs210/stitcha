"use client"

import { DragDropContext } from "@hello-pangea/dnd"
import { useState } from "react"
import { KanbanColumn } from "./kanban-column"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"

type Seamstress = {
  id: string
  name: string
  avatar: string
}

type Product = {
  id: string
  title: string
  image: string
  type: string
  date: string
  assignees: Seamstress[]
  progress: string
}

const seamstresses: Seamstress[] = [
  {
    id: "1",
    name: "Alice",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-16%20at%201.28.17%E2%80%AFPM-lhmofAmlP9fWWqKwmzOBqimGsC6DO0.png",
  },
  {
    id: "2",
    name: "Bob",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-16%20at%201.28.17%E2%80%AFPM-lhmofAmlP9fWWqKwmzOBqimGsC6DO0.png",
  },
  {
    id: "3",
    name: "Carol",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-16%20at%201.28.17%E2%80%AFPM-lhmofAmlP9fWWqKwmzOBqimGsC6DO0.png",
  },
  {
    id: "4",
    name: "Dave",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-16%20at%201.28.17%E2%80%AFPM-lhmofAmlP9fWWqKwmzOBqimGsC6DO0.png",
  },
  {
    id: "5",
    name: "Eve",
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-16%20at%201.28.17%E2%80%AFPM-lhmofAmlP9fWWqKwmzOBqimGsC6DO0.png",
  },
]

const initialProducts: Record<string, Product[]> = {
  paraFazer: [
    {
      id: "2",
      title: "Prototypes for a Bag",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-16%20at%201.38.28%E2%80%AFPM-gRtMrytoozFdTrv3bWn5pyCTs2gGlL.png",
      type: "Research",
      date: "Aug 20, 2021",
      assignees: [seamstresses[2]],
      progress: "0/8",
    },
    {
      id: "3",
      title: "Brown Fluffy Blanket",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-16%20at%2012.51.17%E2%80%AFPM-4Gu7bsXIxuTsf00RR7VVpTuvZp6gXw.png",
      type: "Content",
      date: "Aug 16, 2021",
      assignees: [seamstresses[3], seamstresses[4]],
      progress: "0/8",
    },
  ],
  emAndamento: [
    {
      id: "4",
      title: "Black Plain T-Shirt",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-16%20at%201.38.33%E2%80%AFPM-lnH6pOFAskR2J81qU4OIvM1KP3YL8t.png",
      type: "Design",
      date: "Aug 20, 2021",
      assignees: [seamstresses[0], seamstresses[2]],
      progress: "0/8",
    },
  ],
  revisao: [
    {
      id: "5",
      title: "Red Long-Sleeve Shirt",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-16%20at%201.38.24%E2%80%AFPM-ZNKrb8byLRYSaJLV8hPlZLiNtMfWVk.png",
      type: "Content",
      date: "Aug 16, 2021",
      assignees: [seamstresses[1], seamstresses[4]],
      progress: "0/8",
    },
  ],
}

export function KanbanBoard() {
  const [products, setProducts] = useState(initialProducts)

  const onDragEnd = (result: any) => {
    const { source, destination } = result
    if (!destination) return

    const sourceColumn = products[source.droppableId]
    const destColumn = products[destination.droppableId]
    const [removed] = sourceColumn.splice(source.index, 1)
    destColumn.splice(destination.index, 0, removed)

    setProducts({
      ...products,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    })
  }

  const assignSeamstress = (productId: string, seamstress: Seamstress) => {
    setProducts((prevProducts) => {
      const updatedProducts = { ...prevProducts }
      for (const column of Object.values(updatedProducts)) {
        const product = column.find((p) => p.id === productId)
        if (product) {
          if (!product.assignees.some((a) => a.id === seamstress.id)) {
            product.assignees = [...product.assignees, seamstress]
          }
          break
        }
      }
      return updatedProducts
    })
  }

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button size="icon" variant="ghost" className="rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6">
          <KanbanColumn
            title="Para Fazer"
            id="paraFazer"
            products={products.paraFazer}
            seamstresses={seamstresses}
            onAssign={assignSeamstress}
          />
          <KanbanColumn
            title="Em Andamento"
            id="emAndamento"
            products={products.emAndamento}
            seamstresses={seamstresses}
            onAssign={assignSeamstress}
          />
          <KanbanColumn
            title="Revisão"
            id="revisao"
            products={products.revisao}
            seamstresses={seamstresses}
            onAssign={assignSeamstress}
          />
        </div>
      </DragDropContext>
    </div>
  )
}

