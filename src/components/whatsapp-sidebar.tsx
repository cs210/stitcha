"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Mic, Paperclip, Send, Smile, ChevronRight, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { sendWhatsAppMessage, getWhatsAppMessages } from "@/lib/whatsapp-api"
import type { Seamstress } from "@/types/seamstress"

interface WhatsAppSidebarProps {
  seamstresses: Seamstress[]
  setSelectedSeamstress: (seamstress: Seamstress) => void
}

const avatarColors = [
  "#FF6347",
  "#3CB371",
  "#90EE90",
  "#FFA500",
  "#FFD700",
  "#800080",
  "#4B0082",
  "#0000FF",
  "#1E90FF",
  "#00FFFF",
  "#008080",
  "#00CED1",
  "#708090",
  "#A0522D",
  "#D2691E",
  "#FF8C00",
  "#FF4500",
  "#DC143C",
  "#8B0000",
  "#FF0000",
]

export function WhatsAppSidebar({ seamstresses, setSelectedSeamstress }: WhatsAppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [messages, setMessages] = useState([
    { id: "1", sender: "Beatriz", content: "Olá! 👋", time: "04:00 pm" },
    { id: "2", sender: "You", content: "Que tipo de tecido devo usar no vestido?", time: "08:03 am" },
    { id: "3", sender: "Beatriz", content: "Hm... algodão...", time: "08:05 am", isVoice: true, duration: "1:25" },
  ])
  const [selectedSeamstress, setSelectedSeamstressLocal] = useState(seamstresses[0])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const newMessages = await getWhatsAppMessages()
        // Transform and update messages
        // setMessages(transformedMessages)
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return

    try {
      await sendWhatsAppMessage(selectedSeamstress.phone, messageInput)
      const newMessage = {
        id: Date.now().toString(),
        sender: "You",
        content: messageInput,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages([...messages, newMessage])
      setMessageInput("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col bg-white transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-80",
        "border-l border-[#25D366]",
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-[#25D366] text-white p-2 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors"
      >
        {isCollapsed ? <MessageCircle className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {!isCollapsed && (
        <>
          <div className="p-4 border-b bg-[#075E54] text-gray-300">
            <h2 className="font-semibold mb-2">
              <a href="/seamstresses" className="hover:text-white transition-colors">
                Costureiras (41)
              </a>
            </h2>
            <div className="flex -space-x-2 overflow-hidden">
              {seamstresses.map((seamstress, index) => (
                <a key={seamstress.id} href="/seamstresses">
                  <Avatar
                    className="border-2 border-[#075E54] cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: avatarColors[index % avatarColors.length] }}
                    onClick={() => {
                      setSelectedSeamstressLocal(seamstress)
                      setSelectedSeamstress(seamstress)
                    }}
                  >
                    <AvatarFallback className="text-black font-semibold">{seamstress.initials}</AvatarFallback>
                  </Avatar>
                </a>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#ECE5DD]">
            <h3 className="font-semibold text-gray-700">Chat with {selectedSeamstress.name}</h3>
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-2 ${message.sender === "You" ? "flex-row-reverse" : ""}`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-black font-semibold">
                    {message.sender === "You" ? "YO" : message.sender.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`rounded-lg p-3 max-w-[80%] ${message.sender === "You" ? "bg-[#DCF8C6]" : "bg-white"}`}>
                  {message.isVoice ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 bg-[#DCF8C6] rounded-full p-2">
                        <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-32 h-2 bg-gray-300 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-[#128C7E] rounded-full" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{message.duration}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-2 italic">"{message.content.slice(0, 30)}..."</p>
                    </div>
                  ) : (
                    <p className="text-gray-700">{message.content}</p>
                  )}
                  <div className="text-xs mt-1 text-gray-500">{message.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-[#F0F2F5]">
            <div className="flex gap-2">
              <Button size="icon" variant="ghost">
                <Paperclip className="w-5 h-5 text-[#128C7E]" />
              </Button>
              <Input
                placeholder="Escreva aqui..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button size="icon" variant="ghost">
                <Smile className="w-5 h-5 text-[#128C7E]" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleSendMessage}>
                {messageInput ? (
                  <Send className="w-5 h-5 text-[#128C7E]" />
                ) : (
                  <Mic className="w-5 h-5 text-[#128C7E]" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
