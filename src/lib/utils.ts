export { cn } from "cn"


export function sanitizeUsername(username: string): string {
  return username.trim().replace(/^@/, "");
}