"use client"

import { Mail, Phone, Search, Bell, PhoneIcon as WhatsappIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { seamstresses } from "@/types/seamstress"

export default function SeamstressesPage() {
  return (
    <div className="flex h-screen bg-[#F8F7FD]">
      {/* Left Sidebar */}
      <div className="w-16 bg-white border-r flex flex-col items-center py-6">
        <div className="mb-8">
          <h1 className="font-bold text-xl text-indigo-600">S</h1>
        </div>
        <nav className="flex flex-col gap-6">
          <Button variant="ghost" size="icon" className="rounded-lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
              <circle cx="9" cy="7" r="4" strokeWidth="2" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeWidth="2" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeWidth="2" />
            </svg>
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white px-6 py-4 flex items-center justify-between border-b">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input type="search" placeholder="Pesquisar..." className="w-full pl-10 bg-[#F8F7FD] border-none" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <WhatsappIcon className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Seamstresses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seamstresses.map((seamstress) => (
                <div
                  key={seamstress.id}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                      <img
                        src={seamstress.avatar || "/placeholder.svg"}
                        alt={seamstress.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{seamstress.name}</h3>
                    <p className="text-gray-500 mb-4">{seamstress.location}</p>
                    <div className="space-y-3 w-full text-left">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">Tel: {seamstress.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">Email: {seamstress.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
