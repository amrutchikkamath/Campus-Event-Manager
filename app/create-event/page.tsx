import { CreateEventForm } from "@/components/events/create-event-form"

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-primary mb-2">Create Event</h1>
          <p className="text-muted-foreground">Organize a new campus event for the BIET community</p>
        </div>

        <CreateEventForm />
      </div>
    </div>
  )
}
