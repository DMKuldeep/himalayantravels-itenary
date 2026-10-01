import { NextResponse } from 'next/server'

function fallbackImage(destination: string, day: number) {
  const safeDestination = destination.replace(/[<&>"']/g, '').slice(0, 40)
  const colors = [['#173b59', '#c8922a'], ['#214e58', '#e6b85c'], ['#253d5b', '#d77b52'], ['#285044', '#d4a64a']][(day - 1) % 4]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="700" viewBox="0 0 1400 700"><defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><rect width="1400" height="700" fill="url(#sky)"/><circle cx="1080" cy="150" r="90" fill="#fff" opacity=".65"/><path d="M0 560 270 260 470 470 710 150 1030 500 1200 300 1400 540V700H0Z" fill="#102d43" opacity=".9"/><path d="M0 600 350 390 590 570 850 330 1120 560 1400 410V700H0Z" fill="#f2d39a" opacity=".32"/><text x="80" y="120" fill="white" font-family="Georgia,serif" font-size="44" opacity=".9">Day ${day}</text><text x="80" y="625" fill="white" font-family="Arial,sans-serif" font-size="42" font-weight="bold">${safeDestination}</text><text x="80" y="665" fill="white" font-family="Arial,sans-serif" font-size="20" opacity=".8">A new place to discover</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

async function destinationPhoto(destination: string, dayTitle: string) {
  const search = encodeURIComponent(`${dayTitle} ${destination} landmark landscape`)
  const searchResponse = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${search}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=1400&format=json`, { next: { revalidate: 86400 } })
  if (!searchResponse.ok) return null
  const result = await searchResponse.json()
  const page = Object.values(result.query?.pages || {})[0] as { imageinfo?: Array<{ thumburl?: string; url?: string }> } | undefined
  const imageUrl = page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url
  if (!imageUrl) return null
  const imageResponse = await fetch(imageUrl, { next: { revalidate: 86400 } })
  if (!imageResponse.ok) return null
  const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
  const image = Buffer.from(await imageResponse.arrayBuffer()).toString('base64')
  return `data:${contentType};base64,${image}`
}

export async function POST(request: Request) {
  try {
    const { destination, day, title } = await request.json()
    if (typeof destination !== 'string' || !Number.isInteger(day)) {
      return NextResponse.json({ error: 'Invalid image request.' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      const image = await destinationPhoto(destination, typeof title === 'string' ? title : '').catch(() => null)
      return NextResponse.json({ image: image || fallbackImage(destination, day) })
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `Create a beautiful editorial travel photograph for day ${day} of a journey in ${destination}. Scene: ${typeof title === 'string' ? title : 'a memorable local travel experience'}. Landscape orientation, warm natural light, realistic, no text, no logos, no people with identifiable faces.`,
        size: '1536x1024',
        quality: 'low',
      }),
    })
    const result = await response.json()
    const image = result.data?.[0]?.b64_json
    if (!response.ok || !image) return NextResponse.json({ image: fallbackImage(destination, day) })
    return NextResponse.json({ image: `data:image/png;base64,${image}` })
  } catch {
    return NextResponse.json({ image: fallbackImage('Your journey', 1) })
  }
}
