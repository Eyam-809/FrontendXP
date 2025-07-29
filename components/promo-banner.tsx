"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function PromoBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="my-10 overflow-hidden rounded-xl"
    >
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <motion.h2
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              ¡Oferta Especial Esta Semana!
            </motion.h2>
            <motion.p
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl mb-6 max-w-xl"
            >
              Obtén envío gratis en todos los pedidos superiores a $50. Oferta por tiempo limitado, ¡no te la pierdas!
            </motion.p>
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium text-lg px-6 py-2 rounded-full">
                Comprar Ahora
              </Button>
            </motion.div>
          </div>
          <motion.div
            className="md:w-1/3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-white/30 rounded-full blur-xl"></div>
              <img src="/placeholder.svg?height=200&width=200" alt="Special Offer" className="relative w-full h-auto" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
