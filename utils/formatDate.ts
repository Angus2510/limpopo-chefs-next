import { format, parseISO } from "date-fns";

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "PPP"); // Example: April 29, 2023
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}
