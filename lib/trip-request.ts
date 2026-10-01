export type ExtractedTripRequest = {
  origin?: string
  destination?: string
  days?: number
  startDate?: string
  endDate?: string
}

const monthNumbers: Record<string, string> = {
  jan: "01", january: "01", feb: "02", february: "02", mar: "03", march: "03",
  apr: "04", april: "04", may: "05", jun: "06", june: "06", jul: "07", july: "07",
  aug: "08", august: "08", sep: "09", sept: "09", september: "09", oct: "10", october: "10",
  nov: "11", november: "11", dec: "12", december: "12",
}

function cleanPlace(value: string) {
  return value
    .replace(/^[\s,;:.!?-]+|[\s,;:.!?-]+$/g, "")
    .replace(/\b(?:for|with|and|aur|couple|family|friends|group|solo|people|travellers?)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
}

function toIsoDate(day: string, month: string, year?: string) {
  const monthNumber = monthNumbers[month.toLowerCase()]
  if (!monthNumber) return ""
  const dateYear = year || String(new Date().getFullYear())
  const date = new Date(`${dateYear}-${monthNumber}-${String(day).padStart(2, "0")}T00:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.getUTCMonth() + 1 !== Number(monthNumber)) return ""
  return `${dateYear}-${monthNumber}-${String(day).padStart(2, "0")}`
}

function removeDatesAndPreferences(query: string) {
  return query
    .replace(/\b\d{1,2}(?:st|nd|rd|th)?\s*(?:of\s+)?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)(?:\s+\d{4})?\b/gi, " ")
    .replace(/\b(?:for\s+)?\d+\s*(?:days?|nights?)\b/gi, " ")
    .replace(/\b(?:for|with)\s+(?:a\s+)?(?:couple|family|friends|group|solo|\d+\s+(?:people|travellers?))\b/gi, " ")
    .replace(/\b(?:starting|starts)\s+(?:on|from)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function extractTripRequest(rawQuery: string): ExtractedTripRequest {
  const query = rawQuery.trim()
  if (!query) return {}

  const result: ExtractedTripRequest = {}
  const durationMatch = query.match(/\b(?:for\s+)?(\d+)\s*(?:days?|nights?)\b/i)
  if (durationMatch) result.days = Math.max(1, Math.min(Number(durationMatch[1]), 30))

  const dateMatches = [...query.matchAll(/\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)(?:\s+(\d{4}))?\b/gi)]
  const dates = dateMatches.map((match) => toIsoDate(match[1], match[2], match[3])).filter(Boolean)
  if (dates.length >= 2) {
    result.startDate = dates[0]
    result.endDate = dates[1]
    result.days = Math.max(1, Math.round((Date.parse(`${dates[1]}T00:00:00Z`) - Date.parse(`${dates[0]}T00:00:00Z`)) / 86400000) + 1)
  } else if (dates.length === 1) {
    result.startDate = dates[0]
  }

  const routeQuery = removeDatesAndPreferences(query)
  const routeMatch = routeQuery.match(/^(?:please\s+)?(?:plan\s+)?(?:a\s+)?(?:trip\s+)?from\s+(.+?)\s+to\s+(.+)$/i)
    || routeQuery.match(/^(.+?)\s+(?:to|->|→)\s+(.+)$/i)
    || routeQuery.match(/^(.+?)\s+se\s+(.+)$/i)

  if (routeMatch) {
    result.origin = cleanPlace(routeMatch[1].replace(/^(?:please\s+)?(?:plan\s+)?(?:a\s+)?(?:trip\s+)?/i, ""))
    result.destination = cleanPlace(routeMatch[2])
  } else {
    const destination = routeQuery
      .replace(/^(?:please\s+)?(?:plan|create|make|generate|build|suggest)\s+(?:me\s+)?(?:a\s+)?/i, "")
      .replace(/^(?:a\s+)?(?:trip|tour|itinerary|vacation|holiday)\s+(?:to|for)\s+/i, "")
      .replace(/\s+(?:trip|tour|itinerary|vacation|holiday|travel\s+plan)$/i, "")
      .replace(/\b(?:trip|tour|itinerary|vacation|holiday)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
    if (destination) result.destination = cleanPlace(destination)
  }

  return result
}

export function suggestedDuration(destination: string) {
  const normalized = destination.trim()
  if (!normalized) return 4
  if (/[,+&]|\b(?:and|aur)\b/i.test(normalized)) return 5
  return 4
}
