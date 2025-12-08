import { getWishList } from "@/lib/secret-santa-data"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { personName } = await request.json()

    if (!personName) {
      return Response.json({ success: false, message: "Person name is required" }, { status: 400 })
    }

    // Verify the user is authenticated
    const cookieStore = await cookies()
    const personCookie = cookieStore.get("secretSantaUser")

    if (!personCookie || !personCookie.value) {
      return Response.json({ success: false, message: "Not authenticated. Please log in again." }, { status: 401 })
    }

    // Get the wish list for the specified person
    const wishList = getWishList(personName)

    return Response.json({
      success: true,
      wishList: wishList || [],
    })
  } catch (error) {
    console.error("Error getting wish list by name:", error)
    return Response.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}

