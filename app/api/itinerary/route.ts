import { NextResponse } from 'next/server'

type ItineraryRequest = {
  origin: string
  destination: string
  startDate?: string
  endDate?: string
  days: number
  adults: number
  children: number
  travellerType: string
  budget: string
  hotelCategory: string
  transport: string
  meals: string
  tripType: string
  requirements: string
}

type Day = {
  day: number
  date: string
  title: string
  location: string
  summary: string
  morning: string[]
  afternoon: string[]
  evening: string[]
  night: string[]
  distance: string
  travelTime: string
  transport: string
  departure: string
  meals: string[]
  hotel: { city: string; category: string; name: string; options: string[]; mealPlan: string }
  activities: string[]
  optional: string[]
  image?: string
}

type StructuredItinerary = {
  trip: ItineraryRequest & { duration: string; nights: number }
  title: string
  summary: string
  route: string[]
  days: Day[]
  hotels: { city: string; nights: number; options: string[] }[]
  transportPlan: { route: string; mode: string; distance: string; duration: string; cost: string }[]
  cost: { hotels: string; transport: string; activities: string; meals: string; miscellaneous: string; total: string; perPerson: string }
  packageOptions: { name: string; details: string }[]
  inclusions: string[]
  exclusions: string[]
  tips: string[]
  importantNotes: string[]
  packing: string[]
  emergency: string[]
}

function clean(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 400) : fallback
}

function fallbackItinerary(input: ItineraryRequest): StructuredItinerary {
  const places = input.destination.toLowerCase().includes('goa') ? ['North Goa', 'South Goa', 'Panaji'] : [input.destination, 'Nearby highlights', 'Local experiences']
  const dayTemplates = [
    ['Arrival and easy first impressions', ['Arrive and transfer to the hotel', 'Complete check-in and refresh'], ['Lunch at a local restaurant', `Explore the welcoming side of ${places[0]}`], ['Sunset at a scenic viewpoint', 'Unhurried market or café time'], ['Dinner and overnight stay'], 'Airport / city to hotel', '2-4 hours'],
    ['Signature sights and local stories', ['Breakfast at the hotel', 'Depart by 9:00 AM'], ['Visit the main landmark cluster', 'Stop for a regional lunch'], ['Continue to a nearby market or viewpoint', 'Keep the evening relaxed'], ['Dinner and overnight stay'], 'Local sightseeing loop', '6-7 hours'],
    ['A slower local experience', ['Breakfast and a guided walk', 'Explore a neighbourhood at an easy pace'], ['Hands-on food, craft, or culture experience', 'Lunch with a local speciality'], ['Free time for shopping or rest', 'Optional sunset activity'], ['Dinner and overnight stay'], 'Hotel to local experience', '4-5 hours'],
    ['Beyond the centre', ['Breakfast and depart after checkout if moving hotels', 'Scenic transfer to the next base'], ['Day excursion with practical photo stops', 'Lunch en route'], ['Return before dark', 'Leisure time at the hotel'], ['Dinner and overnight stay'], 'Intercity / day excursion', '3-6 hours'],
    ['Highlights and free time', ['Breakfast', 'Choose one major attraction rather than rushing several'], ['Lunch and a curated sightseeing cluster', 'Rest during the warmest part of the day'], ['Sunset, market, or cultural show', 'Free time for personal plans'], ['Dinner and overnight stay'], 'Local sightseeing loop', '5-6 hours'],
  ]
  const days = Array.from({ length: input.days }, (_, index) => {
    const template = dayTemplates[index % dayTemplates.length]
    const place = places[index % places.length]
    return {
      day: index + 1,
      date: input.startDate ? `Day ${index + 1}` : '',
      title: String(template[0]),
      location: `${place}${index === 0 ? ` | ${input.origin} to ${input.destination}` : ''}`,
      summary: `A comfortable day focused on ${String(template[0]).toLowerCase()}, with realistic travel time and space to enjoy the destination.`,
      morning: template[1] as string[], afternoon: template[2] as string[], evening: template[3] as string[], night: template[4] as string[],
      distance: template[5] as string, travelTime: template[6] as string, transport: input.transport || 'Private AC cab / local taxi', departure: '09:00 AM',
      meals: [input.meals || 'Breakfast and dinner suggestions'], hotel: { city: place, category: input.hotelCategory || 'Comfort', name: 'Suggested Hotel', options: ['Budget: well-reviewed local stay', 'Comfort: centrally located 4-star option', 'Premium: boutique or 5-star option'], mealPlan: input.meals || 'Breakfast included' },
      activities: ['Local sightseeing', 'Regional food experience', 'Photography and leisure time'], optional: ['Spa or café time', 'Guided activity based on availability'],
    }
  })
  const people = input.adults + input.children
  const total = input.budget || 'Approx. ₹' + (people * input.days * 4500).toLocaleString('en-IN')
  return {
    trip: { ...input, duration: `${input.days} days / ${input.days - 1} nights`, nights: input.days - 1 },
    title: `${input.origin} to ${input.destination}`,
    summary: `A professionally paced ${input.days}-day journey for ${input.adults} adults${input.children ? ` and ${input.children} children` : ''}, balancing signature sights, local experiences, transfers, and free time.`,
    route: [input.origin, ...places, input.destination], days,
    hotels: places.map((city, index) => ({ city, nights: index === 0 ? Math.max(1, input.days - 2) : 1, options: ['Suggested Hotel | Budget | Area convenient for the route', 'Suggested Hotel | Comfort | Central location', 'Suggested Hotel | Premium | Best available experience'] })),
    transportPlan: [{ route: `${input.origin} → ${input.destination}`, mode: input.transport || 'Private AC cab / flight where practical', distance: 'Approx. distance varies by route', duration: 'Approx. travel time depends on traffic and connections', cost: 'Estimated on request' }],
    cost: { hotels: 'Estimated based on selected category', transport: 'Estimated based on vehicle and route', activities: 'Approx. ₹5,000 onwards', meals: 'Approx. ₹1,000 per person/day', miscellaneous: 'Approx. ₹2,000', total, perPerson: 'Estimated total divided by travellers' },
    packageOptions: [{ name: 'BUDGET', details: '3-star suggested hotels with practical shared or local transfers.' }, { name: 'COMFORT', details: '4-star suggested hotels, private AC vehicle, and curated experiences.' }, { name: 'PREMIUM', details: '5-star or boutique stays, premium transfers, and upgraded dining experiences.' }],
    inclusions: ['Accommodation as selected', 'Daily itinerary and route planning', 'Local sightseeing suggestions', 'Travel support during planning'], exclusions: ['Flights or trains unless specifically added', 'Personal expenses and shopping', 'Travel insurance', 'Entry fees not listed in the final quote'],
    tips: ['Keep 15-20 minutes of buffer around every transfer.', 'Confirm hotel availability and cancellation terms before payment.', 'Carry government ID, medicines, and a light day bag.', 'Prices are estimates and should be reconfirmed before booking.'], importantNotes: ['Hotels are suggestions only; no room is booked or guaranteed.', 'Travel times are approximate and depend on traffic, weather, and route.', input.requirements || 'No special requirements added.'], packing: ['Comfortable walking shoes', 'Weather-appropriate layers', 'Sun protection and reusable water bottle'], emergency: ['The Himalayan Travels', 'Phone / WhatsApp: +91 85059 83792', 'GST: 02GCYPK3256A1ZN'],
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input: ItineraryRequest = {
      origin: clean(body.origin), destination: clean(body.destination), startDate: clean(body.startDate), endDate: clean(body.endDate), days: Math.min(Math.max(Number(body.days) || 5, 3), 15),
      adults: Math.max(Number(body.adults) || 2, 1), children: Math.max(Number(body.children) || 0, 0), travellerType: clean(body.travellerType, 'Couple'), budget: clean(body.budget), hotelCategory: clean(body.hotelCategory, 'Comfort'), transport: clean(body.transport), meals: clean(body.meals, 'Breakfast and dinner'), tripType: clean(body.tripType, 'Leisure'), requirements: clean(body.requirements),
    }
    if (!input.origin || !input.destination) return NextResponse.json({ error: 'Please enter both a starting city and destination.' }, { status: 400 })
    if (!process.env.OPENAI_API_KEY) return NextResponse.json(fallbackItinerary(input))

    const schemaPrompt = `Return only valid JSON matching this exact structure: {"trip":{"origin":"","destination":"","startDate":"","endDate":"","duration":"","nights":0,"adults":0,"children":0,"travellerType":"","budget":"","hotelCategory":"","transport":"","meals":"","tripType":"","requirements":""},"title":"","summary":"","route":[],"days":[{"day":1,"date":"","title":"","location":"","summary":"","morning":[],"afternoon":[],"evening":[],"night":[],"distance":"","travelTime":"","transport":"","departure":"","meals":[],"hotel":{"city":"","category":"","name":"Suggested Hotel","options":[],"mealPlan":""},"activities":[],"optional":[]}],"hotels":[{"city":"","nights":0,"options":[]}],"transportPlan":[{"route":"","mode":"","distance":"","duration":"","cost":""}],"cost":{"hotels":"","transport":"","activities":"","meals":"","miscellaneous":"","total":"","perPerson":""},"packageOptions":[{"name":"BUDGET","details":""},{"name":"COMFORT","details":""},{"name":"PREMIUM","details":""}],"inclusions":[],"exclusions":[],"tips":[],"importantNotes":[],"packing":[],"emergency":[]}. Create a realistic sales-ready Indian travel agency itinerary. Use approximate language for unverified prices and label hotels Suggested Hotel.`
    const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.65, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: `You are an expert Indian travel planner, itinerary architect, tour operator, and travel-document designer for The Himalayan Travels. ${schemaPrompt}` }, { role: 'user', content: JSON.stringify(input) }] }) })
    if (!response.ok) return NextResponse.json(fallbackItinerary(input))
    const completion = await response.json()
    const parsed = JSON.parse(completion.choices?.[0]?.message?.content || '') as StructuredItinerary
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Could not create the itinerary. Please try again.' }, { status: 500 })
  }
}
