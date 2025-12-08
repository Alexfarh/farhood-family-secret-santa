import { initializeSecretSanta, passwords } from "@/lib/secret-santa-data"
import { NextResponse } from "next/server"

/**
 * ADMIN ENDPOINT: Initialize Secret Santa assignments
 * POST /api/initialize
 * Body: { familyMembers: string[] }
 * 
 * This initializes the Secret Santa assignments in storage (disk/KV).
 */
export async function POST(request: Request) {
  try {
    const { familyMembers } = await request.json()

    if (!Array.isArray(familyMembers) || familyMembers.length < 2) {
      return NextResponse.json(
        { success: false, message: "Please provide at least 2 family members" },
        { status: 400 }
      )
    }

    // Remove duplicates and empty strings
    const uniqueMembers = Array.from(new Set(familyMembers.filter((name) => name.trim())))

    if (uniqueMembers.length < 2) {
      return NextResponse.json(
        { success: false, message: "Please provide at least 2 unique family members" },
        { status: 400 }
      )
    }

    // Initialize Secret Santa assignments (populates the dictionaries)
    await initializeSecretSanta(uniqueMembers)

    // Return the passwords for each family member
    const passwordAssignments = Object.entries(passwords).map(([password, person]) => ({
      person,
      password,
    }))

    return NextResponse.json({
      success: true,
      message: `Secret Santa assignments initialized for ${uniqueMembers.length} family members`,
      passwordAssignments,
    })
  } catch (error) {
    console.error("Error initializing Secret Santa assignments:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to initialize assignments" },
      { status: 500 }
    )
  }
}

