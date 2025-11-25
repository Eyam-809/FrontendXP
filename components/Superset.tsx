"use client";

import React, { useEffect, useRef } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

interface Props {
  dashboardId: string; // UUID completo del dashboard
}

export default function Superset({ dashboardId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!containerRef.current) return;

      try {
        await embedDashboard({
          id: dashboardId,
          supersetDomain: "http://localhost:8088",

          fetchGuestToken: async () => {
            const response = await fetch(
              "http://localhost:8000/api/superset/token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  dashboard_id: dashboardId,
                }),
              }
            );

            const { token } = await response.json();
            return token;
          },

          mountPoint: containerRef.current,
          dashboardUiConfig: {
            hideTitle: false,
            hideChartControls: true,
          },
        });
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
      }
    };

    loadDashboard();
  }, [dashboardId]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "1500px", borderRadius: "10px" }}
    />
  );
}
