"use client"
import { WifiOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

 

export default function NoInternetPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F3EF] text-[#1B3C53]">
      <WifiOff className="w-20 h-20 mb-6 text-red-600" />
      <h1 className="text-3xl font-bold mb-2">Sin conexión a Internet</h1>
      <p className="text-lg mb-6 text-[#456882]">Por favor verifica tu conexión y vuelve a intentarlo.</p>
      <button
        className="px-6 py-2 rounded-lg bg-[#1B3C53] text-white font-semibold hover:bg-[#456882] transition"
        onClick={() =>  router.push("/")}
      >
        Reintentar
      </button>
    </div>
  )
}
