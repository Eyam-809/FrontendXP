"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  Send, 
  Clock, 
  User,
  Package,
  Eye,
  Heart
} from "lucide-react"
import Link from "next/link"

interface Message {
  id: number
  sender: 'user' | 'other'
  content: string
  timestamp: string
  isRead: boolean
}

interface Conversation {
  id: number
  user: {
    id: number
    name: string
    avatar: string
    isOnline: boolean
  }
  product: {
    id: number
    name: string
    image: string
    price: number
  }
  messages: Message[]
  unreadCount: number
  lastMessage: string
  lastMessageTime: string
}

interface ChatConversationsProps {
  conversations: Conversation[]
}

export default function ChatConversations({ conversations }: ChatConversationsProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    conversations.length > 0 ? conversations[0] : null
  )
  const [newMessage, setNewMessage] = useState("")

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isRead: false
    }

    // Aquí deberías actualizar el estado real de la conversación
    console.log('Enviando mensaje:', message)
    setNewMessage("")
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInHours < 48) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes conversaciones</h3>
          <p className="text-gray-500 mb-4">Cuando alguien te contacte sobre tus productos, aparecerán aquí</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Lista de conversaciones */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Conversaciones</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-[#E8DDD4] border-r-2 border-[#E63946]' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.user.avatar} />
                        <AvatarFallback>
                          {conversation.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#1B3C53] rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm truncate">
                          {conversation.user.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.lastMessage}
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <img 
                          src={conversation.product.image} 
                          alt={conversation.product.name}
                          className="w-6 h-6 object-cover rounded"
                        />
                        <span className="text-xs text-gray-600 truncate">
                          {conversation.product.name}
                        </span>
                      </div>
                    </div>
                    
                    {conversation.unreadCount > 0 && (
                      <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header del chat */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.user.avatar} />
                        <AvatarFallback>
                          {selectedConversation.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#1B3C53] rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.user.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.user.isOnline ? 'En línea' : 'Desconectado'}
                      </p>
                    </div>
                  </div>
                  
                  <Link href={`/product/${selectedConversation.product.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver producto
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              {/* Producto de referencia */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                  <img 
                    src={selectedConversation.product.image} 
                    alt={selectedConversation.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{selectedConversation.product.name}</h4>
                    <p className="text-sm font-bold text-red-600">
                      ${selectedConversation.product.price.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Package className="h-3 w-3 mr-1" />
                    Producto
                  </Badge>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 ${
                        message.sender === 'user' ? 'text-red-100' : 'text-gray-500'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{message.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input para enviar mensaje */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona una conversación</h3>
                <p className="text-gray-500">Elige una conversación para comenzar a chatear</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
} 