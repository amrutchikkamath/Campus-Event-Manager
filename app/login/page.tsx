import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/images/biet-campus.jpg')",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-white mb-2">BIET Campus Events</h1>
          <p className="text-white/90">Professional Event Management System</p>
        </div>

        <LoginForm />

        <div className="text-center mt-6">
          <p className="text-white/90">
            Don't have an account?{" "}
            <Link href="/register" className="text-white font-semibold hover:text-primary-foreground underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
