// MODIFY + ADD ENV VARIABLES

type WhatsAppMessage = {
    id: string
    from: string
    to: string
    type: "text" | "voice" | "image"
    timestamp: number
    content: string
    status: "sent" | "delivered" | "read"
  }
  
  export async function sendWhatsAppMessage(to: string, message: string) {
    try {
      const response = await fetch("https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: { body: message },
        }),
      })
  
      return response.json()
    } catch (error) {
      console.error("Error sending WhatsApp message:", error)
      throw error
    }
  }
  
  export async function getWhatsAppMessages() {
    try {
      const response = await fetch("https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages", {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
      })
  
      return response.json()
    } catch (error) {
      console.error("Error fetching WhatsApp messages:", error)
      throw error
    }
  }
  
  