import { setWishList, secretSanta, passwords } from "@/lib/secret-santa-data"
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

    // Commit changes to GitHub directly via GitHub API
    if (process.env.GITHUB_TOKEN) {
      try {
        console.log("🔄 Attempting to commit to GitHub...")
        
        // Prepare the data to commit
        const data = {
          passwords: { ...passwords },
          secretSanta: { ...secretSanta },
          lastInitialized: new Date().toISOString(),
        }
        
        const fileContent = JSON.stringify(data, null, 2)
        const encodedContent = Buffer.from(fileContent).toString('base64')

        // Get the current file SHA (needed for GitHub API)
        const getResponse = await fetch(
          "https://api.github.com/repos/alexfarh/farhood-family-secret-santa/contents/data/secret-santa.json",
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        )

        let sha: string | null = null
        if (getResponse.ok) {
          const fileData = await getResponse.json()
          sha = fileData.sha
        }

        // Update the file on GitHub
        const updateResponse = await fetch(
          "https://api.github.com/repos/alexfarh/farhood-family-secret-santa/contents/data/secret-santa.json",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              "X-GitHub-Api-Version": "2022-11-28",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: "Update wishlists",
              content: encodedContent,
              ...(sha && { sha }),
            }),
          }
        )

        if (updateResponse.ok) {
          console.log("✅ Successfully committed changes to GitHub")
        } else {
          const errorText = await updateResponse.text()
          console.error("❌ Failed to commit to GitHub:", updateResponse.status, errorText)
        }
      } catch (error) {
        console.error("❌ Error committing to GitHub:", error)
        // Don't fail the request if the commit fails
      }
    } else {
      console.warn("⚠️ GITHUB_TOKEN not found in environment variables")
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error submitting wish list:", error)
    return Response.json({ success: false }, { status: 500 })
  }
}
