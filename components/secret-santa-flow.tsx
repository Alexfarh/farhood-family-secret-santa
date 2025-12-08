"use client"

import { useState } from "react"
import PasswordEntry from "./password-entry"
import WishListForm from "./wish-list-form"

export default function SecretSantaFlow() {
  const [stage, setStage] = useState<"password" | "reveal" | "wishlist">("password")
  const [assignedSanta, setAssignedSanta] = useState<string | null>(null)
  const [userPassword, setUserPassword] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const handlePasswordSubmit = async (password: string, participantName: string) => {
    const response = await fetch("/api/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    const data = await response.json()

    if (data.success) {
      setAssignedSanta(data.assignedSanta)
      setUserName(data.personName || null)
      setUserPassword(password)
      setStage("reveal")
    } else {
      // Display the error message from the API
      alert(data.message || "An error occurred. Please try again.")
    }
  }

  const handleWishListSubmit = async (wishList: string[]) => {
    const response = await fetch("/api/submit-wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wishList,
      }),
    })

    if (response.ok) {
      setStage("wishlist")
    }
  }

  return (
    <div className="w-full max-w-md">
      {stage === "password" && <PasswordEntry onSubmit={handlePasswordSubmit} />}

      {stage === "reveal" && assignedSanta && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-primary">
            <h2 className="text-center text-foreground/70 mb-6 text-lg font-semibold">Your Secret Santa is...</h2>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 text-center border-2 border-primary/20">
              <p className="text-5xl font-bold text-secondary mb-2">{assignedSanta}</p>
              <p className="text-sm text-foreground/60">Time to pick the perfect gift!</p>
            </div>
          </div>
          <button
            onClick={() => setStage("wishlist")}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3 px-4 rounded-lg transition"
          >
            Next: Add Your Wish List
          </button>
        </div>
      )}

      {stage === "wishlist" && (
        <WishListForm 
          onSubmit={handleWishListSubmit} 
          santaName={userName}
          assignedSanta={assignedSanta}
          onBack={() => setStage("reveal")}
        />
      )}
    </div>
  )
}
