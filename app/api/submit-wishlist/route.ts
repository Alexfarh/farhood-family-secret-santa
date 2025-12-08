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

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error submitting wish list:", error)
    return Response.json({ success: false }, { status: 500 })
  }
}
