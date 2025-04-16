import { formatDate } from "@/lib/dateUtils"

interface GridHeaderProps {
  dates: Date[]
}

export function GridHeader({ dates }: GridHeaderProps) {
  return (
    <tr>
      {/* Empty cell for time label column */}
      <th className="w-16 px-0"></th>

      {/* Date headers */}
      {dates.map((date) => (
        <th key={date.toISOString()} className="text-center px-0 pb-1 w-14">
          <div className="text-sm font-medium">{formatDate(date).split(",")[0]}</div>
          <div className="text-xs text-muted-foreground">{formatDate(date).split(",")[1]}</div>
        </th>
      ))}
    </tr>
  )
}
