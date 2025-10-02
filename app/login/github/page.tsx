"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/app-context";

export default function GitHubCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dispatch } = useApp();

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const planId = searchParams.get("plan_id"); // si lo mandas desde backend
    const name = searchParams.get("name");
    const email = searchParams.get("email"); // asegúrate que el backend lo incluya
    const phone = searchParams.get("telefono") || "";
    const address = searchParams.get("direccion") || "";

    if (token && id) {
      const userData = {
        id,
        name: name || "",
        email: email || "",
        phone,
        address,
        plan_id: planId || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified_at: new Date().toISOString(),
        rating: 4.8,
        totalProducts: 12,
        totalSales: 45,
        joinDate: new Date().toISOString(),
      };

      // Guarda datos en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("user_id", id);
      localStorage.setItem("plan_id", planId || "");
      localStorage.setItem("name", name || "");

      // Actualiza el contexto global
      dispatch({
        type: "SET_USER_SESSION",
        payload: {
          token,
          user_id: id,
          plan_id: planId,
          name,
        },
      });

      router.push("/"); // redirige a tu página principal o dashboard
    }
  }, [router, searchParams, dispatch]);

  return <p>Iniciando sesión con GitHub…</p>;
}
