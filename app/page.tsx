"use client"
import SecretSantaFlow from "@/components/secret-santa-flow"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-red-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 text-4xl opacity-30">❄️</div>
      <div className="absolute top-20 right-5 text-5xl opacity-25">🎄</div>
      <div className="absolute bottom-10 right-10 text-4xl opacity-30">🎁</div>
      <div className="absolute bottom-20 left-5 text-5xl opacity-25">⛄</div>

      <SecretSantaFlow />
    </main>
  )
}
