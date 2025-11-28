"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import "./mobile-hero-carousel.css"

const carouselItems = [
  {
    id: 1,
    image: "/mari.png",
  },
  {
    id: 2,
    image: "/ps.png",
  },
  {
    id: 3,
    image: "/gears.png",
  },
]

export default function MobileHeroCarousel() {
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
        x: direction > 0 ? 500 : -500,
        opacity: 0,
      }
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 500 : -500,
        opacity: 0,
      }
    },
  }

  const item = carouselItems[currentIndex]

  return (
    <div className="mobile-carousel-container">
      <div className="mobile-carousel-wrapper">
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
            className="mobile-carousel-slide"
          >
            <img
              src={item.image}
              alt={`Carousel ${item.id}`}
              className="mobile-carousel-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-carousel.png'
              }}
            />
            <div className="mobile-carousel-overlay"></div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Button
        onClick={prevSlide}
        variant="ghost"
        size="icon"
        className="mobile-carousel-button mobile-carousel-button-prev"
        aria-label="Diapositiva anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        onClick={nextSlide}
        variant="ghost"
        size="icon"
        className="mobile-carousel-button mobile-carousel-button-next"
        aria-label="Siguiente diapositiva"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      <div className="mobile-carousel-indicators">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={`mobile-carousel-indicator ${index === currentIndex ? "active" : ""}`}
            aria-label={`Ir a la diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

