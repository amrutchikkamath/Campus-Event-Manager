import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative py-8"
      style={{
        backgroundImage: "url('/images/biet-campus.jpg')",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-white mb-2">BIET Campus Events</h1>
          <p className="text-white/90">Join our event management community</p>
        </div>

        <RegisterForm />

        <div className="text-center mt-6">
          <p className="text-white/90">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-semibold hover:text-primary-foreground underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
