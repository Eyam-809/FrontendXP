"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function GoogleCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const id = searchParams.get("id")
    const planId = searchParams.get("plan_id")
    const name = searchParams.get("name")

    if (token) {
      localStorage.setItem("token", token)
      localStorage.setItem("user_id", id || "")
      localStorage.setItem("plan_id", planId || "")
      localStorage.setItem("name", name || "")

      
      // 🔥 Redirige al dashboard
      router.push("/")
    }
  }, [router, searchParams])

  return <p>Iniciando sesión con Google…</p>
}
