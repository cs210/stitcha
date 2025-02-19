import { Bell, Search, PhoneIcon as WhatsappLogo } from "lucide-react"
import { Input } from "./ui/input"

export function SearchHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input type="search" placeholder="Pesquisar..." className="w-full pl-8 bg-gray-50" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <WhatsappLogo className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
