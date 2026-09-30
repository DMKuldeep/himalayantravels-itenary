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

function destinationDays(destination: string) {
  const name = destination.toLowerCase()
  if (name.includes('goa')) return [
    ['Arrival in Goa: Panaji and Fontainhas', ['Arrive at Goa Airport and meet the driver', 'Transfer to North Goa hotel and check in'], ['Lunch in Panaji', 'Walk through Fontainhas Latin Quarter'], ['Sunset at Miramar Beach', 'Dinner near Candolim'], ['Overnight in North Goa'], 'Goa Airport → Panaji → North Goa', '1.5-2 hours'],
    ['North Goa forts and beaches', ['Breakfast and depart by 9:00 AM', 'Visit Fort Aguada and Sinquerim Beach'], ['Lunch in Candolim', 'Relax at Calangute Beach'], ['Baga Beach sunset', 'Explore Baga market'], ['Overnight in North Goa'], 'North Goa sightseeing loop', '5-6 hours'],
    ['Anjuna, Vagator and Chapora', ['Breakfast', 'Visit Anjuna Beach and Anjuna Flea Market'], ['Lunch near Vagator', 'Visit Chapora Fort'], ['Sunset at Vagator Beach', 'Café time in Anjuna'], ['Overnight in North Goa'], 'North Goa hotel → Anjuna → Vagator', '5-6 hours'],
    ['Old Goa heritage trail', ['Breakfast and depart for Old Goa', 'Visit Basilica of Bom Jesus'], ['Visit Se Cathedral and Church of St Francis of Assisi', 'Lunch in Panaji'], ['Riverfront walk at Atal Setu / Panaji', 'Transfer to South Goa hotel'], ['Overnight in South Goa'], 'North Goa → Old Goa → South Goa', '3-4 hours'],
    ['South Goa beaches', ['Breakfast', 'Visit Colva Beach and Benaulim Beach'], ['Lunch near Benaulim', 'Relax by the beach'], ['Sunset at Cavelossim Beach', 'Local dinner in South Goa'], ['Overnight in South Goa'], 'South Goa beach circuit', '5-6 hours'],
    ['Palolem and Cabo de Rama', ['Breakfast and drive south', 'Visit Cabo de Rama Fort'], ['Lunch near Palolem', 'Relax at Palolem Beach'], ['Optional boat ride or Butterfly Beach visit', 'Return before dark'], ['Overnight in South Goa'], 'South Goa → Cabo de Rama → Palolem', '6-7 hours'],
    ['Goa departure', ['Breakfast and hotel checkout', 'Transfer to Goa Airport'], ['Departure from Goa'], ['Trip ends'], ['No overnight stay'], 'South Goa → Goa Airport', '1-2 hours'],
  ]
  if (name.includes('manali') || name.includes('kasol')) return [
    ['Delhi to Manali: arrival and Mall Road', ['Depart Delhi by Volvo or private cab', 'Travel towards Manali'], ['Continue the mountain transfer with meal stops'], ['Check in and walk on Mall Road', 'Visit Van Vihar if time permits'], ['Overnight in Manali'], 'Delhi → Manali', '12-14 hours'],
    ['Solang Valley and Atal Tunnel', ['Breakfast and drive to Solang Valley', 'Try optional snow or adventure activities'], ['Lunch near Solang', 'Drive through Atal Tunnel to Sissu if weather permits'], ['Return to Manali', 'Relax at the hotel'], ['Overnight in Manali'], 'Manali → Solang Valley → Sissu → Manali', '6-8 hours'],
    ['Old Manali and local culture', ['Visit Hidimba Devi Temple', 'Walk through Old Manali lanes'], ['Visit Manu Temple', 'Lunch at an Old Manali café'], ['Explore Mall Road market', 'Optional café evening'], ['Overnight in Manali'], 'Manali local sightseeing', '4-5 hours'],
    ['Manali to Kasol via Kullu', ['Checkout after breakfast', 'Drive through Kullu Valley'], ['Visit Kasol market and Parvati River', 'Lunch in Kasol'], ['Walk to Chalal village trail', 'Return to Kasol before dark'], ['Overnight in Kasol'], 'Manali → Kullu → Kasol', '4-5 hours'],
    ['Kasol, Manikaran and hot springs', ['Breakfast', 'Visit Manikaran Sahib Gurudwara'], ['See the hot springs and Parvati Valley', 'Lunch in Manikaran'], ['Return to Kasol', 'Free time at Kasol market'], ['Overnight in Kasol'], 'Kasol → Manikaran → Kasol', '4-5 hours'],
  ]
  if (name.includes('kashmir') || name.includes('srinagar')) return [
    ['Arrival in Srinagar and Dal Lake', ['Arrive at Srinagar Airport', 'Transfer to hotel or houseboat'], ['Check in and lunch', 'Rest after the journey'], ['Shikara ride on Dal Lake', 'Sunset over the lake'], ['Overnight in Srinagar'], 'Srinagar Airport → Dal Lake', '1-2 hours'],
    ['Srinagar gardens and old city', ['Visit Mughal Gardens: Nishat Bagh and Shalimar Bagh'], ['Lunch near Dal Lake', 'Visit Hazratbal Shrine'], ['Explore Srinagar old city market', 'Return to the hotel'], ['Overnight in Srinagar'], 'Srinagar local sightseeing', '5-6 hours'],
    ['Srinagar to Gulmarg', ['Depart after breakfast for Gulmarg', 'Reach Gulmarg and check in'], ['Gondola ride to Kongdoori if tickets and weather allow', 'Lunch in Gulmarg'], ['Walk around Gulmarg meadow', 'Return or stay overnight in Gulmarg'], ['Overnight in Gulmarg'], 'Srinagar → Gulmarg', '2-3 hours each way'],
    ['Pahalgam valley', ['Drive towards Pahalgam after breakfast', 'Stop at Avantipora ruins en route'], ['Visit Betaab Valley and Aru Valley', 'Lunch in Pahalgam'], ['Walk beside Lidder River', 'Leisure evening'], ['Overnight in Pahalgam'], 'Srinagar → Pahalgam', '3-4 hours'],
    ['Pahalgam to Srinagar', ['Breakfast and checkout', 'Return to Srinagar'], ['Lunch on the way', 'Check in and rest'], ['Shopping at Lal Chowk or Polo View Market', 'Final dinner'], ['Overnight in Srinagar'], 'Pahalgam → Srinagar', '3-4 hours'],
  ]
  if (name.includes('nainital')) return [
    ['Nainital arrival and local sightseeing', ['Arrive in Nainital and check in', 'Visit Naina Devi Temple'], ['Lunch near Mall Road', 'Walk beside Naini Lake and explore Mall Road'], ['Boat ride on Naini Lake', 'Sunset at Thandi Road viewpoint'], ['Overnight in Nainital'], 'Nainital hotel → Naini Lake → Mall Road', '3-4 hours'],
    ['Snow View and Nainital viewpoints', ['Breakfast', 'Take the ropeway or drive to Snow View Point'], ['Visit Eco Cave Gardens', 'Lunch near Mallital'], ['Visit The Flatts and Tibetan Market', 'Evening by Naini Lake'], ['Overnight in Nainital'], 'Nainital local sightseeing loop', '5-6 hours'],
    ['Bhimtal, Sattal and Naukuchiatal', ['Breakfast and depart for Bhimtal', 'Visit Bhimtal Lake and aquarium'], ['Lunch near Bhimtal', 'Visit Sattal lakes and forest trails'], ['Visit Naukuchiatal viewpoint', 'Return to Nainital before dark'], ['Overnight in Nainital'], 'Nainital → Bhimtal → Sattal → Naukuchiatal → Nainital', '6-7 hours'],
    ['Mukteshwar day excursion', ['Breakfast and drive to Mukteshwar', 'Visit Mukteshwar Temple'], ['Lunch with Himalayan views', 'Visit Chauli Ki Jali viewpoint'], ['Explore Mukteshwar market', 'Return to Nainital or prepare for departure'], ['Overnight in Nainital'], 'Nainital → Mukteshwar → Nainital', '7-8 hours'],
    ['Nainital departure with final stops', ['Breakfast and checkout', 'Visit Himalayan Botanical Garden'], ['Lunch near Kathgodam or Haldwani', 'Transfer to railway station or airport'], ['Departure'], ['Trip ends'], 'Nainital → Kathgodam / Haldwani', '2-3 hours'],
  ]
  return []
}

function fallbackItinerary(input: ItineraryRequest): StructuredItinerary {
  const specificDays = destinationDays(input.destination)
  const places = specificDays.length ? [...new Set(specificDays.map((day) => String(day[0]).split(':')[0]))] : [input.destination]
  const dayTemplates = specificDays.length ? specificDays : Array.from({ length: input.days }, (_, index) => [`Day ${index + 1}: ${input.destination} sightseeing`, ['Breakfast at the hotel', `Visit ${input.destination} main market and central landmark`], ['Lunch near the main sightseeing area', `Visit ${input.destination} local museum or viewpoint`], [`Sunset at ${input.destination} viewpoint`, 'Free time for shopping or café'], ['Dinner and overnight stay'], `${input.destination} local route`, '4-6 hours'])
  const days = Array.from({ length: input.days }, (_, index) => {
    const template = dayTemplates[index % dayTemplates.length]
    const place = places[index % places.length]
    return {
      day: index + 1,
      date: input.startDate ? `Day ${index + 1}` : '',
      title: String(template[0]),
      location: `${String(template[0]).split(':')[0]}${index === 0 ? ` | ${input.origin} to ${input.destination}` : ''}`,
      summary: `Today you will visit ${String(template[1]).replace(/\[|\]|"/g, '').replace(/,/g, ' → ')}. The route is planned in order so the day is easy to follow.`,
      morning: template[1] as string[], afternoon: template[2] as string[], evening: template[3] as string[], night: template[4] as string[],
      distance: template[5] as string, travelTime: template[6] as string, transport: input.transport || 'Private AC cab / local taxi', departure: '09:00 AM',
      meals: [input.meals || 'Breakfast and dinner suggestions'], hotel: { city: place, category: input.hotelCategory || 'Comfort', name: 'Suggested Hotel', options: ['Budget: well-reviewed local stay', 'Comfort: centrally located 4-star option', 'Premium: boutique or 5-star option'], mealPlan: input.meals || 'Breakfast included' },
      activities: [...(template[1] as string[]), ...(template[2] as string[]), ...(template[3] as string[])], optional: ['Extra café or shopping time', 'Optional activity based on local availability'],
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
    const openRouterKey = process.env.OPENROUTER_API_KEY
    const openAiKey = process.env.OPENAI_API_KEY
    const apiKey = openRouterKey || openAiKey
    if (!apiKey) return NextResponse.json(fallbackItinerary(input))

    const schemaPrompt = `Return only valid JSON matching this exact structure: {"trip":{"origin":"","destination":"","startDate":"","endDate":"","duration":"","nights":0,"adults":0,"children":0,"travellerType":"","budget":"","hotelCategory":"","transport":"","meals":"","tripType":"","requirements":""},"title":"","summary":"","route":[],"days":[{"day":1,"date":"","title":"","location":"","summary":"","morning":[],"afternoon":[],"evening":[],"night":[],"distance":"","travelTime":"","transport":"","departure":"","meals":[],"hotel":{"city":"","category":"","name":"Suggested Hotel","options":[],"mealPlan":""},"activities":[],"optional":[]}],"hotels":[{"city":"","nights":0,"options":[]}],"transportPlan":[{"route":"","mode":"","distance":"","duration":"","cost":""}],"cost":{"hotels":"","transport":"","activities":"","meals":"","miscellaneous":"","total":"","perPerson":""},"packageOptions":[{"name":"BUDGET","details":""},{"name":"COMFORT","details":""},{"name":"PREMIUM","details":""}],"inclusions":[],"exclusions":[],"tips":[],"importantNotes":[],"packing":[],"emergency":[]}. You are responsible for a clear, usable day-by-day travel plan, not a list of generic suggestions. Every day MUST name exact places in the order they should be visited. Morning, afternoon, evening, and night must each contain concrete place names or clearly described transfer/check-in steps. Use maximum 2-3 places per time block, group nearby places together, avoid vague phrases like 'main landmark cluster', 'nearby highlights', 'local experience', or 'explore the area', and state the overnight city. Use approximate language for unverified prices and label hotels Suggested Hotel.`
    const isOpenRouter = Boolean(openRouterKey)
    const response = await fetch(isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(isOpenRouter ? { 'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', 'X-Title': 'The Himalayan Travels Itinerary Planner' } : {}),
      },
      body: JSON.stringify({ model: isOpenRouter ? (process.env.OPENROUTER_MODEL || 'openrouter/free') : (process.env.OPENAI_MODEL || 'gpt-4o-mini'), temperature: 0.65, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: `You are an expert Indian travel planner, itinerary architect, tour operator, and travel-document designer for The Himalayan Travels. ${schemaPrompt}` }, { role: 'user', content: JSON.stringify(input) }] }),
    })
    if (!response.ok) return NextResponse.json(fallbackItinerary(input))
    const completion = await response.json()
    const parsed = JSON.parse(completion.choices?.[0]?.message?.content || '') as StructuredItinerary
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Could not create the itinerary. Please try again.' }, { status: 500 })
  }
}
