"use client"

import type React from "react"

import { useState } from "react"

interface PasswordEntryProps {
  onSubmit: (password: string) => void
}

export default function PasswordEntry({ onSubmit }: PasswordEntryProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setIsLoading(true)
    try {
      await onSubmit(password)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-primary">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 break-words">
          <span className="text-secondary">🎄</span>
          <span className="text-primary"> Farhood Family Secret Santa </span>
          <span className="text-secondary">🎁</span>
        </h1>
        <p className="text-foreground/70 text-sm sm:text-base">Enter your password to reveal your assigned Secret Santa</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground placeholder-foreground/40"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !password.trim()}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-semibold py-3 px-4 rounded-lg transition"
        >
          {isLoading ? "Verifying..." : "Reveal My Secret Santa"}
        </button>
      </form>
    </div>
  )
}
