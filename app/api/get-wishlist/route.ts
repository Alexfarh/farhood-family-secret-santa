import { getWishList } from "@/lib/secret-santa-data"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get the person's name from the cookie (set during password verification)
    const cookieStore = await cookies()
    const personCookie = cookieStore.get("secretSantaUser")

    if (!personCookie || !personCookie.value) {
      return Response.json({ success: false, message: "Not authenticated. Please log in again." }, { status: 401 })
    }

    const person = decodeURIComponent(personCookie.value)

    // Get their wish list
    const wishList = getWishList(person)

    return Response.json({
      success: true,
      wishList: wishList || [],
    })
  } catch (error) {
    console.error("Error getting wish list:", error)
    return Response.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}

