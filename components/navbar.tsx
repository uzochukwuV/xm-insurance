"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center justify-between w-full">
          <a href="/" className="text-2xl font-bold">
            Logo
          </a>

          <div className="hidden md:flex space-x-4">
            <a href="/about" className="hover:text-gray-500">
              About
            </a>
            <a href="/services" className="hover:text-gray-500">
              Services
            </a>
            <a href="/contact" className="hover:text-gray-500">
              Contact
            </a>
          </div>

          <button onClick={toggleMobileMenu} className="md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-16 left-0 right-0 z-50 bg-white border-b shadow-lg md:hidden"
        >
          <div className="flex flex-col p-4 space-y-2">
            <a href="/about" className="hover:text-gray-500">
              About
            </a>
            <a href="/services" className="hover:text-gray-500">
              Services
            </a>
            <a href="/contact" className="hover:text-gray-500">
              Contact
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
