"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface WishListFormProps {
  onSubmit: (wishList: string[]) => void
  santaName?: string | null
  assignedSanta?: string | null
  onBack?: () => void
}

const getPlaceholder = (index: number): string => {
  switch (index) {
    case 0:
      return "Bluetooth headphones"
    case 1:
      return "Wireless charger"
    case 2:
      return "Smartwatch"
    case 3:
      return "Eco-friendly water bottle"
    case 4:
      return "Portable phone stand"
    default:
      return ""
  }
}


export default function WishListForm({ onSubmit, santaName, assignedSanta, onBack }: WishListFormProps) {
  const [currentWishes, setCurrentWishes] = useState<string[]>(["", "", "", "", ""])
  const [inputWishes, setInputWishes] = useState<string[]>(["", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [updatingIndex, setUpdatingIndex] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [santaWishList, setSantaWishList] = useState<string[]>([])
  const [showSantaWishList, setShowSantaWishList] = useState(false)
  const [loadingSantaWishList, setLoadingSantaWishList] = useState(false)

  // Fetch current wishlist on mount
  useEffect(() => {
    const fetchCurrentWishlist = async () => {
      try {
        const response = await fetch("/api/get-wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.wishList && Array.isArray(data.wishList)) {
            const wishes = [...data.wishList]
            // Ensure we have exactly 5 wishes (pad with empty strings if needed)
            while (wishes.length < 5) {
              wishes.push("")
            }
            setCurrentWishes(wishes.slice(0, 5))
            setInputWishes(wishes.slice(0, 5))
          }
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error)
      }
    }

    fetchCurrentWishlist()
  }, [])

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

  const handleViewSantaWishList = () => {
    if (!showSantaWishList && santaWishList.length === 0) {
      fetchSantaWishList()
    }
    setShowSantaWishList(!showSantaWishList)
  }

  const handleWishChange = (index: number, value: string) => {
    const newWishes = [...inputWishes]
    newWishes[index] = value
    setInputWishes(newWishes)
    setSuccessMessage(null)
  }

  const handleWishUpdate = async (index: number) => {
    if (!inputWishes[index]?.trim()) {
      alert("Please enter a wish before submitting")
      return
    }

    setUpdatingIndex(index)
    setIsLoading(true)
    setSuccessMessage(null)

    try {
      // Create updated wishlist
      const updatedWishes = [...currentWishes]
      updatedWishes[index] = inputWishes[index].trim()

      // Submit the updated wishlist
      await onSubmit(updatedWishes)

      // Update current wishes to reflect the change
      setCurrentWishes([...updatedWishes])
      setSuccessMessage(`Your priority ${index + 1} wish has been updated!`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      alert("Failed to update wish. Please try again.")
    } finally {
      setIsLoading(false)
      setUpdatingIndex(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-secondary">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-secondary mb-2">Your Wish List</h2>
        <p className="text-foreground/70 mb-2">
          {santaName && <span className="font-semibold">Hi {santaName}! </span>}
          Enter your top 5 priority wishes under $50
        </p>
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 text-sm text-foreground/70 hover:text-foreground underline"
        >
          ← Back to Secret Santa
        </button>
      )}

      {/* Secret Santa Wish List Section */}
      {assignedSanta && (
        <div className="mb-6 p-4 bg-secondary/10 rounded-lg border-2 border-secondary">
          <button
            onClick={handleViewSantaWishList}
            disabled={loadingSantaWishList}
            className="w-full text-left flex items-center justify-between"
          >
            <span className="font-semibold text-secondary">
              {showSantaWishList ? "Hide" : "View"} {assignedSanta}'s Wish List
            </span>
            <span className="text-secondary">{showSantaWishList ? "▲" : "▼"}</span>
          </button>
          
          {showSantaWishList && (
            <div className="mt-4 pt-4 border-t-2 border-secondary/20">
              {loadingSantaWishList ? (
                <p className="text-sm text-foreground/60">Loading...</p>
              ) : santaWishList.length > 0 ? (
                <div className="space-y-2">
                  {santaWishList.map((wish, index) => (
                    <div key={index} className="text-sm text-foreground/90">
                      <span className="font-semibold">Priority {index + 1}:</span> {wish}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/60">
                  {assignedSanta} hasn't added their wish list yet.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Display Current Wishes */}
      {currentWishes.some((w) => w.trim()) && (
        <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary">
          <h3 className="text-sm font-semibold text-primary mb-3">Your Current Wishes:</h3>
          <div className="space-y-2">
            {currentWishes.map((wish, index) => (
              wish.trim() && (
                <div key={index} className="text-sm text-primary/90">
                  <span className="font-semibold">Priority {index + 1}:</span> {wish}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border-2 border-green-400 rounded-lg">
          <p className="text-sm font-semibold text-green-800">✓ {successMessage}</p>
        </div>
      )}

      {/* Update Forms */}
      <div className="space-y-4">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="border-2 border-border rounded-lg p-4">
            <label htmlFor={`wish-${index}`} className="block text-sm font-semibold text-foreground mb-2">
              Form {index + 1}
            </label>
            <div className="flex gap-2">
              <input
                id={`wish-${index}`}
                type="text"
                value={inputWishes[index]}
                onChange={(e) => handleWishChange(index, e.target.value)}
                placeholder={`e.g., ${getPlaceholder(index)}`}
                className="flex-1 px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-background text-foreground placeholder-foreground/40"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => handleWishUpdate(index)}
                disabled={isLoading || !inputWishes[index]?.trim() || inputWishes[index] === currentWishes[index]}
                className="px-4 py-2 bg-secondary hover:bg-secondary/90 disabled:bg-muted text-secondary-foreground font-semibold rounded-lg transition whitespace-nowrap"
              >
                {updatingIndex === index ? "Updating..." : inputWishes[index] === currentWishes[index] ? "Updated" : "Update"}
              </button>
            </div>
            {currentWishes[index] && currentWishes[index] !== inputWishes[index] && (
              <p className="text-xs text-foreground/60 mt-1">
                Current: <span className="line-through">{currentWishes[index]}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-foreground/60 mt-4">
        💡 Tip: Be specific! "Blue coffee mug" is better than just "mug". You can update any wish at any time.
      </p>
    </div>
  )
}
