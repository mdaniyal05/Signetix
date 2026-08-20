export const sanitizePhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/[\s\-()]/g, "")
}

export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const parts: string[] = []

  if (hrs > 0) parts.push(`${hrs}h`)
  if (mins > 0 || hrs > 0) parts.push(`${mins}m`)

  parts.push(`${secs}s`)

  return parts.join(" ")
}

export const formatTime = (time: number) => time.toString().padStart(2, "0")
