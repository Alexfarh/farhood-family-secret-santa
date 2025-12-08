import { setWishList } from "@/lib/secret-santa-data"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { wishList } = await request.json()

    if (!Array.isArray(wishList)) {
      return Response.json({ success: false, message: "Wish list is required" }, { status: 400 })
    }

    // Get the person's name from the cookie (set during password verification)
    const cookieStore = await cookies()
    const personCookie = cookieStore.get("secretSantaUser")

    if (!personCookie || !personCookie.value) {
      return Response.json({ success: false, message: "Not authenticated. Please log in again." }, { status: 401 })
    }

    const person = decodeURIComponent(personCookie.value)

    // Store the wish list in the secretSanta dictionary
    await setWishList(person, wishList)

    console.log("Wish list submitted:", { person, wishList })

    // Trigger GitHub Action to auto-commit the changes
    if (process.env.GITHUB_TOKEN) {
      try {
        await fetch(
          "https://api.github.com/repos/alexfarh/farhood-family-secret-santa/dispatches",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              "X-GitHub-Api-Version": "2022-11-28",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              event_type: "wishlist-updated",
            }),
          }
        )
        console.log("✅ Triggered GitHub Action to auto-commit changes")
      } catch (error) {
        console.error("Failed to trigger GitHub Action:", error)
        // Don't fail the request if the trigger fails
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error submitting wish list:", error)
    return Response.json({ success: false }, { status: 500 })
  }
}
