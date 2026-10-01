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

function parseDate(dateString: string | undefined): Date | null {
  if (!dateString) return null
  const parsed = new Date(dateString)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function addDays(date: Date, days: number) {
  const clone = new Date(date)
  clone.setDate(clone.getDate() + days)
  return clone
}

function formatDateForDisplay(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function calculateTripDates(input: ItineraryRequest) {
  const start = parseDate(input.startDate)
  const end = parseDate(input.endDate)

  if (start && end) {
    const diff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
    const days = Math.max(1, diff)
    const dates = Array.from({ length: days }, (_, index) => formatDateForDisplay(addDays(start, index)))
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      days,
      nights: Math.max(0, days - 1),
      dates,
    }
  }

  const fallbackDays = Math.max(3, Math.min(input.days || 5, 15))
  const base = start ?? new Date()
  const dates = Array.from({ length: fallbackDays }, (_, index) => formatDateForDisplay(addDays(base, index)))
  return {
    startDate: base.toISOString().slice(0, 10),
    endDate: addDays(base, fallbackDays - 1).toISOString().slice(0, 10),
    days: fallbackDays,
    nights: Math.max(0, fallbackDays - 1),
    dates,
  }
}

function routeFromDestination(destination: string, origin: string) {
  const cleanedDestination = destination.toLowerCase()
  if (cleanedDestination.includes('nainital') && cleanedDestination.includes('mussoorie')) {
    return {
      route: [origin || 'Delhi', 'Nainital', 'Mussoorie', origin || 'Delhi'],
      overnightCities: ['Nainital', 'Mussoorie'],
      cityNights: {'Nainital': 2, 'Mussoorie': 2},
    }
  }
  if (cleanedDestination.includes('nainital')) {
    return {
      route: [origin || 'Delhi', 'Nainital', origin || 'Delhi'],
      overnightCities: ['Nainital'],
      cityNights: {'Nainital': 1},
    }
  }
  if (cleanedDestination.includes('mussoorie')) {
    return {
      route: [origin || 'Delhi', 'Mussoorie', origin || 'Delhi'],
      overnightCities: ['Mussoorie'],
      cityNights: {'Mussoorie': 1},
    }
  }
  return {
    route: [origin || 'Delhi', destination, origin || 'Delhi'],
    overnightCities: [destination],
    cityNights: { [destination]: 1 },
  }
}

function getNainitalMussooriePlan(input: ItineraryRequest, tripDates: { dates: string[]; days: number; nights: number }) {
  const route = routeFromDestination(input.destination, input.origin)
  const cityNights = Object.assign(Object.create(null), route.cityNights) as Record<string, number>
  if (input.destination.toLowerCase().includes('nainital') && input.destination.toLowerCase().includes('mussoorie')) {
    cityNights.Nainital = tripDates.days >= 6 ? 3 : 2
    cityNights.Mussoorie = Math.max(0, tripDates.nights - cityNights.Nainital)
  }
  const hotelCities = Object.entries(cityNights)
  const nightlyHotelList = hotelCities.map(([city, nights]) => ({ city, nights, options: [
    `${city} • Suggested Hotel • Central, easy access to the route`,
    `${city} • Suggested Hotel • Family-friendly / couple-friendly stay`,
    `${city} • Suggested Hotel • Premium boutique or elevated property`,
  ] }))

  const summary = `This ${tripDates.days}-day itinerary is designed for a practical journey from ${input.origin || 'Delhi'} to ${input.destination}. The route moves in a logical order, groups nearby attractions, keeps travel times realistic, and leaves free time for meals, rest and shopping.`

  const baseDays: Record<number, any> = {
    3: [
      { title: 'Delhi → Nainital', location: 'Nainital', summary: 'A morning departure from Delhi leads to a relaxed arrival in Nainital, followed by a lakeside evening in the hill town.', morning: ['07:00 AM – Depart from Delhi', '09:30 AM – Breakfast stop on the highway'], afternoon: ['01:00 PM – Arrival in Nainital', '02:00 PM – Hotel check-in and rest'], evening: ['04:30 PM – Walk around Naini Lake', '07:00 PM – Mall Road dinner and local shopping'], night: ['Overnight stay in Nainital'], distance: 'Approx. 300 km', travelTime: '7–9 hours', transport: 'Private AC cab', departure: '07:00 AM', meals: ['Breakfast stop', 'Lunch on arrival', 'Dinner in Nainital'], hotelCity: 'Nainital', hotelName: 'Suggested Hotel', hotelOptions: ['Central Nainital stay', 'Lake-facing option', 'Comfort stay near Mall Road'], dayLabel: 'Day 01' },
      { title: 'Nainital local exploration', location: 'Nainital', summary: 'The day is focused on Nainital’s classic viewpoints, lakefront and local market without rushing between distant points.', morning: ['08:30 AM – Naina Devi Temple visit', '10:00 AM – Naini Lake walk'], afternoon: ['12:00 PM – Lunch near Mall Road', '02:00 PM – Snow View Point or cable car ride'], evening: ['05:30 PM – Eco Cave Gardens and the Flatts', '07:00 PM – Sunset dinner by the lake'], night: ['Overnight stay in Nainital'], distance: 'Local sightseeing', travelTime: '4–5 hours', transport: 'Local cab / personal vehicle', departure: '08:30 AM', meals: ['Breakfast at hotel', 'Lunch in Mall Road area', 'Dinner by Naini Lake'], hotelCity: 'Nainital', hotelName: 'Suggested Hotel', hotelOptions: ['Mall Road location', 'Quiet hotel near the lake', 'Comfort stay with valley views'], dayLabel: 'Day 02' },
      { title: 'Nainital → Mussoorie', location: 'Mussoorie', summary: 'After a relaxed breakfast, the journey continues via a scenic hill transfer to Mussoorie, where the evening is kept light and atmospheric.', morning: ['08:00 AM – Breakfast and checkout', '09:00 AM – Drive from Nainital toward Mussoorie'], afternoon: ['01:00 PM – Arrival in Mussoorie', '02:00 PM – Hotel check-in and rest'], evening: ['05:00 PM – Mall Road stroll', '07:00 PM – Sunset viewpoint and dinner'], night: ['Overnight stay in Mussoorie'], distance: 'Approx. 220 km', travelTime: '6–8 hours', transport: 'Private AC cab', departure: '09:00 AM', meals: ['Breakfast in Nainital', 'Lunch stop en route', 'Dinner in Mussoorie'], hotelCity: 'Mussoorie', hotelName: 'Suggested Hotel', hotelOptions: ['Mall Road hotel', 'Landour access stay', 'Comfort property with hillside views'], dayLabel: 'Day 03' },
    ],
    4: [
      { title: 'Delhi → Nainital', location: 'Nainital', summary: 'Arrival into Nainital begins with a scenic road transfer and a gentle evening around the lake and local market.', morning: ['07:00 AM – Depart from Delhi', '09:30 AM – Breakfast stop'], afternoon: ['01:00 PM – Check-in and lunch', '02:30 PM – Rest and settle in'], evening: ['04:30 PM – Naini Lake boating', '06:30 PM – Mall Road shopping and dinner'], night: ['Overnight stay in Nainital'], distance: 'Approx. 300 km', travelTime: '7–9 hours', transport: 'Private AC cab', departure: '07:00 AM', meals: ['Breakfast stop', 'Late lunch', 'Dinner in Nainital'], hotelCity: 'Nainital', hotelName: 'Suggested Hotel', hotelOptions: ['Central Nainital stay', 'Lake-facing room', 'Quiet family property'], dayLabel: 'Day 01' },
      { title: 'Nainital local circuit', location: 'Nainital', summary: 'A full Nainital day with viewpoints, lake areas and a comfortable evening by the market.', morning: ['08:30 AM – Naini Lake and temple route', '10:00 AM – Snow View Point'], afternoon: ['12:30 PM – Lunch after viewpoints', '02:00 PM – Eco Cave Gardens and The Flatts'], evening: ['05:30 PM – Tibetan Market and Mall Road', '07:30 PM – Dinner by the lake'], night: ['Overnight stay in Nainital'], distance: 'Local sightseeing', travelTime: '5–6 hours', transport: 'Local cab / private vehicle', departure: '08:30 AM', meals: ['Breakfast at hotel', 'Lunch near Mall Road', 'Dinner in Nainital'], hotelCity: 'Nainital', hotelName: 'Suggested Hotel', hotelOptions: ['Lakefront money-saving option', 'Comfort hotel close to Mall Road', 'Premium boutique stay'], dayLabel: 'Day 02' },
      { title: 'Nainital → Mussoorie', location: 'Mussoorie', summary: 'The hill transfer to Mussoorie is planned in a relaxed way so arrival and check-in happens before the evening walk.', morning: ['08:00 AM – Breakfast and checkout', '09:00 AM – Drive to Mussoorie'], afternoon: ['01:00 PM – Arrival and lunch', '02:30 PM – Hotel check-in and rest'], evening: ['05:00 PM – Mall Road walk', '07:00 PM – Sunset view and dinner'], night: ['Overnight stay in Mussoorie'], distance: 'Approx. 220 km', travelTime: '6–8 hours', transport: 'Private AC cab', departure: '09:00 AM', meals: ['Breakfast in Nainital', 'Lunch stop en route', 'Dinner in Mussoorie'], hotelCity: 'Mussoorie', hotelName: 'Suggested Hotel', hotelOptions: ['Mall Road hotel', 'Hillside property', 'Premium stay near Gun Hill'], dayLabel: 'Day 03' },
      { title: 'Mussoorie & Landour', location: 'Mussoorie', summary: 'This is a classic Mussoorie day with viewpoints, waterfall stop and a relaxed old-town experience.', morning: ['08:30 AM – Kempty Falls', '10:30 AM – Company Garden / local viewpoint'], afternoon: ['12:30 PM – Lunch in Mussoorie', '02:00 PM – Landour and local heritage walk'], evening: ['05:30 PM – George Everest or Lal Tibba viewpoint', '07:30 PM – Dinner on Mall Road'], night: ['Overnight stay in Mussoorie'], distance: 'Local sightseeing', travelTime: '5–6 hours', transport: 'Local cab / private transfer', departure: '08:30 AM', meals: ['Breakfast at hotel', 'Lunch in Mussoorie', 'Dinner at the hotel or Mall Road'], hotelCity: 'Mussoorie', hotelName: 'Suggested Hotel', hotelOptions: ['Mall Road boutique stay', 'Quiet hillside stay', 'Comfort property with valley view'], dayLabel: 'Day 04' },
    ],
    5: [
      { title: 'Delhi → Nainital', location: 'Nainital', summary: 'The trip begins with a comfortable road transfer from Delhi to Nainital, leading into a relaxed local evening around the lake.', morning: ['07:00 AM – Departure from Delhi', '09:30 AM – Breakfast break en route'], afternoon: ['01:00 PM – Arrival and hotel check-in', '02:30 PM – Lunch and rest'], evening: ['04:30 PM – Naini Lake walk', '06:30 PM – Mall Road and dinner'], night: ['Overnight stay in Nainital'], distance: 'Approx. 300 km', travelTime: '7–9 hours', transport: 'Private AC cab', departure: '07:00 AM', meals: ['Breakfast stop', 'Lunch on arrival', 'Dinner near Mall Road'], hotelCity: 'Nainital', hotelName: 'Suggested Hotel', hotelOptions: ['Central Nainital hotel', 'Lake-view stay', 'Comfort stay near Mall Road'], dayLabel: 'Day 01' },
      { title: 'Nainital scenic day', location: 'Nainital', summary: 'The day is built around the hill town’s classic lookouts and lakefront, leaving plenty of time for sightseeing without tiring the group.', morning: ['08:30 AM – Naina Devi Temple', '10:00 AM – Snow View Point'], afternoon: ['12:30 PM – Lunch and local market walk', '02:00 PM – Eco Cave Gardens and The Flatts'], evening: ['05:30 PM – Naini Lake sunset', '07:00 PM – Dinner on Mall Road'], night: ['Overnight stay in Nainital'], distance: 'Local sightseeing', travelTime: '5–6 hours', transport: 'Local cab / private car', departure: '08:30 AM', meals: ['Breakfast at hotel', 'Lunch near Mall Road', 'Dinner by the lake'], hotelCity: 'Nainital', hotelName: 'Suggested Hotel', hotelOptions: ['Quiet hotel near lake', 'Mall Road convenience', 'Comfort stay with mountain views'], dayLabel: 'Day 02' },
      { title: 'Nainital → Mussoorie', location: 'Mussoorie', summary: 'A scenic transfer from Nainital to Mussoorie gives the trip a natural flow, with the afternoon kept light for check-in and a walk around the town.', morning: ['08:00 AM – Breakfast and checkout', '09:00 AM – Drive toward Mussoorie'], afternoon: ['01:00 PM – Arrival and hotel check-in', '02:30 PM – Rest or lunch'], evening: ['05:00 PM – Mall Road stroll', '07:00 PM – Dinner with a hill-town evening vibe'], night: ['Overnight stay in Mussoorie'], distance: 'Approx. 220 km', travelTime: '6–8 hours', transport: 'Private AC cab', departure: '09:00 AM', meals: ['Breakfast in Nainital', 'Lunch stop en route', 'Dinner in Mussoorie'], hotelCity: 'Mussoorie', hotelName: 'Suggested Hotel', hotelOptions: ['Main market hotel', 'Hillside property', 'Comfort boutique stay'], dayLabel: 'Day 03' },
      { title: 'Mussoorie highlights', location: 'Mussoorie', summary: 'This is the best day to cover Mussoorie’s classic viewpoints, waterfall and old-style hill station charm without overpacking the schedule.', morning: ['08:30 AM – Kempty Falls', '10:30 AM – Company Garden'], afternoon: ['12:30 PM – Lunch in Mussoorie', '02:00 PM – Lal Tibba and Landour'], evening: ['05:30 PM – Gun Hill or George Everest viewpoint', '07:30 PM – Dinner on Mall Road'], night: ['Overnight stay in Mussoorie'], distance: 'Local sightseeing', travelTime: '5–6 hours', transport: 'Local cab / private vehicle', departure: '08:30 AM', meals: ['Breakfast at hotel', 'Lunch in Mussoorie', 'Dinner near Mall Road'], hotelCity: 'Mussoorie', hotelName: 'Suggested Hotel', hotelOptions: ['Mall Road stay', 'Quiet colonial-era property', 'Premium boutique option'], dayLabel: 'Day 04' },
      { title: 'Mussoorie → Delhi', location: 'Delhi', summary: 'The final day is kept easy and comfortable, allowing time for a morning view before the return drive to Delhi.', morning: ['08:00 AM – Breakfast and checkout', '09:00 AM – Final short sightseeing if time allows'], afternoon: ['11:30 AM – Depart from Mussoorie', '02:30 PM – Lunch break on the way'], evening: ['06:00 PM – Reach Delhi', 'Evening at home or onward transfer'], night: ['Trip ends in Delhi'], distance: 'Approx. 300 km', travelTime: '7–9 hours', transport: 'Private AC cab', departure: '09:00 AM', meals: ['Breakfast in Mussoorie', 'Lunch break en route', 'Evening arrival meal'], hotelCity: 'Delhi', hotelName: 'Trip end', hotelOptions: ['No hotel stay needed', 'Optional city hotel on request'], dayLabel: 'Day 05' },
    ],
    7: [
      { title: 'Delhi → Nainital', location: 'Nainital', summary: 'A well-paced road transfer makes the journey comfortable and sets up a relaxed lakeside arrival in Nainital.', morning: ['07:00 AM – Depart from Delhi', '09:30 AM – Highway breakfast stop'], afternoon: ['01:00 PM – Arrive and check-in', '02:00 PM – Rest and lunch'], evening: ['04:30 PM – Naini Lake and Mall Road', '07:00 PM – Dinner by the lake'], night: ['Overnight stay in Nainital'], distance: 'Approx. 300 km', travelTime: '7–9 hours', transport: 'Private AC cab', departure: '07:00 AM', meals: ['Breakfast stop', 'Lunch on arrival', 'Dinner in Nainital'], hotelCity: 'Nainital', hotelName: 'Suggested Hotel', hotelOptions: ['Central lake stay', 'Mall Road property', 'Comfort boutique hotel'], dayLabel: 'Day 01' },
      { title: 'Nainital viewpoints', location: 'Nainital', summary: 'The second day covers Nainital’s classic viewpoints and lakefront spots without rushing between distant attractions.', morning: ['08:30 AM – Naina Devi Temple', '10:00 AM – Snow View Point'], afternoon: ['12:30 PM – Lunch near Mall Road', '02:00 PM – Eco Cave Gardens'], evening: ['05:30 PM – The Flatts and Tibetan Market', '07:00 PM – Sunset dinner'], night: ['Overnight stay in Nainital'], distance: 'Local sightseeing', travelTime: '5–6 hours', transport: 'Local cab / private vehicle', departure: '08:30 AM', meals: ['Breakfast at hotel', 'Lunch in town', 'Dinner by Naini Lake'], hotelCity: 'Nainital', hotelName: 'Suggested Hotel', hotelOptions: ['Mall Road convenience', 'Lakefront stay', 'Premium quiet stay'], dayLabel: 'Day 02' },
      { title: 'Bhimtal & Sattal extension', location: 'Nainital', summary: 'This is an easy outing around nearby lakes and forest areas, ideal for a gentler day before the Mussoorie transfer.', morning: ['08:30 AM – Drive to Bhimtal', '10:00 AM – Bhimtal Lake and island viewpoint'], afternoon: ['12:30 PM – Lunch by the lake', '02:00 PM – Sattal and forest loop'], evening: ['05:30 PM – Return to Nainital', '07:00 PM – Dinner and rest'], night: ['Overnight stay in Nainital'], distance: 'Approx. 35–50 km', travelTime: '5–6 hours', transport: 'Private cab', departure: '08:30 AM', meals: ['Breakfast at hotel', 'Lunch in Bhimtal', 'Dinner in Nainital'], hotelCity: 'Nainital', hotelName: 'Suggested Hotel', hotelOptions: ['Comfort stay', 'Quiet hotel', 'Lakefront hotel'], dayLabel: 'Day 03' },
      { title: 'Nainital → Mussoorie', location: 'Mussoorie', summary: 'A scenic transfer leads to Mussoorie where the afternoon remains easy, letting the group settle in before the evening walk.', morning: ['08:00 AM – Breakfast and checkout', '09:00 AM – Drive toward Mussoorie'], afternoon: ['01:00 PM – Arrival and hotel check-in', '02:30 PM – Lunch and rest'], evening: ['05:00 PM – Mall Road & sunset stroll', '07:00 PM – Dinner and relaxation'], night: ['Overnight stay in Mussoorie'], distance: 'Approx. 220 km', travelTime: '6–8 hours', transport: 'Private AC cab', departure: '09:00 AM', meals: ['Breakfast in Nainital', 'Lunch stop en route', 'Dinner in Mussoorie'], hotelCity: 'Mussoorie', hotelName: 'Suggested Hotel', hotelOptions: ['Market location hotel', 'Hillside premium room', 'Family-friendly bungalow'], dayLabel: 'Day 04' },
      { title: 'Mussoorie local sightseeing', location: 'Mussoorie', summary: 'The fifth day is planned around the heart of Mussoorie’s scenic spots, complete with viewpoints, a waterfall and a relaxed evening.', morning: ['08:30 AM – Kempty Falls', '10:30 AM – Company Garden'], afternoon: ['12:30 PM – Lunch and short shopping break', '02:00 PM – Lal Tibba or George Everest'], evening: ['05:30 PM – Gun Hill viewpoint', '07:30 PM – Dinner on Mall Road'], night: ['Overnight stay in Mussoorie'], distance: 'Local sightseeing', travelTime: '5–6 hours', transport: 'Local cab / private car', departure: '08:30 AM', meals: ['Breakfast at hotel', 'Lunch in Mussoorie', 'Dinner near Mall Road'], hotelCity: 'Mussoorie', hotelName: 'Suggested Hotel', hotelOptions: ['Hill-facing room', 'Mall Road boutique', 'Premium stay with view'], dayLabel: 'Day 05' },
      { title: 'Landour and heritage walk', location: 'Mussoorie', summary: 'A slower day through Landour adds a quieter, more refined hill-station experience without overloading the schedule.', morning: ['08:30 AM – Landour church and lanes', '10:00 AM – Scenic lookout drive'], afternoon: ['12:30 PM – Lunch in Landour', '02:00 PM – Relaxed café and rest time'], evening: ['05:30 PM – Mall Road or sunset point', '07:00 PM – Final dinner in Mussoorie'], night: ['Overnight stay in Mussoorie'], distance: 'Local sightseeing', travelTime: '4–5 hours', transport: 'Local cab / personal car', departure: '08:30 AM', meals: ['Breakfast at hotel', 'Lunch in Landour', 'Dinner in Mussoorie'], hotelCity: 'Mussoorie', hotelName: 'Suggested Hotel', hotelOptions: ['Cottage stay', 'Quiet hillside property', 'Comfort hotel in town'], dayLabel: 'Day 06' },
      { title: 'Mussoorie → Delhi', location: 'Delhi', summary: 'The final journey back is handled smoothly with a lunch stop and relaxed return to Delhi in the evening.', morning: ['08:00 AM – Breakfast and checkout', '09:00 AM – Final Mussoorie view and last-minute shopping'], afternoon: ['11:30 AM – Depart for Delhi', '02:30 PM – Lunch break'], evening: ['06:00 PM – Reach Delhi', 'Trip concludes successfully'], night: ['Trip ends'], distance: 'Approx. 300 km', travelTime: '7–9 hours', transport: 'Private AC cab', departure: '09:00 AM', meals: ['Breakfast in Mussoorie', 'Lunch stop en route', 'Evening arrival meal'], hotelCity: 'Delhi', hotelName: 'Trip end', hotelOptions: ['No hotel stay needed', 'Optional city accommodation'], dayLabel: 'Day 07' },
    ],
  }

  const dayPlan = tripDates.days === 6
    ? baseDays[7].filter((day: any) => day.dayLabel !== 'Day 06')
    : baseDays[tripDates.days] || baseDays[5]
  const days = dayPlan.map((day: any, index: number) => {
    const dateText = tripDates.dates[index] || `Day ${index + 1}`
    return {
      day: index + 1,
      date: dateText,
      title: day.title,
      location: day.location,
      summary: day.summary,
      morning: day.morning,
      afternoon: day.afternoon,
      evening: day.evening,
      night: day.night,
      distance: day.distance,
      travelTime: day.travelTime,
      transport: day.transport,
      departure: day.departure,
      meals: day.meals,
      hotel: {
        city: day.hotelCity,
        category: input.hotelCategory || 'Comfort',
        name: day.hotelName,
        options: day.hotelOptions,
        mealPlan: input.meals || 'Breakfast included',
      },
      activities: [...day.morning, ...day.afternoon, ...day.evening],
      optional: ['Free time for shopping or rest', 'Optional add-on based on weather and energy'],
    }
  })

  const lowerDestination = input.destination.toLowerCase()
  const hotelDisplay = lowerDestination.includes('nainital') && lowerDestination.includes('mussoorie')
    ? [
        { city: 'Nainital', nights: cityNights.Nainital, options: ['Suggested Hotel • Comfort stay near Mall Road', 'Suggested Hotel • Lake-facing stay', 'Suggested Hotel • Premium boutique stay'] },
        { city: 'Mussoorie', nights: cityNights.Mussoorie, options: ['Suggested Hotel • Hillside property', 'Suggested Hotel • Mall Road hotel', 'Suggested Hotel • Premium mountain view stay'] },
      ]
    : nightlyHotelList

  const totalBudget = input.budget || `Approx. ₹${(input.adults * tripDates.days * 4200 + input.children * 1500).toLocaleString('en-IN')}`

  return {
    trip: {
      ...input,
      duration: `${tripDates.days} Days / ${tripDates.nights} Nights`,
      nights: tripDates.nights,
      startDate: tripDates.dates[0] || input.startDate || '',
      endDate: tripDates.dates[tripDates.dates.length - 1] || input.endDate || '',
    },
    title: `${input.destination} Itinerary`,
    summary,
    route: route.route,
    days,
    hotels: hotelDisplay,
    transportPlan: [
      { route: `${input.origin || 'Delhi'} → Nainital`, mode: input.transport || 'Private AC cab', distance: 'Approx. 300 km', duration: '7–9 hours', cost: 'Estimated on request' },
      { route: 'Nainital → Mussoorie', mode: input.transport || 'Private AC cab', distance: 'Approx. 220 km', duration: '6–8 hours', cost: 'Estimated on request' },
      { route: 'Mussoorie → Delhi', mode: input.transport || 'Private AC cab', distance: 'Approx. 300 km', duration: '7–9 hours', cost: 'Estimated on request' },
    ],
    cost: {
      hotels: `Approx. ₹${(input.adults * tripDates.nights * 3200 + input.children * 1500).toLocaleString('en-IN')}`,
      transport: `Approx. ₹${(input.adults * tripDates.days * 1700).toLocaleString('en-IN')}`,
      activities: `Approx. ₹${(input.adults * tripDates.days * 1200).toLocaleString('en-IN')}`,
      meals: `Approx. ₹${(input.adults * tripDates.days * 1500).toLocaleString('en-IN')}`,
      miscellaneous: `Approx. ₹${(input.adults * tripDates.days * 1000).toLocaleString('en-IN')}`,
      total: totalBudget,
      perPerson: `Approx. ₹${Math.round((Number(totalBudget.replace(/[^\d]/g, '')) / Math.max(1, input.adults + input.children || 1))).toLocaleString('en-IN')}`,
    },
    packageOptions: [
      { name: 'BUDGET', details: 'Economy hotels, practical transfers, and a strong sightseeing focus.' },
      { name: 'COMFORT', details: 'Central family-friendly stays, private cab transfers and curated sightseeing.' },
      { name: 'PREMIUM', details: 'Boutique properties, premium hill-station stays and upgraded dining/transfer experience.' },
    ],
    inclusions: ['Suggested hotel stay as per route', 'Day-by-day itinerary with timings', 'Private cab planning for major transfers', 'Cultural, scenic and market stops', 'Customer-friendly route planning'],
    exclusions: ['Flights or train tickets', 'Entry fees to attractions unless mentioned', 'Shopping, personal purchases and tips', 'Travel insurance and emergency assistance'],
    tips: ['Keep early starts for scenic drives, especially in hill routes.', 'Check road and weather updates before departure.', 'Carry warm layers for evenings.', 'Book popular hotels early during weekends and holiday periods.'],
    importantNotes: [
      'Hotels shown here are suggested options and are not guaranteed confirmed bookings.',
      'Travel times are approximate and can vary by traffic, weather and route conditions.',
      input.requirements ? `Special requirement noted: ${input.requirements}` : 'No special requirement recorded.',
    ],
    packing: ['Warm clothing', 'Comfortable walking shoes', 'Sunglasses and sunscreen', 'Power bank and medical essentials'],
    emergency: ['The Himalayan Travels', 'Phone / WhatsApp: +91 85059 83792', 'GST: 02GCYPK3256A1ZN'],
  }
}

function getNainitalCircuitPlan(input: ItineraryRequest, tripDates: { dates: string[]; days: number; nights: number }) {
  const origin = input.origin || 'Delhi'
  const schedule = [
    {
      title: `${origin} to Nainital`, location: 'Nainital', summary: `Drive from ${origin} to Nainital, check in, then keep the first evening gentle with a lakeside walk and Mall Road.`,
      morning: [`05:30 AM – Depart from ${origin}`, 'Breakfast stop on the highway'], afternoon: ['Arrive in Nainital and check in', 'Lunch and time to rest after the drive'], evening: ['Walk beside Naini Lake', 'Explore Mall Road and have dinner nearby'], night: ['Overnight stay in Nainital'],
      distance: 'Approx. 300 km from Delhi', travelTime: '7–9 hours from Delhi', hotelCity: 'Nainital',
    },
    {
      title: 'Nainital lake, temple and viewpoints', location: 'Nainital', summary: 'Stay within Nainital for a full sightseeing day: visit the lake and Naina Devi Temple, then choose Snow View and Cave Garden before an easy market evening.',
      morning: ['Visit Naina Devi Temple and the Naini Lake promenade', 'Take a boat ride on Naini Lake, subject to weather and availability'], afternoon: ['Lunch in town', 'Visit Snow View Point; continue to Eco Cave Gardens if time permits'], evening: ['Browse The Flatts and Tibetan Market', 'Dinner near Mall Road'], night: ['Overnight stay in Nainital'],
      distance: 'Local Nainital circuit', travelTime: '4–6 hours of local sightseeing', hotelCity: 'Nainital',
    },
    {
      title: 'Bhimtal, Sattal and Naukuchiatal lake circuit', location: 'Bhimtal · Sattal · Naukuchiatal', summary: 'Make a dedicated day trip through the quieter lake district: Bhimtal first, the forest-framed Sattal lakes next, then Naukuchiatal before returning to Nainital.',
      morning: ['Drive to Bhimtal Lake and walk along the shore', 'Continue to Sattal for the forest and interconnected lakes'], afternoon: ['Lunch around Bhimtal', 'Visit Naukuchiatal and its lakeside viewpoint'], evening: ['Return to Nainital before dusk', 'Dinner and overnight stay in Nainital'], night: ['Overnight stay in Nainital'],
      distance: 'Approx. 45–60 km round trip', travelTime: '4–6 hours including stops', hotelCity: 'Nainital',
    },
    {
      title: 'Kainchi Dham and onward to Mukteshwar', location: 'Kainchi Dham · Mukteshwar', summary: 'Check out and visit Kainchi Dham on the way toward Mukteshwar. Keep the temple visit flexible for traffic and queues; settle into the quieter mountain setting by evening.',
      morning: ['Check out after breakfast and drive toward Kainchi Dham', 'Allow time for the temple visit and local traffic'], afternoon: ['Lunch around Bhowali or en route', 'Continue to Mukteshwar and check in'], evening: ['Enjoy the Himalayan views from the stay or a nearby lookout', 'Quiet dinner in Mukteshwar'], night: ['Overnight stay in Mukteshwar'],
      distance: 'Approx. 55–70 km', travelTime: '3–5 hours plus temple stop', hotelCity: 'Mukteshwar',
    },
    {
      title: 'Mukteshwar viewpoints and orchard country', location: 'Mukteshwar', summary: 'Use the day for Mukteshwar’s own landscape rather than another long transfer: visit the temple and viewpoints, with time for a relaxed meal and local orchard stops.',
      morning: ['Visit Mukteshwar Dham and the surrounding ridge', 'Walk to a safe, accessible viewpoint for clear-weather Himalayan views'], afternoon: ['Lunch in Mukteshwar', 'Explore nearby village roads and seasonal orchards'], evening: ['Return to the stay before dark', 'Unhurried final evening in Mukteshwar'], night: ['Overnight stay in Mukteshwar'],
      distance: 'Local Mukteshwar circuit', travelTime: '3–5 hours including walks', hotelCity: 'Mukteshwar',
    },
    {
      title: 'Mukteshwar to Ranikhet', location: 'Almora · Ranikhet', summary: 'Travel west through the Kumaon hills toward Ranikhet, breaking the transfer around Almora and arriving with time for a short town visit.',
      morning: ['Check out and drive toward Almora', 'Take a short tea and viewpoint break en route'], afternoon: ['Lunch around Almora', 'Continue to Ranikhet and check in'], evening: ['Visit the Ranikhet Mall and nearby town viewpoints', 'Dinner and overnight stay in Ranikhet'], night: ['Overnight stay in Ranikhet'],
      distance: 'Approx. 100–120 km', travelTime: '4–6 hours with breaks', hotelCity: 'Ranikhet',
    },
    {
      title: 'Ranikhet and return to Delhi', location: 'Ranikhet · Delhi', summary: 'Enjoy an early Ranikhet stop, then begin the long return drive. Confirm attraction access and road conditions before departure.',
      morning: ['Early visit to Jhula Devi Temple or a nearby Ranikhet viewpoint', 'Check out and start the return drive'], afternoon: ['Lunch break en route', `Continue toward ${origin}`], evening: [`Arrive in ${origin}; trip concludes`, 'Arrival time depends on traffic and road conditions'], night: ['Trip concludes; no overnight stay included'],
      distance: 'Approx. 350–380 km to Delhi', travelTime: '8–10 hours to Delhi', hotelCity: '',
    },
  ]

  const returnDay = (from: string, distance: string, travelTime: string) => ({
    title: `${from} to ${origin}: return journey`,
    location: `${from} · ${origin}`,
    summary: `Check out after breakfast and begin the return drive from ${from} to ${origin}. Keep meal and rest stops flexible for hill-road and traffic conditions.`,
    morning: [`Check out from ${from} after breakfast`, `Start the drive toward ${origin}`],
    afternoon: ['Lunch and rest break en route', 'Continue the return drive'],
    evening: [`Arrive in ${origin}; trip concludes`, 'Arrival time depends on traffic and road conditions'],
    night: ['Trip concludes; no overnight stay included'],
    distance,
    travelTime,
    hotelCity: '',
  })

  if (tripDates.days === 3) schedule[2] = returnDay('Nainital', 'Approx. 300 km to Delhi', '7–9 hours to Delhi')
  if (tripDates.days === 4) schedule[3] = returnDay('Nainital', 'Approx. 300 km to Delhi', '7–9 hours to Delhi')
  if (tripDates.days === 5) {
    schedule[3] = {
      title: 'Kainchi Dham and Bhowali day trip', location: 'Kainchi Dham · Bhowali · Nainital', summary: 'Visit Kainchi Dham from Nainital, allowing time for queues and road traffic, then return via Bhowali. This keeps the overnight base in Nainital and avoids an overnight transfer with no sightseeing time.',
      morning: ['Depart Nainital after breakfast for Kainchi Dham', 'Allow flexible time for the temple visit and queues'], afternoon: ['Lunch around Bhowali', 'Browse local fruit stalls when in season and return toward Nainital'], evening: ['Arrive back in Nainital before dusk', 'Dinner and overnight stay in Nainital'], night: ['Overnight stay in Nainital'],
      distance: 'Approx. 45–60 km round trip', travelTime: '3–5 hours plus temple stop', hotelCity: 'Nainital',
    }
    schedule[4] = returnDay('Nainital', 'Approx. 300 km to Delhi', '7–9 hours to Delhi')
  }
  if (tripDates.days === 6) schedule[5] = returnDay('Mukteshwar', 'Approx. 330–360 km to Delhi', '9–11 hours to Delhi')

  const selectedDays = schedule.slice(0, Math.min(tripDates.days, schedule.length))
  while (selectedDays.length < tripDates.days) {
    const extensionDay = selectedDays.length + 1
    selectedDays.push({
      title: `Unhurried Kumaon day ${extensionDay - 7}`,
      location: 'Kumaon',
      summary: 'Keep this additional day flexible for a rest morning, weather-dependent walks, and places missed earlier; avoid adding a long transfer without confirming the stay location.',
      morning: ['Slow breakfast at the current stay', 'Choose a short walk based on weather and local advice'],
      afternoon: ['Lunch near the stay', 'Free time for rest or a nearby stop'],
      evening: ['Return before dusk', 'Dinner at the stay'],
      night: ['Overnight at the current stay'],
      distance: 'Short local outing',
      travelTime: '1–3 hours locally',
      hotelCity: selectedDays[selectedDays.length - 1]?.hotelCity || 'Kumaon',
    })
  }

  const days: Day[] = selectedDays.map((plan, index) => {
    const hotelCity = plan.hotelCity || origin
    const isLastDay = index === selectedDays.length - 1
    return {
      day: index + 1,
      date: tripDates.dates[index] || `Day ${index + 1}`,
      title: plan.title,
      location: plan.location,
      summary: plan.summary,
      morning: plan.morning,
      afternoon: plan.afternoon,
      evening: plan.evening,
      night: plan.night,
      distance: plan.distance,
      travelTime: plan.travelTime,
      transport: input.transport || 'Private vehicle; local shared options where suitable',
      departure: index === 0 ? '05:30 AM' : '08:00 AM',
      meals: [input.meals || 'Breakfast and dinner', 'Lunch at a local restaurant or en route'],
      hotel: {
        city: hotelCity,
        category: input.hotelCategory || 'Comfort',
        name: isLastDay ? 'Trip ends' : 'Suggested Hotel',
        options: isLastDay ? [] : [`${hotelCity} • central stay`, `${hotelCity} • quiet view stay`],
        mealPlan: input.meals || 'Breakfast and dinner',
      },
      activities: [...plan.morning, ...plan.afternoon, ...plan.evening],
      optional: [],
    }
  })

  const overnightNights = days.slice(0, -1).reduce<Record<string, number>>((counts, day) => {
    if (day.hotel.city && day.night.some((item) => item.toLowerCase().includes('overnight stay'))) {
      counts[day.hotel.city] = (counts[day.hotel.city] || 0) + 1
    }
    return counts
  }, {})

  const totalBudget = input.budget || `Approx. ₹${(input.adults * tripDates.days * 3800 + input.children * 1400).toLocaleString('en-IN')}`

  return {
    trip: {
      ...input,
      duration: `${tripDates.days} Days / ${tripDates.nights} Nights`,
      nights: tripDates.nights,
      startDate: tripDates.dates[0] || input.startDate || '',
      endDate: tripDates.dates[tripDates.dates.length - 1] || input.endDate || '',
    },
    title: `Nainital${tripDates.days >= 4 ? ' & Kumaon Lakes' : ''} • ${tripDates.days} Day Itinerary`,
    summary: `A ${tripDates.days}-day Kumaon route with Nainital sightseeing first${tripDates.days >= 4 ? ', the Bhimtal–Sattal–Naukuchiatal lake circuit, and additional hill destinations only when the trip length allows' : ''}. Drive times are estimates and stops can be adjusted for weather, traffic and temple access.`,
    route: [origin, 'Nainital', ...(tripDates.days >= 4 ? ['Bhimtal', 'Sattal', 'Naukuchiatal'] : []), ...(tripDates.days >= 5 ? ['Kainchi Dham'] : []), ...(tripDates.days >= 6 ? ['Mukteshwar'] : []), ...(tripDates.days >= 7 ? ['Ranikhet'] : []), origin],
    days,
    hotels: Object.entries(overnightNights).map(([city, nights]) => ({ city, nights, options: [`${city} • central stay`, `${city} • quiet view stay`] })),
    transportPlan: [{ route: [origin, 'Nainital', ...(tripDates.days >= 4 ? ['Bhimtal', 'Sattal', 'Naukuchiatal'] : []), ...(tripDates.days >= 5 ? ['Kainchi Dham'] : []), ...(tripDates.days >= 6 ? ['Mukteshwar'] : []), ...(tripDates.days >= 7 ? ['Ranikhet'] : []), origin].join(' → '), mode: input.transport || 'Private vehicle', distance: 'Route distance varies by selected stops', duration: 'Allow for hill-road conditions and stop time', cost: 'Estimated on request' }],
    cost: {
      hotels: `Approx. ₹${(input.adults * tripDates.nights * 3200 + input.children * 1400).toLocaleString('en-IN')}`,
      transport: `Approx. ₹${(input.adults * tripDates.days * 1700).toLocaleString('en-IN')}`,
      activities: `Approx. ₹${(input.adults * tripDates.days * 900).toLocaleString('en-IN')}`,
      meals: `Approx. ₹${(input.adults * tripDates.days * 1300).toLocaleString('en-IN')}`,
      miscellaneous: `Approx. ₹${(input.adults * tripDates.days * 700).toLocaleString('en-IN')}`,
      total: totalBudget,
      perPerson: `Approx. ₹${Math.round(Number(totalBudget.replace(/[^\d]/g, '')) / Math.max(1, input.adults + input.children)).toLocaleString('en-IN')}`,
    },
    packageOptions: [
      { name: 'BUDGET', details: 'Practical stays and local transfers; entrance fees extra.' },
      { name: 'COMFORT', details: 'Comfort-category stays and private transfers between towns.' },
      { name: 'PREMIUM', details: 'Higher-category stays, subject to availability.' },
    ],
    inclusions: ['Day-by-day route plan', 'Suggested accommodation areas', 'Local sightseeing sequence'],
    exclusions: ['Flights or train tickets', 'Entry fees and boating charges', 'Personal shopping and meals not specified', 'Travel insurance'],
    tips: ['Reserve extra time for hill roads and weekend traffic.', 'Check Kainchi Dham access and local advisories before setting out.', 'Visit viewpoints in clear weather and avoid unfamiliar trails after dark.'],
    importantNotes: ['Suggested hotels are not confirmed bookings.', 'Distances and drive times are approximate and vary with traffic, weather and road conditions.', input.requirements ? `Special requirement: ${input.requirements}` : 'No special requirements provided.'],
    packing: ['Comfortable walking shoes', 'Weather-appropriate layers', 'Sun protection and personal medication'],
    emergency: ['The Himalayan Travels', 'Phone / WhatsApp: +91 98765 43210', 'GST: 02GCYPK3256A1ZN'],
  }
}

function buildDestinationSpecificPlan(input: ItineraryRequest, tripDates: { dates: string[]; days: number; nights: number }) {
  const destinationLower = input.destination.toLowerCase()
  const origin = input.origin || 'Delhi'

  if (destinationLower.includes('nainital') && destinationLower.includes('mussoorie')) {
    return getNainitalMussooriePlan(input, tripDates)
  }
  if (destinationLower.includes('nainital')) {
    return getNainitalCircuitPlan(input, tripDates)
  }

  const defaultCity = destinationLower.includes('goa') ? 'Goa' : destinationLower.includes('manali') ? 'Manali' : destinationLower.includes('kashmir') || destinationLower.includes('srinagar') ? 'Srinagar' : destinationLower.includes('jaipur') ? 'Jaipur' : destinationLower.includes('kerala') ? 'Kerala' : destinationLower.includes('shimla') ? 'Shimla' : destinationLower.includes('mussoorie') ? 'Mussoorie' : destinationLower.includes('nainital') ? 'Nainital' : destinationLower.includes('rishikesh') || destinationLower.includes('haridwar') ? 'Rishikesh' : input.destination

  const routeStops: Record<string, string[]> = {
    nainital: ['Naini Lake', 'Snow View Point', 'Eco Cave Gardens', 'Mall Road', 'Bhimtal', 'Sattal', 'Mukteshwar'],
    mussoorie: ['Mall Road', 'Kempty Falls', 'Company Garden', 'Lal Tibba', 'Landour', 'Gun Hill', 'George Everest'],
    goa: ['Candolim Beach', 'Baga Beach', 'Fort Aguada', 'Palolem Beach', 'Old Goa', 'Anjuna', 'Vagator'],
    manali: ['Mall Road', 'Solang Valley', 'Old Manali', 'Hidimba Temple', 'Kasol', 'Manikaran', 'Rohtang'],
    kashmir: ['Dal Lake', 'Nishat Bagh', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Lal Chowk', 'Shankaracharya Temple'],
    jaipur: ['Hawa Mahal', 'Amer Fort', 'City Palace', 'Jantar Mantar', 'Nahargarh Fort', 'Johri Bazaar'],
    kerala: ['Munnar', 'Alleppey', 'Fort Kochi', 'Thekkady', 'Houseboat', 'Mattancherry', 'Tea gardens'],
    shimla: ['Mall Road', 'Jakhoo Temple', 'Kufri', 'The Ridge', 'Christ Church', 'Green Valley'],
    rishikesh: ['Laxman Jhula', 'Triveni Ghat', 'Ram Jhula', 'Neelkanth Mahadev', 'Byasi', 'Rajaji National Park'],
  }

  const basePlaces = routeStops[defaultCity.toLowerCase()] || routeStops[defaultCity] || [input.destination, 'Local market', 'Scenic viewpoint']
  const places = [...new Set(basePlaces)]

  const dayPlan = Array.from({ length: tripDates.days }, (_, index) => {
    const place = places[index % places.length]
    const nextPlace = places[(index + 1) % places.length]
    const titleMap = [
      `Arrival in ${defaultCity}`,
      `${defaultCity} Highlights`,
      `${places[2]} and ${places[3]}`,
      `${places[4]} excursion`,
      `${defaultCity} leisure & departure`,
    ]

    const title = titleMap[index % titleMap.length] || `${defaultCity} day ${index + 1}`
    const location = index === 0 ? defaultCity : defaultCity
    const summary = index === 0
      ? `Reach ${defaultCity} and settle in before exploring the city’s signature lakefront or market lanes in the evening.`
      : index === tripDates.days - 1
        ? `Use the final day for a gentle ${defaultCity} experience before a comfortable return journey to ${origin}.`
        : `Spend the day focused on ${place} and nearby experiences, keeping the route practical and the timing relaxed.`

    const morning = index === 0
      ? [`07:00 AM – Depart from ${origin}`, `09:30 AM – Breakfast stop on the route`]
      : [`08:00 AM – Breakfast in ${defaultCity}`, `09:00 AM – Start for ${place}`]

    const afternoon = index === 0
      ? [`01:00 PM – Arrival & hotel check-in`, `02:30 PM – Lunch and rest`]
      : [`12:00 PM – Lunch near ${place}`, `02:00 PM – Continue with ${nextPlace} or a nearby attraction`]

    const evening = index === 0
      ? [`04:30 PM – Walk around ${places[0]}`, `07:00 PM – Dinner and overnight stay`]
      : [`05:00 PM – Explore ${place} surroundings`, `07:00 PM – Dinner in ${defaultCity}`]

    const night = index === tripDates.days - 1
      ? ['Check-out or final rest before departure', 'Trip concludes for the day']
      : ['Return to hotel', `Overnight stay in ${defaultCity}`]

    return {
      day: index + 1,
      date: tripDates.dates[index] || `Day ${index + 1}`,
      title,
      location,
      summary,
      morning,
      afternoon,
      evening,
      night,
      distance: index === 0 ? `Approx. ${input.destination.includes('Goa') ? '400-500' : '200-300'} km` : `${place} local circuit`,
      travelTime: index === 0 ? '7–9 hours' : '3–5 hours',
      transport: input.transport || 'Private AC cab',
      departure: index === 0 ? '07:00 AM' : '09:00 AM',
      meals: [index === 0 ? 'Breakfast stop en route' : 'Breakfast at hotel', 'Lunch local', 'Dinner in town'],
      hotel: {
        city: defaultCity,
        category: input.hotelCategory || 'Comfort',
        name: 'Suggested Hotel',
        options: ['Suggested Hotel • Central location', 'Suggested Hotel • Comfort property', 'Suggested Hotel • Premium stay'],
        mealPlan: input.meals || 'Breakfast and dinner',
      },
      activities: [...morning, ...afternoon, ...evening],
      optional: ['Free time for rest or shopping', 'Optional local experience based on energy'],
    }
  })

  const totalBudget = input.budget || `Approx. ₹${(input.adults * tripDates.days * 3500 + input.children * 1200).toLocaleString('en-IN')}`

  return {
    trip: {
      ...input,
      duration: `${tripDates.days} Days / ${tripDates.nights} Nights`,
      nights: tripDates.nights,
      startDate: tripDates.dates[0] || input.startDate || '',
      endDate: tripDates.dates[tripDates.dates.length - 1] || input.endDate || '',
    },
    title: `${defaultCity} • ${tripDates.days} Day Itinerary`,
    summary: `This ${tripDates.days}-day route is designed to match ${defaultCity} with logical movement, unique daily focus and practical timing.`,
    route: [origin, defaultCity, origin],
    days: dayPlan,
    hotels: [{ city: defaultCity, nights: tripDates.nights, options: ['Suggested Hotel • Central location', 'Suggested Hotel • Comfort property', 'Suggested Hotel • Premium stay'] }],
    transportPlan: [{ route: `${origin} → ${defaultCity}`, mode: input.transport || 'Private AC cab', distance: 'Approx. route distance', duration: 'Approx. travel time', cost: 'Estimated on request' }],
    cost: {
      hotels: `Approx. ₹${(input.adults * tripDates.nights * 3000 + input.children * 1000).toLocaleString('en-IN')}`,
      transport: `Approx. ₹${(input.adults * tripDates.days * 1500).toLocaleString('en-IN')}`,
      activities: `Approx. ₹${(input.adults * tripDates.days * 1200).toLocaleString('en-IN')}`,
      meals: `Approx. ₹${(input.adults * tripDates.days * 1500).toLocaleString('en-IN')}`,
      miscellaneous: `Approx. ₹${(input.adults * tripDates.days * 700).toLocaleString('en-IN')}`,
      total: totalBudget,
      perPerson: `Approx. ₹${Math.round((Number(totalBudget.replace(/[^\d]/g, '')) / Math.max(1, input.adults + input.children || 1))).toLocaleString('en-IN')}`,
    },
    packageOptions: [
      { name: 'BUDGET', details: 'Value-focused stay and local sightseeing route.' },
      { name: 'COMFORT', details: 'Central hotels with practical private transfers.' },
      { name: 'PREMIUM', details: 'Boutique and elevated property options.' },
    ],
    inclusions: ['Suggested hotel stay as per route', 'Day-by-day itinerary with timings', 'Local sightseeing logic', 'Route guidance', 'Travel support'],
    exclusions: ['Flights or train tickets', 'Personal shopping', 'Entry fees', 'Insurance'],
    tips: ['Leave buffer time around transfers.', 'Carry weather-appropriate layers.', 'Book key hotel nights early.'],
    importantNotes: ['Hotels shown are suggested options only.', 'Travel times are approximate.', input.requirements ? `Special requirement: ${input.requirements}` : 'No special requirement noted.'],
    packing: ['Comfortable shoes', 'Sunglasses', 'Water bottle', 'Warm layer'],
    emergency: ['The Himalayan Travels', 'Phone / WhatsApp: +91 85059 83792', 'GST: 02GCYPK3256A1ZN'],
  }
}

function validatePlan(plan: StructuredItinerary) {
  const dayTitles = plan.days.map((day) => day.title)
  const uniqueTitles = new Set(dayTitles)
  const hasGeneric = dayTitles.some((title) => /breakfast|travel toward|arrival and hotel check-in|local sightseeing|overnight stay/i.test(title) && dayTitles.filter((item) => item === title).length > 1)
  return uniqueTitles.size === dayTitles.length && !hasGeneric
}

function fallbackItinerary(input: ItineraryRequest): StructuredItinerary {
  const tripDates = calculateTripDates(input)
  const normalizedInput = {
    ...input,
    days: tripDates.days,
    startDate: tripDates.startDate,
    endDate: tripDates.endDate,
  }

  const destinationLower = normalizedInput.destination.toLowerCase()
  const plan = buildDestinationSpecificPlan(normalizedInput, tripDates)
  if (validatePlan(plan)) return plan

  const fallbackPlan = getNainitalMussooriePlan(normalizedInput, tripDates)
  if (validatePlan(fallbackPlan)) return fallbackPlan

  return {
    trip: {
      ...normalizedInput,
      duration: `${tripDates.days} Days / ${tripDates.nights} Nights`,
      nights: tripDates.nights,
    },
    title: `${normalizedInput.destination} Itinerary`,
    summary: `A practical ${tripDates.days}-day itinerary planned for ${normalizedInput.adults} adults and ${normalizedInput.children} children with realistic route flow and destination-aware timing.`,
    route: [normalizedInput.origin || 'Delhi', normalizedInput.destination, normalizedInput.origin || 'Delhi'],
    days: Array.from({ length: tripDates.days }, (_, index) => ({
      day: index + 1,
      date: tripDates.dates[index] || `Day ${index + 1}`,
      title: `${index === 0 ? 'Arrival in' : index === tripDates.days - 1 ? 'Departure from' : 'Exploring'} ${normalizedInput.destination}`,
      location: normalizedInput.destination,
      summary: `Spend this day focused on ${normalizedInput.destination} with a realistic route, local sights and enough time for meals and rest.`,
      morning: [`08:00 AM – Breakfast in ${normalizedInput.destination}`, `09:00 AM – Start the day with ${normalizedInput.destination} highlights`],
      afternoon: ['12:30 PM – Lunch and local break', '02:00 PM – Visit key sightseeing area'],
      evening: ['05:00 PM – Explore nearby attractions', '07:00 PM – Dinner and overnight stay'],
      night: ['Return to the hotel', 'Overnight stay in the destination'],
      distance: 'Approx. local route distance',
      travelTime: '3–5 hours',
      transport: normalizedInput.transport || 'Private AC cab',
      departure: '09:00 AM',
      meals: ['Breakfast at hotel', 'Lunch local', 'Dinner in town'],
      hotel: {
        city: normalizedInput.destination,
        category: normalizedInput.hotelCategory || 'Comfort',
        name: 'Suggested Hotel',
        options: ['Suggested Hotel • Central location', 'Suggested Hotel • Comfort stay', 'Suggested Hotel • Premium option'],
        mealPlan: normalizedInput.meals || 'Breakfast included',
      },
      activities: ['Key sightseeing', 'Local food stop', 'Evening walk'],
      optional: ['Free time for shopping or rest'],
    })),
    hotels: [{ city: normalizedInput.destination, nights: tripDates.nights, options: ['Suggested Hotel • Central location', 'Suggested Hotel • Comfort property', 'Suggested Hotel • Premium stay'] }],
    transportPlan: [{ route: `${normalizedInput.origin || 'Delhi'} → ${normalizedInput.destination}`, mode: normalizedInput.transport || 'Private AC cab', distance: 'Approx. route distance', duration: 'Approx. travel time', cost: 'Estimated on request' }],
    cost: {
      hotels: 'Estimated based on category',
      transport: 'Estimated based on route and vehicle',
      activities: 'Estimated based on selected sightseeing',
      meals: 'Estimated per person',
      miscellaneous: 'Estimated extra spend',
      total: normalizedInput.budget || 'Estimated total on request',
      perPerson: 'Estimated per person',
    },
    packageOptions: [
      { name: 'BUDGET', details: 'Route-focused itinerary with practical city stays.' },
      { name: 'COMFORT', details: 'Balanced stays and smoother transfers.' },
      { name: 'PREMIUM', details: 'Premium hotels and elevated local experiences.' },
    ],
    inclusions: ['Daily itinerary', 'Route planning', 'Suggested accommodation', 'Local sightseeing notes'],
    exclusions: ['Flights or train tickets', 'Personal shopping', 'Entry fees', 'Insurance'],
    tips: ['Plan early starts for scenic drives.', 'Keep buffer time around transfers.'],
    importantNotes: ['Hotels are suggestions only.', 'Travel times are approximate.'],
    packing: ['Weather-appropriate layers', 'Comfortable shoes', 'Water bottle'],
    emergency: ['The Himalayan Travels', 'Phone / WhatsApp: +91 85059 83792', 'GST: 02GCYPK3256A1ZN'],
  }
}

function normalizeDestinationText(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\bki\b|\bse\b|\bfrom\b|\bto\b|\btrip\b|\bitinerary\b/gi, ' ')
    .replace(/\s*[,\-&+]+\s*/g, ' + ')
    .replace(/\s+/g, ' ')
    .trim()
}

function suggestDurationFromDestination(destination: string) {
  const normalized = destination.toLowerCase()
  if (normalized.includes('nainital') && normalized.includes('mussoorie')) return 5
  if (normalized.includes('nainital')) return 3
  if (normalized.includes('mussoorie')) return 4
  if (normalized.includes('goa')) return 4
  if (normalized.includes('manali')) return 4
  if (normalized.includes('kashmir') || normalized.includes('leh') || normalized.includes('shimla')) return 5
  return 4
}

function parseSmartTripPrompt(rawPrompt: string) {
  const prompt = (rawPrompt || '').trim()
  if (!prompt) return {}

  const lower = prompt.toLowerCase()
  const monthMap: Record<string, string> = {
    jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03', apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07', july: '07', aug: '08', august: '08', sep: '09', sept: '09', september: '09', oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12',
  }

  const toIsoDate = (day: string, monthName: string, year?: string) => {
    const month = monthMap[monthName.toLowerCase()]
    if (!month) return ''
    const yearValue = year || new Date().getFullYear()
    return `${Number(yearValue)}-${month}-${String(day).padStart(2, '0')}`
  }

  const dateMatches = [...prompt.matchAll(/(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/gi)]

  const dates = dateMatches
    .map((match) => toIsoDate(match[1], match[2], match[3]))
    .filter(Boolean)

  const daysMatch = prompt.match(/(\d+)\s*(?:days?|day)/i)
  const tripDays = daysMatch ? Math.max(3, Math.min(Number(daysMatch[1]), 15)) : undefined

  const placeNames = [
    'naukuchiatal', 'kainchi dham', 'nainital', 'mussoorie', 'bhimtal', 'mukteshwar', 'ranikhet',
    'dalhousie', 'rishikesh', 'haridwar', 'srinagar', 'kashmir', 'manali', 'shimla', 'jaipur',
    'kerala', 'goa', 'leh', 'delhi', 'mumbai', 'agra', 'sattal', 'almora', 'bhowali',
  ]
  const canonicalNames: Record<string, string> = {
    naukuchiatal: 'Naukuchiatal', 'kainchi dham': 'Kainchi Dham', nainital: 'Nainital', mussoorie: 'Mussoorie',
    bhimtal: 'Bhimtal', mukteshwar: 'Mukteshwar', ranikhet: 'Ranikhet', dalhousie: 'Dalhousie',
    rishikesh: 'Rishikesh', haridwar: 'Haridwar', srinagar: 'Srinagar', kashmir: 'Kashmir',
    manali: 'Manali', shimla: 'Shimla', jaipur: 'Jaipur', kerala: 'Kerala', goa: 'Goa', leh: 'Leh',
    delhi: 'Delhi', mumbai: 'Mumbai', agra: 'Agra', sattal: 'Sattal', almora: 'Almora', bhowali: 'Bhowali',
  }
  const placeMatches = placeNames.flatMap((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return [...prompt.matchAll(new RegExp(`\\b${escaped}\\b`, 'gi'))].map((match) => ({
      name: canonicalNames[name],
      index: match.index || 0,
    }))
  }).sort((left, right) => left.index - right.index)

  const hindiOrigin = prompt.match(/^\s*([A-Za-z][A-Za-z\s.-]*?)\s+se\s+/i)?.[1]?.trim() || ''
  const englishOrigin = prompt.match(/\bfrom\s+([A-Za-z][A-Za-z\s.-]*?)(?=\s+to\b|\s+for\b|$)/i)?.[1]?.trim() || ''
  const origin = hindiOrigin || englishOrigin || ''
  const distinctPlaces = [...new Map(placeMatches.map((place) => [place.name.toLowerCase(), place.name])).values()]
  const destinationPlaces = distinctPlaces.filter((place) => place.toLowerCase() !== origin.toLowerCase())
  let destination = destinationPlaces.join(' + ')

  if (!destination) {
    const stripped = prompt
      .replace(/\d{1,2}(?:st|nd|rd|th)?\s*(?:of\s+)?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)(?:\s+\d{4})?/gi, ' ')
      .replace(/\b\d+\s*days?\b/gi, ' ')
      .replace(/\b(?:from|to|se|aur|and|for|couple|family|friends|group|trip|itinerary|travel|tour|vacation|destination|origin)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    destination = normalizeDestinationText(stripped.replace(new RegExp(`^${origin}\\s*`, 'i'), ''))
  }

  let travellerType = 'Couple'
  if (/solo|single/i.test(prompt)) travellerType = 'Solo'
  if (/family|with family|famil/i.test(prompt)) travellerType = 'Family'
  if (/friends|group/i.test(prompt)) travellerType = 'Friends'
  if (/couple|honeymoon|love/i.test(prompt)) travellerType = 'Couple'

  let adults = 2
  if (/solo|single/i.test(prompt)) adults = 1
  if (/family|group|friends/i.test(prompt)) adults = 2
  if (/\b(\d+)\s+people\b|\b(\d+)\s+travellers?\b/i.test(prompt)) {
    const peopleMatch = prompt.match(/\b(\d+)\s+people\b|\b(\d+)\s+travellers?\b/i)
    if (peopleMatch) adults = Math.max(1, Number(peopleMatch[1] || peopleMatch[2]))
  }

  const result: Record<string, string | number> = {
    origin: origin || 'Delhi',
    destination: destination || 'Nainital',
    days: String(tripDays || suggestDurationFromDestination(destination || 'Nainital')),
    adults: String(adults),
    children: '0',
    travellerType,
  }

  if (dates.length >= 2) {
    result.startDate = dates[0]
    result.endDate = dates[1]
    result.days = String(Math.max(1, Math.round((new Date(dates[1]).getTime() - new Date(dates[0]).getTime()) / 86400000) + 1))
  }

  if (dates.length === 1) {
    result.startDate = dates[0]
  }

  if (!tripDays) {
    result.days = String(suggestDurationFromDestination(String(result.destination || 'Nainital')))
  }

  return result
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsedPrompt = parseSmartTripPrompt(clean(body.tripPrompt) || clean(body.prompt) || clean(body.rawText) || `${clean(body.origin)} ${clean(body.destination)}`)

    const input: ItineraryRequest = {
      origin: clean(body.origin) || clean(parsedPrompt.origin, 'Delhi'),
      destination: clean(body.destination) || clean(parsedPrompt.destination, 'Nainital'),
      startDate: clean(body.startDate) || clean(parsedPrompt.startDate),
      endDate: clean(body.endDate) || clean(parsedPrompt.endDate),
      days: Math.min(Math.max(Number(body.days) || Number(parsedPrompt.days) || 5, 3), 15),
      adults: Math.max(Number(body.adults) || Number(parsedPrompt.adults) || 2, 1),
      children: Math.max(Number(body.children) || Number(parsedPrompt.children) || 0, 0),
      travellerType: clean(body.travellerType, clean(parsedPrompt.travellerType, 'Couple')),
      budget: clean(body.budget),
      hotelCategory: clean(body.hotelCategory, 'Comfort'),
      transport: clean(body.transport),
      meals: clean(body.meals, 'Breakfast and dinner'),
      tripType: clean(body.tripType, 'Leisure'),
      requirements: clean(body.requirements),
    }

    if (!input.origin || !input.destination) {
      return NextResponse.json({ error: 'Please enter both a starting city and destination.' }, { status: 400 })
    }

    const tripDates = calculateTripDates(input)
    if (input.startDate && input.endDate) {
      input.days = tripDates.days
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY
    const openAiKey = process.env.OPENAI_API_KEY
    const apiKey = openRouterKey || openAiKey
    const fallbackResult = fallbackItinerary(input)

    if (input.destination.toLowerCase().includes('nainital')) {
      return NextResponse.json(fallbackResult)
    }

    if (!apiKey) {
      return NextResponse.json(fallbackResult)
    }

    const schemaPrompt = `Return only valid JSON matching this exact structure: {"trip":{"origin":"","destination":"","startDate":"","endDate":"","duration":"","nights":0,"adults":0,"children":0,"travellerType":"","budget":"","hotelCategory":"","transport":"","meals":"","tripType":"","requirements":""},"title":"","summary":"","route":[],"days":[{"day":1,"date":"","title":"","location":"","summary":"","morning":[],"afternoon":[],"evening":[],"night":[],"distance":"","travelTime":"","transport":"","departure":"","meals":[],"hotel":{"city":"","category":"","name":"Suggested Hotel","options":[],"mealPlan":""},"activities":[],"optional":[]}],"hotels":[{"city":"","nights":0,"options":[]}],"transportPlan":[{"route":"","mode":"","distance":"","duration":"","cost":""}],"cost":{"hotels":"","transport":"","activities":"","meals":"","miscellaneous":"","total":"","perPerson":""},"packageOptions":[{"name":"BUDGET","details":""},{"name":"COMFORT","details":""},{"name":"PREMIUM","details":""}],"inclusions":[],"exclusions":[],"tips":[],"importantNotes":[],"packing":[],"emergency":[]}. The final result must behave like a professional travel agency planner. Dates matter. If startDate and endDate are provided, use them as the source of truth and calculate the correct number of days before generating the itinerary. Do not invent wrong dates. Use day headings that respect the travel dates. Every day must have a realistic overnight city, place list and route logic. Keep the same trip structure across categories. Use approximate language when prices are unconfirmed.`

    const isOpenRouter = Boolean(openRouterKey)
    const response = await fetch(isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(isOpenRouter ? { 'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', 'X-Title': 'The Himalayan Travels Itinerary Planner' } : {}),
      },
      body: JSON.stringify({
        model: isOpenRouter ? (process.env.OPENROUTER_MODEL || 'openrouter/free') : (process.env.OPENAI_MODEL || 'gpt-4o-mini'),
        temperature: 0.65,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `You are an expert Indian travel planner and itinerary architect for The Himalayan Travels. ${schemaPrompt}` },
          { role: 'user', content: JSON.stringify({ ...input, startDate: tripDates.startDate, endDate: tripDates.endDate, days: tripDates.days }) },
        ],
      }),
    })

    if (!response.ok) {
      return NextResponse.json(fallbackResult)
    }

    const completion = await response.json()
    const parsed = JSON.parse(completion.choices?.[0]?.message?.content || '') as StructuredItinerary

    if (!parsed || !Array.isArray(parsed.days) || parsed.days.length === 0) {
      return NextResponse.json(fallbackResult)
    }

    return NextResponse.json({
      ...parsed,
      trip: {
        ...parsed.trip,
        startDate: tripDates.startDate,
        endDate: tripDates.endDate,
        duration: `${tripDates.days} Days / ${tripDates.nights} Nights`,
        nights: tripDates.nights,
      },
      days: parsed.days.map((day, index) => ({
        ...day,
        date: day.date || tripDates.dates[index] || `Day ${index + 1}`,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Could not create the itinerary. Please try again.' }, { status: 500 })
  }
}
