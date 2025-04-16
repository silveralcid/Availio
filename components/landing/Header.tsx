import Link from "next/link"
import { Calendar, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Availio</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </a>
          <Link
            href="https://github.com/silveralcid/availio/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <Github className="h-4 w-4" />
            <span>Request Features</span>
          </Link>
        </nav>

        {/* Mobile navigation */}
        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/silveralcid/availio/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">Request Features</span>
          </Link>
          <Link href="/create">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
