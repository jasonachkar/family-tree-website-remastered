import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  message: string
  duration?: number
  variant?: 'success' | 'error'
}

export default function SplashScreen({ message, duration = 2000, variant = 'success' }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed inset-0 flex items-center justify-center bg-opacity-90 z-50 ${
            variant === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className={`text-2xl font-bold mb-4 ${
              variant === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
