"use client"

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  rating: number
  image: string
  discount: number
  isNew: boolean
  category: string
  subcategory: string
  description: string
  inStock: boolean
}

export interface CartItem extends Product {
  quantity: number
}

interface UserSession {
  token: string
  user_id: string
  plan_id: string
  name: string
}

interface AppState {
  cart: CartItem[]
  favorites: Product[]
  products: Product[]
  searchQuery: string
  selectedCategory: string | null
  selectedSubcategory: string | null
  isCartOpen: boolean
  isFavoritesOpen: boolean
  isCategoryPanelOpen: boolean
  selectedProduct: Product | null
  userSession: UserSession | null // <-- nuevo estado para sesión
}

type AppAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: number }
  | { type: "UPDATE_CART_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "ADD_TO_FAVORITES"; payload: Product }
  | { type: "REMOVE_FROM_FAVORITES"; payload: number }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SELECTED_CATEGORY"; payload: string | null }
  | { type: "SET_SELECTED_SUBCATEGORY"; payload: string | null }
  | { type: "TOGGLE_CART" }
  | { type: "TOGGLE_FAVORITES" }
  | { type: "TOGGLE_CATEGORY_PANEL" }
  | { type: "SET_SELECTED_PRODUCT"; payload: Product | null }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_USER_SESSION"; payload: UserSession }      // <-- nueva acción
  | { type: "CLEAR_USER_SESSION" }                          // <-- nueva acción

const initialState: AppState = {
  cart: [],
  favorites: [],
  products: [],
  searchQuery: "",
  selectedCategory: null,
  selectedSubcategory: null,
  isCartOpen: false,
  isFavoritesOpen: false,
  isCategoryPanelOpen: false,
  selectedProduct: null,
  userSession: null,
}

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.cart.find((item) => item.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      }

    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart
          .map((item) => (item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item))
          .filter((item) => item.quantity > 0),
      }

    case "CLEAR_CART":
      return { ...state, cart: [] }

    case "ADD_TO_FAVORITES":
      if (state.favorites.find((item) => item.id === action.payload.id)) {
        return state
      }
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      }

    case "REMOVE_FROM_FAVORITES":
      return {
        ...state,
        favorites: state.favorites.filter((item) => item.id !== action.payload),
      }

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload }

    case "SET_SELECTED_CATEGORY":
      return { ...state, selectedCategory: action.payload, selectedSubcategory: null }

    case "SET_SELECTED_SUBCATEGORY":
      return { ...state, selectedSubcategory: action.payload }

    case "TOGGLE_CART":
      return { ...state, isCartOpen: !state.isCartOpen }

    case "TOGGLE_FAVORITES":
      return { ...state, isFavoritesOpen: !state.isFavoritesOpen }

    case "TOGGLE_CATEGORY_PANEL":
      return { ...state, isCategoryPanelOpen: !state.isCategoryPanelOpen }

    case "SET_SELECTED_PRODUCT":
      return { ...state, selectedProduct: action.payload }

    case "SET_PRODUCTS":
      return { ...state, products: action.payload }

    case "SET_USER_SESSION":
      return { ...state, userSession: action.payload }

    case "CLEAR_USER_SESSION":
      return { ...state, userSession: null }

    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Función para cargar sesión desde localStorage
  const loadUserSession = () => {
    try {
      const token = localStorage.getItem("token")
      const user_id = localStorage.getItem("user_id")
      const plan_id = localStorage.getItem("plan_id")
      const name = localStorage.getItem("name")
      
      console.log("Cargando sesión del usuario:", user_id);

      if (token && user_id && plan_id) {
        dispatch({
          type: "SET_USER_SESSION",
          payload: { token, user_id, plan_id, name: name || "" },
        })
      } else {
        dispatch({ type: "CLEAR_USER_SESSION" })
      }
    } catch (error) {
      console.error("Error al cargar sesión:", error)
      dispatch({ type: "CLEAR_USER_SESSION" })
    }
  }

  // Al montar, carga sesión si existe en localStorage
  useEffect(() => {
    loadUserSession()
  }, [])

  // Escuchar cambios en localStorage para actualizar automáticamente
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user_id" || e.key === "plan_id" || e.key === "name") {
        console.log("Detectado cambio en localStorage, actualizando sesión...")
        loadUserSession()
      }
    }

    // Escuchar cambios de localStorage desde otras pestañas
    window.addEventListener('storage', handleStorageChange)

    // También escuchar cambios en la misma pestaña usando un intervalo
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token")
      const currentUserId = localStorage.getItem("user_id")
      const currentPlanId = localStorage.getItem("plan_id")
      const currentName = localStorage.getItem("name")
      
      // Si hay cambios en localStorage, actualizar el estado
      if (state.userSession) {
        if (state.userSession.token !== currentToken || 
            state.userSession.user_id !== currentUserId || 
            state.userSession.plan_id !== currentPlanId ||
            state.userSession.name !== currentName) {
          console.log("Detectado cambio en localStorage (misma pestaña), actualizando sesión...")
          loadUserSession()
        }
      } else if (currentToken && currentUserId && currentPlanId) {
        // Si no hay sesión pero hay datos en localStorage, cargar sesión
        console.log("Detectados datos de sesión en localStorage, cargando...")
        loadUserSession()
      }
    }, 1000) // Verificar cada segundo

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [state.userSession])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
