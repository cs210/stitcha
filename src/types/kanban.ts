export interface Seamstress {
  id: string
  name: string
  avatar: string
}

export interface Product {
  id: string
  title: string
  image: string
  type: string
  date: string
  assignees: Seamstress[]
  progress: string
  description?: string
  quantity?: string
  technicalSheets?: string[]
} 