import { neon } from "@neondatabase/serverless"

// Create a SQL client with the connection string from environment variables
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to convert date objects to ISO strings for database storage
export function dateToISOString(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Helper function to convert ISO strings from database to Date objects
export function isoStringToDate(isoString: string): Date {
  return new Date(isoString)
}
