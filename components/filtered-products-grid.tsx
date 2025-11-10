"use client"

import { useEffect, useState } from "react"
import ProductGrid from "@/components/product-grid"
import { ApiUrl } from "@/lib/config"

interface Product {
  id: number
  name: string
  price: string
  image: string
  description: string
  subcategoria_id: number
}

interface Props {
  subcategoryId: number
}

export default function FilteredProductsGrid({ subcategoryId }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!subcategoryId) return
    setLoading(true)

    fetch(`${ApiUrl}/api/products/subcategory/${subcategoryId}`)
      .then(res => {
        if (!res.ok) throw new Error("Error en la petición")
        return res.json()
      })
      .then((data: Product[]) => {
        setProducts(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error("Error cargando productos:", err)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [subcategoryId])

  if (loading) return <div className="py-12 text-center">Cargando productos...</div>
  if (products.length === 0) return <div className="py-12 text-center text-gray-500">No hay productos en esta subcategoría.</div>

  return <ProductGrid products={products} />
}
