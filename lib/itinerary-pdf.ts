import { jsPDF } from 'jspdf'
import { companyContact } from '@/lib/company'

type PdfDay = {
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
  hotel: { city: string; name: string; options: string[] }
}

type PdfItinerary = {
  title: string
  summary: string
  route: string[]
  trip: {
    origin: string
    destination: string
    startDate: string
    endDate: string
    duration: string
    nights: number
    adults: number
    children: number
    travellerType: string
    tripType: string
    transport: string
  }
  days: PdfDay[]
  hotels: { city: string; nights: number; options: string[] }[]
  cost: Record<string, string>
  inclusions: string[]
  exclusions: string[]
  importantNotes: string[]
  tips: string[]
}

const company = companyContact

const palette = {
  ink: [30, 47, 59] as const,
  muted: [91, 105, 113] as const,
  green: [45, 86, 75] as const,
  gold: [184, 137, 61] as const,
  paper: [249, 247, 241] as const,
  line: [220, 224, 220] as const,
  white: [255, 255, 255] as const,
}

type Category = 1 | 2 | 3

export function createItineraryPdf(itinerary: PdfItinerary, category: Category) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  const footerY = pageHeight - 10
  let cursorY = 0

  const setText = (color: readonly number[], size: number, bold = false) => {
    pdf.setTextColor(color[0], color[1], color[2])
    pdf.setFont('helvetica', bold ? 'bold' : 'normal')
    pdf.setFontSize(size)
  }

  const linesFor = (text: string, width = contentWidth, size = 9) => {
    pdf.setFontSize(size)
    return pdf.splitTextToSize(text || 'Not specified', width) as string[]
  }

  const addFooter = () => {
    pdf.setDrawColor(...palette.line)
    pdf.line(margin, footerY - 4, pageWidth - margin, footerY - 4)
    setText(palette.muted, 7)
    pdf.text(company.name, margin, footerY)
    pdf.text(`Page ${pdf.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' })
  }

  const addHeader = (sectionName: string) => {
    setText(palette.green, 9, true)
    pdf.text(company.name, margin, 13)
    setText(palette.ink, 8)
    pdf.text(itinerary.title, pageWidth - margin, 13, { align: 'right', maxWidth: 90 })
    pdf.setDrawColor(...palette.gold)
    pdf.setLineWidth(0.35)
    pdf.line(margin, 17, pageWidth - margin, 17)
    setText(palette.muted, 7, true)
    pdf.text(sectionName.toUpperCase(), margin, 22)
    cursorY = 29
  }

  const addContentPage = (sectionName: string) => {
    pdf.addPage()
    addHeader(sectionName)
  }

  const ensureSpace = (height: number, sectionName = 'Journey details') => {
    if (cursorY + height > footerY - 7) addContentPage(sectionName)
  }

  const drawWrappedText = (text: string, x: number, y: number, width: number, size: number, color: readonly number[], bold = false) => {
    setText(color, size, bold)
    const lines = linesFor(text, width, size)
    const lineHeight = size * 0.42
    pdf.text(lines, x, y, { lineHeightFactor: 1.35, charSpace: 0 })
    return lines.length * lineHeight
  }

  const sectionRows = (day: PdfDay) => [
    ['MORNING', day.morning],
    ['AFTERNOON', day.afternoon],
    ['EVENING', day.evening],
    ['NIGHT', day.night],
  ] as const

  const cardHeight = (day: PdfDay) => {
    const innerWidth = contentWidth - 12
    const titleLines = linesFor(day.title.toUpperCase(), innerWidth, 15).length
    const summaryLines = linesFor(day.summary, innerWidth, 9).length
    let height = 16 + titleLines * 7.15 + 1.5 + summaryLines * 4.3 + 2
    for (const [label, entries] of sectionRows(day)) {
      if (!entries.length) continue
      height += 3.7 + entries.reduce((sum, entry) => sum + linesFor(entry, innerWidth - 2, 8.5).length * 4.35 + 0.6, 0) + 1
    }
    const metadata = [
      `DISTANCE  ${day.distance}`,
      `TRAVEL  ${day.travelTime}`,
      `TRANSPORT  ${day.transport}`,
      `MEALS  ${day.meals.join(', ')}`,
      `OVERNIGHT  ${day.hotel.city || 'Trip ends'}`,
    ]
    height += 4 + metadata.reduce((sum, item) => sum + linesFor(item, innerWidth, 7.5).length * 3.4, 0)
    return Math.max(58, height + 6)
  }

  const drawDayCard = (day: PdfDay) => {
    const height = cardHeight(day)
    ensureSpace(height + 5)
    const x = margin
    const y = cursorY
    pdf.setFillColor(...palette.white)
    pdf.setDrawColor(...palette.line)
    pdf.setLineWidth(0.25)
    pdf.roundedRect(x, y, contentWidth, height, 2, 2, 'FD')
    pdf.setFillColor(...palette.green)
    pdf.roundedRect(x, y, contentWidth, 9, 2, 2, 'F')

    setText(palette.white, 8, true)
    pdf.text(`DAY ${String(day.day).padStart(2, '0')}`, x + 4, y + 6.2)
    setText(palette.white, 7)
    pdf.text(day.date.toUpperCase(), pageWidth - margin - 4, y + 6.2, { align: 'right' })

    let textY = y + 16
    textY += drawWrappedText(day.title.toUpperCase(), x + 6, textY, contentWidth - 12, 15, palette.ink, true) + 1.5
    textY += drawWrappedText(day.summary, x + 6, textY, contentWidth - 12, 9, palette.muted) + 2

    for (const [label, entries] of sectionRows(day)) {
      if (!entries.length) continue
      setText(palette.gold, 7, true)
      pdf.text(label, x + 6, textY)
      textY += 3.7
      for (const entry of entries) {
        const wrapped = linesFor(entry, contentWidth - 16, 8.5)
        setText(palette.ink, 8.5)
        pdf.text(wrapped, x + 7, textY, { lineHeightFactor: 1.3, charSpace: 0 })
        textY += wrapped.length * 3.75 + 0.6
      }
      textY += 1
    }

    const metadata = [
      `DISTANCE  ${day.distance}`,
      `TRAVEL  ${day.travelTime}`,
      `TRANSPORT  ${day.transport}`,
      `MEALS  ${day.meals.join(', ')}`,
      `OVERNIGHT  ${day.hotel.city || 'Trip ends'}`,
    ]
    pdf.setDrawColor(...palette.line)
    pdf.line(x + 6, textY, pageWidth - margin - 6, textY)
    textY += 4
    for (const item of metadata) {
      const wrapped = linesFor(item, contentWidth - 14, 7.5)
      setText(palette.muted, 7.5)
      pdf.text(wrapped, x + 6, textY, { lineHeightFactor: 1.25, charSpace: 0 })
      textY += wrapped.length * 3.4
    }
    cursorY = y + height + 5
  }

  const addBulletSection = (heading: string, items: string[]) => {
    if (!items.length) return
    setText(palette.green, 9, true)
    const headingHeight = 5
    const wrappedItems = items.map((item) => linesFor(item, contentWidth - 7, 8.5))
    const sectionHeight = headingHeight + wrappedItems.reduce((sum, lines) => sum + lines.length * 3.8 + 1.5, 0) + 4
    ensureSpace(sectionHeight, 'Travel information')
    pdf.setDrawColor(...palette.line)
    pdf.line(margin, cursorY, pageWidth - margin, cursorY)
    cursorY += 5
    setText(palette.green, 9, true)
    pdf.text(heading.toUpperCase(), margin, cursorY)
    cursorY += 5
    for (const lines of wrappedItems) {
      setText(palette.ink, 8.5)
      pdf.text('-', margin + 1, cursorY)
      pdf.text(lines, margin + 5, cursorY, { lineHeightFactor: 1.3, charSpace: 0 })
      cursorY += lines.length * 3.8 + 1.5
    }
    cursorY += 2
  }

  const addCover = () => {
    pdf.setFillColor(...palette.paper)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    pdf.setDrawColor(...palette.gold)
    pdf.setLineWidth(0.7)
    pdf.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 3, 3, 'S')
    pdf.setDrawColor(...palette.line)
    pdf.setLineWidth(0.3)
    pdf.line(20, 29, pageWidth - 20, 29)

    setText(palette.green, 12, true)
    pdf.text(company.name, 20, 23)
    setText(palette.muted, 7)
    pdf.text('CURATED JOURNEYS | NORTH INDIA', pageWidth - 20, 23, { align: 'right' })

    pdf.setFillColor(...palette.green)
    pdf.roundedRect(20, 39, 8, 42, 2, 2, 'F')
    setText(palette.gold, 8, true)
    pdf.text('YOUR JOURNEY', 34, 48)
    setText(palette.ink, 27, true)
    const titleLines = linesFor(itinerary.title.replace(/\s*[|•]\s*/g, ' '), 146, 27)
    pdf.text(titleLines.slice(0, 2), 34, 61, { lineHeightFactor: 1.08, charSpace: 0 })

    setText(palette.green, 12, true)
    pdf.text(itinerary.trip.duration.toUpperCase(), 34, 87)
    setText(palette.ink, 10)
    const routeText = itinerary.route.join('  >  ')
    pdf.text(linesFor(routeText, 150, 10).slice(0, 2), 34, 96, { lineHeightFactor: 1.3, charSpace: 0 })

    pdf.setDrawColor(...palette.gold)
    pdf.line(34, 109, pageWidth - 20, 109)
    setText(palette.muted, 7, true)
    pdf.text('A THOUGHTFULLY PLANNED ROUTE', 34, 117)
    setText(palette.ink, 9)
    pdf.text(linesFor(itinerary.summary, 150, 9).slice(0, 5), 34, 125, { lineHeightFactor: 1.4, charSpace: 0 })

    const infoY = 145
    const info = [
      ['TRAVELLERS', `${itinerary.trip.adults} adults${itinerary.trip.children ? `, ${itinerary.trip.children} children` : ''} | ${itinerary.trip.travellerType}`],
      ['TRAVEL STYLE', itinerary.trip.tripType || 'Leisure'],
      ['TRAVEL DATES', itinerary.trip.startDate && itinerary.trip.endDate ? `${itinerary.trip.startDate} to ${itinerary.trip.endDate}` : 'To be decided'],
      ['TRANSPORT', itinerary.trip.transport || 'As selected'],
    ]
    for (const [index, [label, value]] of info.entries()) {
      const col = index % 2
      const row = Math.floor(index / 2)
      const x = 22 + col * 83
      const y = infoY + row * 27
      pdf.setFillColor(...palette.white)
      pdf.roundedRect(x, y, 78, 21, 2, 2, 'F')
      setText(palette.gold, 6.5, true)
      pdf.text(label, x + 4, y + 7)
      setText(palette.ink, 8.5)
      pdf.text(linesFor(value, 69, 8.5).slice(0, 2), x + 4, y + 14, { lineHeightFactor: 1.2, charSpace: 0 })
    }

    pdf.setDrawColor(...palette.line)
    pdf.line(20, 218, pageWidth - 20, 218)
    setText(palette.green, 8, true)
    pdf.text(company.name, 20, 228)
    setText(palette.muted, 8)
    pdf.text(`${company.phone}  |  ${company.email}`, 20, 236)
    pdf.textWithLink(company.website, 20, 244, { url: company.website })
    setText(palette.muted, 7)
    pdf.text('Prepared with care for your journey.', 20, 254)
  }

  addCover()
  addContentPage('Your day-by-day journey')
  setText(palette.muted, 8.5)
  pdf.text(linesFor(`${itinerary.trip.duration} | ${itinerary.trip.nights} nights | ${itinerary.route.join(' > ')}`, contentWidth, 8.5), margin, cursorY)
  cursorY += 6

  for (const day of itinerary.days) drawDayCard(day)

  if (category === 2) {
    addContentPage('Estimated trip cost')
    setText(palette.ink, 16, true)
    pdf.text('COST OVERVIEW', margin, cursorY)
    cursorY += 10
    for (const [label, value] of Object.entries(itinerary.cost)) {
      ensureSpace(14, 'Estimated trip cost')
      pdf.setDrawColor(...palette.line)
      pdf.line(margin, cursorY, pageWidth - margin, cursorY)
      setText(palette.ink, 9, true)
      pdf.text(label.replace(/([A-Z])/g, ' $1').toUpperCase(), margin + 2, cursorY + 6)
      setText(palette.green, 9, true)
      pdf.text(value, pageWidth - margin - 2, cursorY + 6, { align: 'right', maxWidth: 90 })
      cursorY += 12
    }
  }

  if (category === 3) {
    addContentPage('Suggested hotel options')
    setText(palette.ink, 16, true)
    pdf.text('STAYS ALONG THE ROUTE', margin, cursorY)
    cursorY += 10
    for (const hotel of itinerary.hotels) {
      const lines = linesFor(hotel.options.join(' | '), contentWidth - 12, 8.5)
      const height = 18 + lines.length * 4 + 8
      ensureSpace(height, 'Suggested hotel options')
      pdf.setFillColor(...palette.paper)
      pdf.roundedRect(margin, cursorY, contentWidth, height, 2, 2, 'F')
      setText(palette.green, 10, true)
      pdf.text(`${hotel.city.toUpperCase()} | ${hotel.nights} NIGHTS`, margin + 5, cursorY + 7)
      setText(palette.ink, 8.5)
      pdf.text(lines, margin + 5, cursorY + 14, { lineHeightFactor: 1.3, charSpace: 0 })
      cursorY += height + 5
    }
  }

  ensureSpace(24, 'Inclusions and travel notes')
  setText(palette.ink, 16, true)
  pdf.text('BEFORE YOU TRAVEL', margin, cursorY)
  cursorY += 9
  addBulletSection('Inclusions', itinerary.inclusions)
  addBulletSection('Exclusions', itinerary.exclusions)
  addBulletSection('Important travel notes', itinerary.importantNotes)
  addBulletSection('Helpful tips', itinerary.tips)

  ensureSpace(54, 'Contact and booking details')
  pdf.setFillColor(...palette.paper)
  pdf.roundedRect(margin, cursorY + 2, contentWidth, 45, 2, 2, 'F')
  setText(palette.green, 10, true)
  pdf.text(company.name, margin + 5, cursorY + 10)
  setText(palette.ink, 8)
  pdf.text(company.address, margin + 5, cursorY + 17)
  pdf.text(`Phone / WhatsApp: ${company.phone}`, margin + 5, cursorY + 23)
  pdf.text(`Email: ${company.email} | GST: ${company.gst}`, margin + 5, cursorY + 29)
  pdf.textWithLink(company.website, margin + 5, cursorY + 35, { url: company.website })
  setText(palette.gold, 8, true)
  pdf.text('Thank you for choosing The Himalayan Travels.', margin + 5, cursorY + 42)

  for (let page = 1; page <= pdf.getNumberOfPages(); page += 1) {
    pdf.setPage(page)
    if (page > 1) addFooter()
  }

  return pdf
}
