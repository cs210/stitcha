"use client"

import { DragDropContext } from "@hello-pangea/dnd"
import { useState, useEffect } from "react"
import { KanbanColumn } from "./kanban-column"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"
import type { DropResult } from "@hello-pangea/dnd"
import type { Product, Seamstress } from "@/types/kanban"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const seamstresses: Seamstress[] = [
  {
    id: "1",
    name: "Alice",
    avatar:
      "/images/seamstress-1.jpeg",
  },
  {
    id: "2",
    name: "Josephine",
    avatar:
      "/images/seamstress-2.jpeg",
  },
  {
    id: "3",
    name: "Carol",
    avatar:
      "/images/seamstress-3.jpeg",
  },
  {
    id: "4",
    name: "Beatriz",
    avatar:
      "/images/profile.png",
  },
  {
    id: "5",
    name: "Eve",
    avatar:
      "/images/profile.png",
  },
]

export const initialProducts: Record<string, Product[]> = {
  paraFazer: [
    {
      id: "product_1",
      title: "Prototypes for a Bag", 
      image: "/images/tote.png",
      type: "Prototype",
      date: "Aug 20, 2021",
      assignees: [seamstresses[2]],
      progress: "0/8",
    },
    {
      id: "product_2",
      title: "Brown Fluffy Blanket",
      image:
        "/images/blanket.png",
      type: "Prototype",
      date: "Aug 16, 2021",
      assignees: [seamstresses[3], seamstresses[4]],
      progress: "0/8",
    },
  ],
  emAndamento: [
    {
      id: "product_3",
      title: "Black Plain T-Shirt",
      image:
        "/images/shirt.png",
      type: "Prototype",
      date: "Aug 20, 2021",
      assignees: [seamstresses[0], seamstresses[2]],
      progress: "0/8",
    },
  ],
  revisao: [
    {
      id: "product_4",
      title: "Red Long-Sleeve Shirt",
      image:
        "/images/sweater.png",
      type: "Prototype",
      date: "Aug 16, 2021",
      assignees: [seamstresses[1], seamstresses[4]],
      progress: "0/8",
    },
  ],
}

const createNewProduct = (): Product => ({
  id: `product_${Date.now()}`,
  title: "Untitled",
  image: "/images/tote.png",
  type: "Prototype",
  date: new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }),
  assignees: [],
  progress: "0/8",
  description: "",
  quantity: "0"
})

export function KanbanBoard() {
  const router = useRouter()
  const [products, setProducts] = useState<Record<string, Product[]>>({
    paraFazer: [],
    emAndamento: [],
    revisao: []
  })

  // Fetch products from Supabase on mount
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
      
      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      // Organize products by status
      const organized = data.reduce((acc, product) => {
        const status = product.status || 'paraFazer'
        return {
          ...acc,
          [status]: [...(acc[status] || []), {
            id: product.id,
            title: product.name || "Untitled",
            // Handle both Supabase Storage URLs and local images
            image: product.image_url,
              // ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${product.image_url}`
              // : "/images/tote.png",
            type: product.type || "Prototype",
            date: new Date(product.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            assignees: product.assignees || [],
            progress: product.progress || "0/8",
            description: product.description || "",
            quantity: product.quantity?.toString() || "0"
          }]
        }
      }, {
        paraFazer: [],
        emAndamento: [],
        revisao: []
      })

      setProducts(organized)
    }

    fetchProducts()

    // Subscribe to changes
    const channel = supabase
      .channel('products_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, () => {
        fetchProducts()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return

    const newProducts = { ...products }
    const sourceColumn = [...newProducts[source.droppableId]]
    const destColumn = [...newProducts[destination.droppableId]]
    const [removed] = sourceColumn.splice(source.index, 1)
    destColumn.splice(destination.index, 0, removed)

    const updated = {
      ...newProducts,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    }

    // Update local state
    setProducts(updated)

    // Update Supabase
    try {
      await supabase
        .from('products')
        .update({ status: destination.droppableId })
        .eq('id', draggableId)
    } catch (error) {
      console.error('Error updating product status:', error)
      // Optionally revert the state if the update fails
      setProducts(newProducts)
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      setProducts((prevProducts) => {
        const updatedProducts = { ...prevProducts }
        for (const columnId in updatedProducts) {
          updatedProducts[columnId] = updatedProducts[columnId].filter(
            (product) => product.id !== productId
          )
        }
        return updatedProducts
      })
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const addNewProduct = async () => {
    const defaultImage = "default-product.png" // Store a default image in your Supabase storage
    
    const newProduct = {
      name: "Untitled",
      image_url: defaultImage,
      type: "Prototype",
      status: "paraFazer",
      created_at: new Date().toISOString(),
      assignees: [],
      progress: "0/8",
      description: "",
      quantity: 0
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert(newProduct)
        .select()
        .single()

      if (error) throw error

      router.push(`/edit/${data.id}`)
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const assignSeamstress = async (productId: string, seamstress: Seamstress) => {
    try {
      // Find the product to update its assignees
      let productToUpdate = null
      for (const column of Object.values(products)) {
        const found = column.find(p => p.id === productId)
        if (found) {
          productToUpdate = found
          break
        }
      }

      if (!productToUpdate) return

      // Create new assignees array without duplicates
      const newAssignees = productToUpdate.assignees.some(a => a.id === seamstress.id)
        ? productToUpdate.assignees
        : [...productToUpdate.assignees, seamstress]

      // Update Supabase
      const { error } = await supabase
        .from('products')
        .update({ assignees: newAssignees })
        .eq('id', productId)

      if (error) throw error

      // Update local state
      setProducts(prevProducts => {
        const updatedProducts = { ...prevProducts }
        for (const columnId in updatedProducts) {
          updatedProducts[columnId] = updatedProducts[columnId].map(product => 
            product.id === productId
              ? { ...product, assignees: newAssignees }
              : product
          )
        }
        return updatedProducts
      })
    } catch (error) {
      console.error('Error assigning seamstress:', error)
    }
  }

  return (
    <div className="h-[calc(100vh-2rem)] p-6 flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button 
          size="default"
          variant="ghost"
          className="rounded-full hover:bg-primary hover:text-white px-6"
          onClick={addNewProduct}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-0 flex-1">
          <KanbanColumn
            title="Para Fazer"
            id="paraFazer"
            products={products.paraFazer}
            seamstresses={seamstresses}
            onAssign={assignSeamstress}
            onDelete={deleteProduct}
          />
          <KanbanColumn
            title="Em Andamento"
            id="emAndamento"
            products={products.emAndamento}
            seamstresses={seamstresses}
            onAssign={assignSeamstress}
            onDelete={deleteProduct}
          />
          <KanbanColumn
            title="Revisão"
            id="revisao"
            products={products.revisao}
            seamstresses={seamstresses}
            onAssign={assignSeamstress}
            onDelete={deleteProduct}
          />
        </div>
      </DragDropContext>
    </div>
  )
}

