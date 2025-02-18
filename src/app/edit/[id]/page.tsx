"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Label } from "./ui/label"
// Update the import to use the shared seamstresses data
import { seamstresses } from "@/types/seamstress"

function EditPage() {
  const [formData, setFormData] = useState({ seamstress: "" })

  return (
    <div>
      {/* rest of the code */}
      <div className="space-y-2">
        <Label htmlFor="seamstress">Assigned Seamstress</Label>
        <Select value={formData.seamstress} onValueChange={(value) => setFormData({ ...formData, seamstress: value })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a seamstress" />
          </SelectTrigger>
          <SelectContent>
            {seamstresses.map((seamstress) => (
              <SelectItem key={seamstress.id} value={seamstress.id.toString()}>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback>{seamstress.initials}</AvatarFallback>
                  </Avatar>
                  <span>{seamstress.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* rest of the code */}
    </div>
  )
}

export default EditPage
