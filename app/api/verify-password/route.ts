import { getPersonFromPassword, getSecretSanta } from "@/lib/secret-santa-data"

// In-memory store to track failed password attempts per IP
// In production, consider using Redis or a database for persistence
const failedAttempts = new Map<string, number>()

// Helper to get client IP address
function getClientIP(request: Request): string {
  // Try to get IP from various headers (for different deployment scenarios)
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip") // Cloudflare
  
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to a default identifier
  return "unknown"
}

// Reset failed attempts after successful login
function resetFailedAttempts(ip: string): void {
  failedAttempts.delete(ip)
}

// Increment and get failed attempts count
function incrementFailedAttempts(ip: string): number {
  const current = failedAttempts.get(ip) || 0
  const newCount = current + 1
  failedAttempts.set(ip, newCount)
  return newCount
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return Response.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      )
    }

    const clientIP = getClientIP(request)

    // Get the person's name from the password dictionary
    const person = getPersonFromPassword(password)

    if (!person) {
      // Invalid password - increment failed attempts
      const attemptCount = incrementFailedAttempts(clientIP)

      // After 5 failed attempts, suggest contacting Alex
      if (attemptCount >= 5) {
        return Response.json({
          success: false,
          message: "Incorrect password. Please try again or reach out to Alex to retrieve your password.",
          attempts: attemptCount,
        }, { status: 401 })
      }

      // Before 5 attempts, allow retries
      return Response.json({
        success: false,
        message: "Incorrect password. Please try again.",
        attempts: attemptCount,
      }, { status: 401 })
    }

    // Valid password - reset failed attempts and proceed
    resetFailedAttempts(clientIP)

    // Get their assigned secret santa from the secretSanta dictionary
    const assignedSanta = getSecretSanta(person)

    if (!assignedSanta) {
      return Response.json(
        { success: false, message: "No secret santa assigned" },
        { status: 500 }
      )
    }

    // Set a cookie with the person's name for session management
    const response = Response.json({
      success: true,
      assignedSanta,
      personName: person, // Return the person's name so frontend can display it
    })

    // Set cookie with person's name (expires in 7 days)
    response.headers.set(
      'Set-Cookie',
      `secretSantaUser=${encodeURIComponent(person)}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
    )

    return response
  } catch (error) {
    console.error("Error verifying password:", error)
    return Response.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
