'use client'

import { useState, useEffect } from 'react'
import ReactConfetti from 'react-confetti'
import { motion, AnimatePresence } from 'framer-motion'

const Firework = ({ x, y }: { x: number; y: number }) => (
  <motion.div
    className="absolute w-2 h-2 bg-pink-500 rounded-full"
    style={{ x, y }}
    animate={{
      scale: [0, 1, 1, 0],
      opacity: [1, 1, 0, 0],
      y: y - Math.random() * 200,
    }}
    transition={{ duration: 0.7, ease: "easeOut" }}
  />
)

export default function BirthdaySplashScreen() {
  const [showSplash, setShowSplash] = useState(true)
  const [fireworks, setFireworks] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    const fireworkInterval = setInterval(() => {
      setFireworks(prev => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        },
      ])
    }, 200)

    return () => {
      clearTimeout(timer)
      clearInterval(fireworkInterval)
    }
  }, [])

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-500"
        >
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
            gravity={0.1}
          />
          {fireworks.map(fw => (
            <Firework key={fw.id} x={fw.x} y={fw.y} />
          ))}
          <motion.h1
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-white text-center px-4"
          >
            Happy 20th Birthday, Tati!
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
