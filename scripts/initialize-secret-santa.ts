/**
 * ADMIN SCRIPT: Initialize Secret Santa assignments
 * 
 * Usage:
 * 1. Update the FAMILY_MEMBERS array in lib/family-members.ts with your family member names
 * 2. Run: npx tsx scripts/initialize-secret-santa.ts
 * 
 * This will initialize the Secret Santa assignments in the application.
 * Note: The app will also auto-initialize on startup using the family members from lib/family-members.ts
 */

import { initializeSecretSanta, passwords, secretSanta } from "../lib/secret-santa-data"
import { FAMILY_MEMBERS } from "../lib/family-members"

function main() {
  console.log("🎄 Initializing Secret Santa assignments...\n")

  try {
    // Initialize the Secret Santa assignments (populates the dictionaries)
    initializeSecretSanta(FAMILY_MEMBERS)

    console.log("✅ Secret Santa assignments initialized successfully!\n")
    console.log("📋 Password Assignments:\n")
    console.log("─".repeat(60))

    // Display passwords for each person
    Object.entries(passwords).forEach(([password, person]) => {
      const assignedSanta = secretSanta[person][0]
      console.log(`Person: ${person}`)
      console.log(`Password: ${password}`)
      console.log(`Secret Santa: ${assignedSanta}`)
      console.log("─".repeat(60))
    })

    console.log("\n✨ Secret Santa assignments are now active and ready to use!")
    console.log("\n💡 Note: These assignments are stored in memory and will persist until the server restarts.")
    console.log("   To initialize via API, POST to /api/initialize with the family members list.")
  } catch (error) {
    console.error("❌ Error initializing Secret Santa assignments:", error)
    process.exit(1)
  }
}

main()

