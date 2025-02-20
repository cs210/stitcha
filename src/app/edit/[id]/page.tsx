"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { seamstresses } from "@/types/seamstress"
import Image from "next/image"
import { useState, ChangeEvent, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Clock, User, Upload, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { initialProducts } from "@/components/kanban-board"

interface Product {
  id: string
  title: string
  image: string
  type: string
  date: string
  assignees: Array<{
    id: string
    name: string
    avatar: string
  }>
  progress: string
  description?: string
  quantity?: string
  technicalSheets?: string[]
}

interface EditFormData extends Omit<Product, 'id' | 'assignees' | 'progress'> {
  seamstress: string
}

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default function EditPage({ params }: EditPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const techSheetsInputRef = useRef<HTMLInputElement>(null)
  
  // Find the product in all columns
  const findProduct = () => {
    const columns = ['paraFazer', 'emAndamento', 'revisao']
    let foundProduct: Product | null = null
    
    columns.forEach(column => {
      const products = JSON.parse(localStorage.getItem('kanbanProducts') || '{}')
      const columnProducts = products[column] || initialProducts[column]
      const product = columnProducts.find((p: Product) => p.id === id)
      if (product) foundProduct = product
    })
    
    return foundProduct
  }

  const [formData, setFormData] = useState<EditFormData>(() => {
    const product = findProduct()
    if (!product) {
      router.push('/kanban')
      return {
        title: "",
        seamstress: "",
        description: "",
        quantity: "",
        type: "",
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        image: "",
        technicalSheets: []
      }
    }

    return {
      title: product.title,
      seamstress: product.assignees[0]?.id || "",
      description: product.description || "",
      quantity: product.quantity || "",
      type: product.type,
      date: product.date,
      image: product.image,
      technicalSheets: product.technicalSheets || []
    }
  })

  const [imagePreview, setImagePreview] = useState(formData.image)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const selectedSeamstress = seamstresses.find(s => s.id.toString() === formData.seamstress)

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, isProductImage: boolean) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 300000) { // 300KB limit
        alert("File size should be less than 300KB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        if (isProductImage) {
          setImagePreview(base64String)
          setFormData(prev => ({ ...prev, image: base64String }))
        } else {
          const fileName = file.name
          setSelectedFiles(prev => [...prev, fileName])
          setFormData(prev => ({
            ...prev,
            technicalSheets: [...prev.technicalSheets, base64String]
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      const columns = ['paraFazer', 'emAndamento', 'revisao']
      const products = JSON.parse(localStorage.getItem('kanbanProducts') || '{}')
      
      columns.forEach(column => {
        const columnProducts = products[column] || initialProducts[column]
        const productIndex = columnProducts.findIndex((p: Product) => p.id === id)
        
        if (productIndex !== -1) {
          const selectedSeamstress = seamstresses.find(s => s.id === formData.seamstress)
          columnProducts[productIndex] = {
            ...columnProducts[productIndex],
            ...formData,
            assignees: selectedSeamstress ? [selectedSeamstress] : columnProducts[productIndex].assignees
          }
        }
      })

      localStorage.setItem('kanbanProducts', JSON.stringify(products))
      router.push('/kanban')
      window.dispatchEvent(new Event('storage'))
    } catch (error) {
      console.error('Error saving changes:', error)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Product Preview */}
        <div>
          <Card className="p-4 pt-10 relative">
            <Badge variant="secondary" className="absolute top-2 left-2 bg-orange-100 text-orange-600">
              {formData.type}
            </Badge>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
              <Image 
                src={imagePreview}
                alt="Product Preview" 
                fill 
                className="object-cover" 
              />
            </div>
            <h3 className="font-medium">{formData.title}</h3>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formData.date}
              </div>
              {selectedSeamstress && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{selectedSeamstress.name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
              <div>{formData.quantity ? `${formData.quantity} units` : 'No quantity set'}</div>
              {selectedSeamstress && (
                <div className="flex -space-x-2">
                  <Image 
                    src={selectedSeamstress.avatar} 
                    alt={selectedSeamstress.name}
                    width={24}
                    height={24}
                    className="rounded-full border-2 border-white"
                  />
                </div>
              )}
            </div>
            <p className="text-gray-500 mt-2 text-sm">{formData.description || 'No description provided'}</p>
          </Card>
        </div>

        {/* Right Column - Edit Form */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Product Name</Label>
            <Input 
              id="title" 
              value={formData.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="seamstress">Assigned Seamstress</Label>
            <Select 
              value={formData.seamstress}
              onValueChange={(value) => setFormData(prev => ({ ...prev, seamstress: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a seamstress" />
              </SelectTrigger>
              <SelectContent>
                {seamstresses.map((seamstress) => (
                  <SelectItem key={seamstress.id} value={seamstress.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Image 
                        src={seamstress.avatar} 
                        alt={seamstress.name} 
                        width={24} 
                        height={24} 
                        className="rounded-full"
                      />
                      {seamstress.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Include any description for the bag..."
              className="h-32"
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => 
                setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input 
              id="quantity" 
              type="number" 
              placeholder="How many units should be produced?"
              value={formData.quantity}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                setFormData(prev => ({ ...prev, quantity: e.target.value }))}
            />
          </div>

          <div>
            <Label>Upload Technical Sheets</Label>
            <div className="mt-2">
              <input
                type="file"
                ref={techSheetsInputRef}
                onChange={(e) => handleFileUpload(e, false)}
                accept="image/*,.pdf"
                multiple
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => techSheetsInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Choose Files
              </Button>
              <div className="ml-2 text-gray-500">
                {selectedFiles.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {selectedFiles.map((fileName, index) => (
                      <li key={index}>{fileName}</li>
                    ))}
                  </ul>
                ) : (
                  'No File Chosen'
                )}
              </div>
            </div>
          </div>

          <div>
            <Label>Upload Image</Label>
            <div className="mt-2">
              <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => handleFileUpload(e, true)}
                accept="image/*"
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </Button>
              <span className="ml-2 text-gray-500">
                {imagePreview !== "/images/tote.png" ? 'Image selected' : 'No File Chosen'}
              </span>
              <p className="text-sm text-gray-500 mt-1 ml-2">Please upload an image less than 300KB.</p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

