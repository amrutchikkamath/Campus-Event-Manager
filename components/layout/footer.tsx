import Link from "next/link"
import { Mail, Phone, MapPin, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <span className="font-serif text-xl font-bold text-primary">BIET Events</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">
              Professional campus event management system for BIET College students, faculty, and organizers.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/events" className="block text-muted-foreground hover:text-primary transition-colors">
                Browse Events
              </Link>
              <Link href="/calendar" className="block text-muted-foreground hover:text-primary transition-colors">
                Event Calendar
              </Link>
              <Link href="/create-event" className="block text-muted-foreground hover:text-primary transition-colors">
                Create Event
              </Link>
              <Link href="/register" className="block text-muted-foreground hover:text-primary transition-colors">
                Join Community
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Categories</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/events?category=academic"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Academic
              </Link>
              <Link
                href="/events?category=cultural"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Cultural
              </Link>
              <Link
                href="/events?category=sports"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Sports
              </Link>
              <Link
                href="/events?category=technical"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Technical
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>BIET Campus, Davangere</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>events@biet.edu</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 8192 123456</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 BIET Campus Events. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <p>
              Designed and Developed by <span className="font-semibold text-primary">SDX AMRUT</span>
            </p>
            <Link
              href="https://github.com/amrutchikkamath"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="text-xs">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
