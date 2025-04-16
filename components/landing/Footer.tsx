import { Calendar, ExternalLink, Coffee, Heart } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold">Availio</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Availio. All rights reserved.
          </div>
        </div>

        <div className="pt-4 border-t text-center space-y-4">
          <Link
            href="https://www.silverspark.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm hover:opacity-90 transition-opacity group"
          >
            <span>
              Developed by{" "}
              <span className="font-bold bg-gradient-to-r from-[#EF8811] to-amber-500 bg-clip-text text-transparent">
                Silver Spark Studio
              </span>{" "}
              in Richmond, VA
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-[#EF8811] opacity-80 group-hover:opacity-100 transition-opacity" />
          </Link>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-muted-foreground">
            <span className="font-medium">Support our free software</span>

            <div className="flex items-center gap-4">
              <Link
                href="https://www.patreon.com/silversparkstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Heart className="h-4 w-4 text-red-500" />
                <span>Patreon</span>
              </Link>

              <Link
                href="https://buymeacoffee.com/silversparkstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Coffee className="h-4 w-4 text-amber-600" />
                <span>Buy Us a Coffee</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
