"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

const carouselItems = [
  {
    id: 1,
    title: "DOOM: The Dark Ages",
    description: "Lucha en la piel del slayer en una guerra medieval contra el infierno",
    bgColor: "from-purple-500 to-indigo-600",
    textColor: "text-white",
    buttonColor: "bg-yellow-400 hover:bg-yellow-500 text-black",
    image: "/dum.png",
  },
  {
    id: 2,
    title: "Mario Kart World",
    description: "¡Acelera a través de un mundo abierto con Mario y sus amigos!",
    bgColor: "from-red-500 to-pink-600",
    textColor: "text-white",
    buttonColor: "bg-green-400 hover:bg-green-500 text-black",
    image: "/mario.png",
  },
  {
    id: 3,
    title: "Pokemón Legends Z-A",
    description: "Descubre los secretos de la megaevolución y aprovecha su poder en los combates",
    bgColor: "from-yellow-500 to-orange-600",
    textColor: "text-white",
    buttonColor: "bg-blue-400 hover:bg-blue-500 text-white",
    image: "/poke.png",
  },
]

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextSlide = () => {
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselItems.length) % carouselItems.length)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
  }

  const item = carouselItems[currentIndex]

  return (
    <div className="relative overflow-hidden rounded-xl my-6 shadow-xl">
      <div className="relative h-[300px] md:h-[400px] w-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-4 md:px-10 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 text-center md:text-left mb-6 md:mb-0">
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`text-3xl md:text-5xl font-bold mb-4 ${item.textColor}`}
                  >
                    {item.title}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`text-lg md:text-xl mb-6 ${item.textColor}`}
                  >
                    {item.description}
                  </motion.p>
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                    <Button className={`${item.buttonColor} font-medium text-lg px-6 py-2 rounded-full`}>
                      Comprar Ahora
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Button
        onClick={prevSlide}
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full h-10 w-10 z-10"
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Diapositiva anterior</span>
      </Button>

      <Button
        onClick={nextSlide}
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full h-10 w-10 z-10"
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Siguiente diapositiva</span>
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "w-6 bg-white" : "bg-white/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <span className="sr-only">Ir a la diapositiva {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
