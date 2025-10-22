"use client"

import React, { useEffect, useRef, useState } from "react"
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
  Heart,
  Trash2,
  MoreVertical,
  Check
} from "lucide-react"
import Link from "next/link"

interface MessageItem {
  id: number | string
  sender: "me" | "other"
  content: string
  timestamp: string
  raw?: any
}

interface Conv {
  id: number | string
  user?: any
  product?: any
  messages?: MessageItem[]
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
}

interface Props {
  conversations: Conv[]
  onSendMessage?: (conversationId: number | string, text: string) => Promise<boolean> | boolean
  onSelectConversation?: (conv: Conv) => void
  onDeleteConversation?: (conversationId: number | string) => void
}

export default function ChatConversations({ conversations = [], onSendMessage, onSelectConversation, onDeleteConversation }: Props) {
  const [activeConvId, setActiveConvId] = useState<number | string | null>(conversations?.[0]?.id ?? null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const pollingRef = useRef<number | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // local copy to allow deletions/updates without mutating props
  const [localConversations, setLocalConversations] = useState<Conv[]>(conversations)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Sincronizar cuando cambian las props
  useEffect(() => {
    setLocalConversations(conversations)
    if (!activeConvId && conversations?.length) setActiveConvId(conversations[0].id)
  }, [conversations])

  // Obtener token/usuario
  const getToken = () => window.localStorage.getItem("token")
  const getUserId = () => {
    try {
      const ud = JSON.parse(window.localStorage.getItem("userData") || "{}")
      return ud?.id ?? null
    } catch {
      return null
    }
  }

  // Scroll al final cuando cambian mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  // Fetch mensajes de la conversación activa
  const fetchMessages = async (convId: number | string | null) => {
    if (!convId) return
    try {
      const token = getToken()
      const res = await fetch(`https://backendxp-1.onrender.com/api/conversations/${convId}/messages`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) {
        console.warn("No se pudieron obtener mensajes:", res.status)
        return
      }
      const data = await res.json()
      const userId = Number(getUserId())
      const mapped: MessageItem[] = (data || []).map((m: any, idx: number) => {
        const senderId = Number(m.sender_id ?? m.sender ?? 0)
        return {
          id: m.id ?? idx,
          sender: senderId === userId ? "me" : "other",
          content: m.message ?? m.content ?? "",
          timestamp: new Date(m.created_at ?? m.createdAt ?? Date.now()).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          raw: m
        }
      })
      setMessages(mapped)

      // Marcar como leídos los mensajes del otro usuario después de obtenerlos
      // (si hay alguno no leído)
      markConversationRead(convId)
    } catch (err) {
      console.error("Error fetchMessages:", err)
    }
  }

  // marcar mensajes como leídos en backend
  const markConversationRead = async (convId: number | string | null) => {
    if (!convId) return
    try {
      const token = getToken()
      const res = await fetch(`https://backendxp-1.onrender.com/api/conversations/${convId}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) {
        // No crítico si falla; solo log para debug
        console.warn("No se pudo marcar como leído:", res.status)
        return
      }
      const body = await res.json()
      // actualizar mensajes con read_at proveniente del backend (si viene)
      if (body.messages) {
        const userId = Number(getUserId())
        const mapped: MessageItem[] = (body.messages || []).map((m: any, idx: number) => ({
          id: m.id ?? idx,
          sender: Number(m.sender_id) === userId ? "me" : "other",
          content: m.message ?? m.content ?? "",
          timestamp: new Date(m.created_at ?? m.createdAt ?? Date.now()).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          raw: m
        }))
        setMessages(mapped)
      }
    } catch (err) {
      console.error("Error markConversationRead:", err)
    }
  }

  // Seleccionar conversación desde la lista
  const handleSelect = (conv: Conv) => {
    setActiveConvId(conv.id)
    onSelectConversation?.(conv)
    // marcar inmediatamente como leída en backend/local
    markConversationRead(conv.id)
  }

  // Eliminar conversación (usa API si existe, sino filtra localmente)
  const deleteConversation = async () => {
    if (!activeConvId) return
    const confirm = window.confirm("¿Eliminar conversación? Esta acción no se puede deshacer.")
    if (!confirm) {
      setShowDeleteModal(false)
      return
    }

    try {
      const token = getToken()
      // intentar llamada DELETE al backend (asegúrate de tener la ruta)
      const res = await fetch(`https://backendxp-1.onrender.com/api/conversations/${activeConvId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (res.ok || res.status === 404) {
        // actualizar lista local
        setLocalConversations(prev => prev.filter(c => String(c.id) !== String(activeConvId)))
        onDeleteConversation?.(activeConvId)
        // si la activa fue eliminada, limpiar selección
        setActiveConvId(prev => {
          const remaining = localConversations.filter(c => String(c.id) !== String(activeConvId))
          return remaining.length ? remaining[0].id : null
        })
      } else {
        console.warn("No se pudo eliminar en backend:", res.status)
        // fallback: eliminar localmente
        setLocalConversations(prev => prev.filter(c => String(c.id) !== String(activeConvId)))
      }
    } catch (err) {
      console.error("Error deleteConversation:", err)
      // fallback local
      setLocalConversations(prev => prev.filter(c => String(c.id) !== String(activeConvId)))
    } finally {
      setShowDeleteModal(false)
      // actualizar localStorage compatibilidad
      try {
        const simple = localConversations.filter(c => String(c.id) !== String(activeConvId)).map(c => ({
          id: c.id,
          sellerId: c.user?.id,
          sellerName: c.user?.name,
          sellerAvatar: c.user?.avatar,
          productId: c.product?.id,
          productName: c.product?.name,
          productImage: c.product?.image,
          productPrice: c.product?.price,
          timestamp: c.lastMessageTime,
          lastMessage: c.lastMessage,
          unreadCount: c.unreadCount ?? 0
        }))
        localStorage.setItem('conversations', JSON.stringify(simple))
      } catch {}
    }
  }

  // El envío se utilizaba en el JSX pero no estaba definido — lo añadimos aquí.
  const handleSend = async () => {
    if (!activeConvId) {
      alert("Selecciona una conversación");
      return;
    }
    if (!text.trim()) return;

    const trimmed = text.trim();
    const tempId = `tmp-${Date.now()}`;
    const optimistic: MessageItem = {
      id: tempId,
      sender: "me",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    };

    // Optimistic update
    setMessages(prev => [...prev, optimistic]);
    setText("");
    setSending(true);

    try {
      // Intentar enviar usando el handler del padre si existe
      const ok = await (onSendMessage ? onSendMessage(activeConvId, trimmed) : Promise.resolve(false));

      if (!ok) {
        // Si el padre no envió, intentar enviar directamente desde aquí
        const token = getToken();
        const res = await fetch(`https://backendxp-1.onrender.com/api/conversations/${activeConvId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ message: trimmed })
        });

        if (!res.ok) {
          console.error("Fallo envío directo:", await res.text());
          alert("No se pudo enviar el mensaje (ver consola).");
          // opcional: remover mensaje optimista o marcar fallo
        } else {
          // refrescar para obtener mensajes reales (reemplaza tempId)
          await fetchMessages(activeConvId);
        }
      } else {
        // Si el padre confirmó envío, refrescar mensajes para obtener id real
        await fetchMessages(activeConvId);
      }
    } catch (err) {
      console.error("Error handleSend:", err);
      alert("Error al enviar mensaje (ver consola).");
    } finally {
      setSending(false);
    }
  }

  if (localConversations.length === 0) {
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
              {localConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    String(activeConvId) === String(conversation.id) ? 'bg-[#E8DDD4] border-r-2 border-[#E63946]' : ''
                  }`}
                  onClick={() => handleSelect(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.user?.avatar} />
                        <AvatarFallback>
                          {conversation.user?.name?.split(' ').map((n: string) => n[0]).join('') || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.user?.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#1B3C53] rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm truncate">
                          {conversation.user?.name}
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
                          src={conversation.product?.image} 
                          alt={conversation.product?.name}
                          className="w-6 h-6 object-cover rounded"
                        />
                        <span className="text-xs text-gray-600 truncate">
                          {conversation.product?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {conversation.unreadCount! > 0 && (
                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveConvId(conversation.id)
                          setShowDeleteModal(true)
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
          {activeConvId ? (
            <>
              {/* Header del chat */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={localConversations.find(c => String(c.id) === String(activeConvId))?.user?.avatar} />
                        <AvatarFallback>
                          {localConversations.find(c => String(c.id) === String(activeConvId))?.user?.name?.split(' ').map((n: string) => n[0]).join('') || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {localConversations.find(c => String(c.id) === String(activeConvId))?.user?.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#1B3C53] rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{localConversations.find(c => String(c.id) === String(activeConvId))?.user?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {localConversations.find(c => String(c.id) === String(activeConvId))?.user?.isOnline ? 'En línea' : 'Desconectado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/product/chat/${localConversations.find(c => String(c.id) === String(activeConvId))?.product?.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver producto
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Producto de referencia */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                  <img 
                    src={localConversations.find(c => String(c.id) === String(activeConvId))?.product?.image} 
                    alt={localConversations.find(c => String(c.id) === String(activeConvId))?.product?.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{localConversations.find(c => String(c.id) === String(activeConvId))?.product?.name}</h4>
                    <p className="text-sm font-bold text-red-600">
                      ${localConversations.find(c => String(c.id) === String(activeConvId))?.product?.price?.toLocaleString?.() ?? 0}
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
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'me'
                          ? 'bg-[#1B3C53] text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 ${
                        message.sender === 'me' ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{message.timestamp}</span>

                        {/* indicador de leído: si message.raw.read_at existe mostrar doble check */}
                        {message.sender === 'me' && message.raw && (message.raw.read_at || message.raw.readAt) ? (
                          <span className="ml-1 inline-flex items-center -space-x-1">
                            <Check className="h-3 w-3 text-white/80" />
                            <Check className="h-3 w-3 text-white/80" />
                          </span>
                        ) : message.sender === 'me' ? (
                          <Check className="h-3 w-3 ml-1 text-white/50" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input para enviar mensaje */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button onClick={handleSend} disabled={!text.trim() || sending}>
                    {sending ? "Enviando..." : "Enviar"}
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

      {/* Modal de confirmación para eliminar conversación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar conversación</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar esta conversación con <strong>{localConversations.find(c => String(c.id) === String(activeConvId))?.user?.name}</strong>?
            </p>
            
            <div className="flex space-x-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
                className="border-gray-300"
              >
                Cancelar
              </Button>
              <Button 
                onClick={deleteConversation}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// helper para formatear tiempo (evita error formatTime is not defined)
function formatTime(ts?: string | null) {
  if (!ts) return ""
  try {
    // si viene un ISO/fecha válida
    const d = new Date(ts)
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    }
    // si ya es un string con formato HH:MM
    const m = String(ts).match(/(\d{1,2}:\d{2})/)
    return m ? m[1] : String(ts)
  } catch {
    return String(ts)
  }
}