/**
 * Persistence Module
 * Handles reading/writing Secret Santa data to disk (local) or Vercel KV (production)
 * 
 * LOCAL: Uses JSON files in data/ directory
 * PRODUCTION (Vercel): Uses Vercel KV (Redis)
 * 
 * Only runs on the server side (not in browser)
 */

import * as fs from "fs"
import * as path from "path"

// Check if we're using Vercel KV
const USE_VERCEL_KV = process.env.KV_URL !== undefined

let kv: any = null
if (USE_VERCEL_KV) {
  try {
    const { kv: vercelKv } = require("@vercel/kv")
    kv = vercelKv
    console.log("✅ Vercel KV initialized (KV_URL found)")
  } catch (e) {
    console.error("Failed to import @vercel/kv:", e)
  }
} else {
  console.log("⚠️ KV_URL not found - using local file storage")
}

// Use a data directory in the project root (for local development)
const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "secret-santa.json")
const KV_KEY = "secret-santa:data"

// Interface for persisted data
export interface PersistenceData {
  passwords: Record<string, string>
  secretSanta: Record<string, [string, string[]]>
  lastInitialized: string
}

/**
 * Ensure the data directory exists
 */
function ensureDataDirectory(): void {
  if (typeof window !== "undefined") {
    // Don't run on client side
    return
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch (error) {
    console.error("Error creating data directory:", error)
  }
}

/**
 * Load data from disk (local) or Vercel KV (production)
 */
export async function loadData(): Promise<PersistenceData | null> {
  if (typeof window !== "undefined") {
    // Don't run on client side
    return null
  }

  try {
    if (USE_VERCEL_KV && kv) {
      // Load from Vercel KV
      const data = await kv.get(KV_KEY)
      if (data) {
        console.log("✅ Loaded Secret Santa data from Vercel KV")
        return data as PersistenceData
      }
    } else {
      // Load from local file
      ensureDataDirectory()

      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, "utf-8")
        const data = JSON.parse(fileContent) as PersistenceData
        console.log("✅ Loaded Secret Santa data from disk")
        return data
      }
    }
  } catch (error) {
    console.error("Error loading data:", error)
  }

  return null
}

/**
 * Save data to disk (local) or Vercel KV (production)
 */
export async function saveData(data: PersistenceData): Promise<void> {
  if (typeof window !== "undefined") {
    // Don't run on client side
    return
  }

  try {
    if (USE_VERCEL_KV && kv) {
      // Save to Vercel KV
      await kv.set(KV_KEY, data)
      console.log("✅ Saved Secret Santa data to Vercel KV")
    } else {
      // Save to local file
      ensureDataDirectory()

      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
      console.log("✅ Saved Secret Santa data to disk")
    }
  } catch (error) {
    console.error("Error saving data:", error)
  }
}

/**
 * Clear all persisted data
 */
export async function clearData(): Promise<void> {
  if (typeof window !== "undefined") {
    // Don't run on client side
    return
  }

  try {
    if (USE_VERCEL_KV && kv) {
      // Clear from Vercel KV
      await kv.del(KV_KEY)
      console.log("✅ Cleared Secret Santa data from Vercel KV")
    } else {
      // Clear from local file
      if (fs.existsSync(DATA_FILE)) {
        fs.unlinkSync(DATA_FILE)
        console.log("✅ Cleared Secret Santa data from disk")
      }
    }
  } catch (error) {
    console.error("Error clearing data:", error)
  }
}
