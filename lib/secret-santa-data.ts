/**
 * Secret Santa Data Structure
 * 
 * passwords: Maps passwords to family member names
 * secretSanta: Maps family member names to (their secret santa, wish list) tuples
 * 
 * These are loaded from disk on startup and persisted across server restarts.
 */

import { FAMILY_MEMBERS } from "./family-members"
import { loadData, saveData, clearData, type PersistenceData } from "./persistence"

// Dictionary: password -> family member name
export const passwords: Record<string, string> = {}

// Dictionary: family member name -> (their secret santa, wish list)
export const secretSanta: Record<string, [string, string[]]> = {}

// Track initialization state
let isInitialized = false

/**
 * ADMIN FUNCTION: Initialize Secret Santa assignments
 * Randomizes Secret Santa assignments ensuring:
 * - Nobody has themselves as secret santa
 * - Everyone has a unique individual as secret santa
 * - Once someone is assigned, they're removed from the pool
 * 
 * Uses a queue-based algorithm to ensure valid assignments.
 * 
 * This function populates the passwords and secretSanta dictionaries and saves them to disk/KV.
 * Run this ONCE to set up the Secret Santa assignments.
 */
export async function initializeSecretSanta(familyMembers: string[]): Promise<void> {
  // Validate input
  if (familyMembers.length < 2) {
    throw new Error("Need at least 2 family members for Secret Santa")
  }

  // Create a queue with all family members and randomize it once
  const queue = [...familyMembers]
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[queue[i], queue[j]] = [queue[j], queue[i]]
  }

  // Clear existing data
  Object.keys(passwords).forEach(key => delete passwords[key])
  Object.keys(secretSanta).forEach(key => delete secretSanta[key])

  // Generate random 8 character password for each person
  function generatePassword(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Assign secret santas using the queue
  for (const person of familyMembers) {
    let assigned = false
    
    // Keep popping from queue until we find a valid assignment
    while (!assigned) {
      const candidate = queue.shift()
      
      if (!candidate) {
        throw new Error("Unable to create valid Secret Santa assignments")
      }

      // If it's not the same person, assign it
      if (candidate !== person) {
        secretSanta[person] = [candidate, []]
        assigned = true
      } else {
        // Otherwise add it to the bottom of the queue
        queue.push(candidate)
      }
    }

    // Generate a random 8 character password
    const password = generatePassword()
    passwords[password] = person
  }

  // Save to disk/KV so data persists across server restarts
  const data: PersistenceData = {
    passwords: { ...passwords },
    secretSanta: { ...secretSanta },
    lastInitialized: new Date().toISOString(),
  }
  await saveData(data)
}

/**
 * ADMIN FUNCTION: Generate Secret Santa assignments (returns data without modifying)
 * Used for preview/generation purposes
 */
export function generateSecretSantaAssignments(familyMembers: string[]): {
  passwords: Record<string, string>
  secretSanta: Record<string, [string, string[]]>
} {
  // Validate input
  if (familyMembers.length < 2) {
    throw new Error("Need at least 2 family members for Secret Santa")
  }

  // Create a queue with all family members and randomize it once
  const queue = [...familyMembers]
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[queue[i], queue[j]] = [queue[j], queue[i]]
  }

  // Generate the data structures
  const passwords: Record<string, string> = {}
  const secretSanta: Record<string, [string, string[]]> = {}

  // Generate random 8 character password for each person
  function generatePassword(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Assign secret santas using the queue
  for (const person of familyMembers) {
    let assigned = false
    
    // Keep popping from queue until we find a valid assignment
    while (!assigned) {
      const candidate = queue.shift()
      
      if (!candidate) {
        throw new Error("Unable to create valid Secret Santa assignments")
      }

      // If it's not the same person, assign it
      if (candidate !== person) {
        secretSanta[person] = [candidate, []]
        assigned = true
      } else {
        // Otherwise add it to the bottom of the queue
        queue.push(candidate)
      }
    }

    // Generate a random 8 character password
    const password = generatePassword()
    passwords[password] = person
  }

  return {
    passwords: passwords,
    secretSanta: secretSanta,
  }
}

/**
 * Get the person's name from a password
 */
export function getPersonFromPassword(password: string): string | undefined {
  return passwords[password]
}

/**
 * Get the secret santa assignment for a person
 */
export function getSecretSanta(person: string): string | undefined {
  return secretSanta[person]?.[0]
}

/**
 * Get the wish list for a person
 */
export function getWishList(person: string): string[] {
  return secretSanta[person]?.[1] || []
}

/**
 * Set the wish list for a person
 */
export async function setWishList(person: string, wishList: string[]): Promise<void> {
  if (secretSanta[person]) {
    secretSanta[person][1] = wishList
    // Save to disk/KV whenever wish list is updated
    const data: PersistenceData = {
      passwords: { ...passwords },
      secretSanta: { ...secretSanta },
      lastInitialized: new Date().toISOString(),
    }
    await saveData(data)
  }
}

/**
 * Auto-initialize from disk/KV if available, otherwise initialize with default family members
 * This runs when the module is first loaded (server-side only)
 */
async function autoInitializeIfNeeded() {
  if (isInitialized) {
    return
  }

  // Try to load from disk/KV first
  const persistedData = await loadData()
  
  if (persistedData) {
    // Restore from disk/KV
    Object.assign(passwords, persistedData.passwords)
    Object.assign(secretSanta, persistedData.secretSanta)
    console.log("✅ Restored Secret Santa data from storage")
    isInitialized = true
  } else if (Object.keys(passwords).length === 0 && Object.keys(secretSanta).length === 0) {
    // No persisted data, initialize with default family members
    console.log("📝 Initializing Secret Santa with default family members...")
    await initializeSecretSanta(FAMILY_MEMBERS)
    isInitialized = true
  }
}

// Auto-initialize on module load (server-side only)
if (typeof window === 'undefined') {
  autoInitializeIfNeeded().catch((error) => {
    console.error("Error during auto-initialization:", error)
  })
}

