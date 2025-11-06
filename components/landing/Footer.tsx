import { Calendar, ExternalLink, Coffee, Heart } from "lucide-react";
import Link from "next/link";

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
      </div>
    </footer>
  );
}
