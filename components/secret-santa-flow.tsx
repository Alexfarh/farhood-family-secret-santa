"use client"

import { useState, useEffect } from "react"
import PasswordEntry from "./password-entry"
import WishListForm from "./wish-list-form"

export default function SecretSantaFlow() {
  const [stage, setStage] = useState<"password" | "reveal" | "wishlist">("password")
  const [assignedSanta, setAssignedSanta] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [santaWishList, setSantaWishList] = useState<string[]>([])
  const [loadingSantaWishList, setLoadingSantaWishList] = useState(false)

  // Fetch secret santa's wishlist when reveal stage is reached
  useEffect(() => {
    if (stage === "reveal" && assignedSanta) {
      fetchSantaWishList()
    }
  }, [stage, assignedSanta])

  const fetchSantaWishList = async () => {
    if (!assignedSanta) return

    setLoadingSantaWishList(true)
    try {
      const response = await fetch("/api/get-wishlist-by-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personName: assignedSanta }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.wishList && Array.isArray(data.wishList)) {
          setSantaWishList(data.wishList.filter((w: string) => w.trim()))
        }
      }
    } catch (error) {
      console.error("Error fetching secret santa wishlist:", error)
    } finally {
      setLoadingSantaWishList(false)
    }
  }

  const handlePasswordSubmit = async (password: string) => {
    const response = await fetch("/api/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    const data = await response.json()

    if (data.success) {
      setAssignedSanta(data.assignedSanta)
      setUserName(data.personName || null)
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
    <div className="w-full max-w-2xl">
      {stage === "password" && <PasswordEntry onSubmit={handlePasswordSubmit} />}

      {stage === "reveal" && assignedSanta && (
        <div className="space-y-6">
          {/* Secret Santa Reveal */}
          <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-primary">
            <h2 className="text-center text-foreground/70 mb-6 text-lg font-semibold">Your Secret Santa is...</h2>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 text-center border-2 border-primary/20">
              <p className="text-5xl font-bold text-secondary mb-2">{assignedSanta}</p>
              <p className="text-sm text-foreground/60">Time to pick the perfect gift!</p>
            </div>
          </div>

          {/* Secret Santa Wishlist */}
          <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-secondary">
            <h3 className="text-2xl font-bold text-secondary mb-6">{assignedSanta}'s Wish List</h3>
            
            {loadingSantaWishList ? (
              <div className="text-center py-8">
                <p className="text-foreground/60">Loading wish list...</p>
              </div>
            ) : santaWishList.length > 0 ? (
              <div className="space-y-3">
                {santaWishList.map((wish, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-secondary/10 rounded-lg border-l-4 border-secondary">
                    <span className="flex-shrink-0 font-bold text-secondary text-lg">
                      {index + 1}
                    </span>
                    <span className="text-foreground text-lg">{wish}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-secondary/5 rounded-lg">
                <p className="text-foreground/60 text-lg">
                  {assignedSanta} hasn't added their wish list yet. Check back later! ✨
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setStage("wishlist")}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3 px-4 rounded-lg transition"
            >
              Add Your Wish List
            </button>
          </div>
        </div>
      )}

      {stage === "wishlist" && (
        <WishListForm 
          onSubmit={handleWishListSubmit} 
          santaName={userName}
          onBack={() => setStage("reveal")}
        />
      )}
    </div>
  )
}
