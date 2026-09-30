"use client";

import { FormEvent, useState } from "react";
import {
  CalendarDays,
  Check,
  Download,
  Hotel,
  LoaderCircle,
  MapPin,
  Pencil,
  Plane,
  Sparkles,
  Users,
} from "lucide-react";

type Day = {
  day: number;
  date: string;
  title: string;
  location: string;
  summary: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  night: string[];
  distance: string;
  travelTime: string;
  transport: string;
  departure: string;
  meals: string[];
  hotel: {
    city: string;
    category: string;
    name: string;
    options: string[];
    mealPlan: string;
  };
  activities: string[];
  optional: string[];
  image?: string;
};
type Itinerary = {
  trip: {
    origin: string;
    destination: string;
    startDate: string;
    endDate: string;
    duration: string;
    nights: number;
    adults: number;
    children: number;
    travellerType: string;
    budget: string;
    hotelCategory: string;
    transport: string;
    meals: string;
    tripType: string;
    requirements: string;
  };
  title: string;
  summary: string;
  route: string[];
  days: Day[];
  hotels: { city: string; nights: number; options: string[] }[];
  transportPlan: {
    route: string;
    mode: string;
    distance: string;
    duration: string;
    cost: string;
  }[];
  cost: Record<string, string>;
  packageOptions: { name: string; details: string }[];
  inclusions: string[];
  exclusions: string[];
  tips: string[];
  importantNotes: string[];
  packing: string[];
  emergency: string[];
};
type Category = 1 | 2 | 3;
type FormState = {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: string;
  adults: string;
  children: string;
  travellerType: string;
  budget: string;
  hotelCategory: string;
  transport: string;
  meals: string;
  tripType: string;
  requirements: string;
};

const initialForm: FormState = {
  origin: "",
  destination: "",
  startDate: "",
  endDate: "",
  days: "7",
  adults: "2",
  children: "0",
  travellerType: "Couple",
  budget: "",
  hotelCategory: "Comfort",
  transport: "",
  meals: "Breakfast and dinner",
  tripType: "Leisure",
  requirements: "",
};
const gstNumber = "02GCYPK3256A1ZN";
const contactNumber = "+91 85059 83792";

function bullets(items: string[]) {
  return (
    <ul className="mt-2 space-y-1 text-sm leading-relaxed text-slate-600">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span className="text-[#c8922a]">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function imageAsPng(source: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || 1400;
      canvas.height = image.naturalHeight || 700;
      canvas.getContext("2d")?.drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () =>
      reject(new Error("Could not prepare itinerary image"));
    image.src = source;
  });
}

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [masterItinerary, setMasterItinerary] = useState<Itinerary | null>(
    null,
  );
  const [category, setCategory] = useState<Category>(1);
  const [loading, setLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showHotels, setShowHotels] = useState(false);

  const categoryTitle =
    category === 1
      ? "Travel itinerary"
      : category === 2
        ? "Travel itinerary + estimated cost"
        : "Travel itinerary + hotel options";
  const categoryDescription =
    category === 1
      ? "The complete travel plan without prices or hotel quotations."
      : category === 2
        ? "The same master travel plan with estimated trip costs added."
        : "The same master travel plan with suggested hotel options added.";
  const category2 = masterItinerary
    ? { ...masterItinerary, cost: masterItinerary.cost }
    : null;
  const category3 = masterItinerary
    ? {
        ...masterItinerary,
        hotels: masterItinerary.hotels,
        cost: masterItinerary.cost,
      }
    : null;

  function change(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMasterItinerary(null);
    setCategory(1);
    setConfirmed(false);
    setShowHotels(false);
    try {
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          days: Number(form.days),
          adults: Number(form.adults),
          children: Number(form.children),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not create your itinerary.");
      const base = result as Itinerary;
      setMasterItinerary(base);
      setImagesLoading(true);
      const imageResults = await Promise.all(
        base.days.map(async (day) => {
          const imageResponse = await fetch("/api/itinerary/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              destination: base.trip.destination,
              day: day.day,
              title: `${day.location}: ${day.title}`,
            }),
          });
          const image = await imageResponse.json();
          return { day: day.day, image: image.image as string };
        }),
      );
      setMasterItinerary({
        ...base,
        days: base.days.map((day) => ({
          ...day,
          image: imageResults.find((item) => item.day === day.day)?.image,
        })),
      });
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
      setImagesLoading(false);
    }
  }

  function updateHotel(dayNumber: number, hotel: string) {
    if (!masterItinerary || confirmed) return;
    setMasterItinerary({
      ...masterItinerary,
      days: masterItinerary.days.map((day) =>
        day.day === dayNumber
          ? { ...day, hotel: { ...day.hotel, name: hotel } }
          : day,
      ),
    });
  }

  function updateCost(key: string, value: string) {
    if (!masterItinerary || confirmed) return;
    setMasterItinerary({
      ...masterItinerary,
      cost: { ...masterItinerary.cost, [key]: value },
    });
  }

  function updateHotelOption(city: string, index: number, value: string) {
    if (!masterItinerary || confirmed) return;
    setMasterItinerary({
      ...masterItinerary,
      hotels: masterItinerary.hotels.map((hotel) =>
        hotel.city === city
          ? {
              ...hotel,
              options: hotel.options.map((option, optionIndex) =>
                optionIndex === index ? value : option,
              ),
            }
          : hotel,
      ),
    });
  }

  async function downloadPdf() {
    if (
      !masterItinerary ||
      imagesLoading ||
      masterItinerary.days.some((day) => !day.image)
    ) {
      setError(
        "Please wait for all destination images to finish before downloading.",
      );
      return;
    }
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const images = await Promise.all(
        masterItinerary.days.map((day) =>
          day.image ? imageAsPng(day.image) : Promise.resolve(""),
        ),
      );
      const footer = () => {
        pdf.setTextColor(100, 116, 139);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text(
          "THE HIMALAYAN TRAVELS · Travel • Explore • Experience · thehimalayantravels.com",
          18,
          290,
        );
        pdf.text(`Page ${pdf.getNumberOfPages()}`, 178, 290);
      };
      const section = (heading: string, value: string, y: number) => {
        pdf.setTextColor(200, 146, 42);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text(heading.toUpperCase(), 18, y);
        pdf.setTextColor(71, 85, 105);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(pdf.splitTextToSize(value || "Not specified", 174), 18, y + 6);
      };
      const fillPage = (color: [number, number, number]) => {
        pdf.setFillColor(...color);
        pdf.rect(0, 0, 210, 297, "F");
      };
      fillPage([247, 244, 238]);
      pdf.setTextColor(26, 58, 92);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("THE HIMALAYAN TRAVELS", 18, 22);
      pdf.setTextColor(200, 146, 42);
      pdf.setFontSize(10);
      pdf.text(categoryTitle.toUpperCase(), 18, 31);
      if (images[0]) pdf.addImage(images[0], "PNG", 18, 44, 174, 92);
      pdf.setTextColor(26, 58, 92);
      pdf.setFontSize(25);
      pdf.text(masterItinerary.title, 18, 158, { maxWidth: 174 });
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text("Your Journey Starts Here", 18, 169);
      pdf.setFontSize(10);
      pdf.text(
        `${masterItinerary.trip.duration} · ${masterItinerary.route.join(" → ")}`,
        18,
        181,
      );
      pdf.text(
        `${masterItinerary.trip.adults} adults · ${masterItinerary.trip.travellerType}`,
        18,
        190,
      );
      footer();
      pdf.addPage();
      fillPage([255, 255, 255]);
      pdf.setTextColor(26, 58, 92);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Trip at a glance", 18, 24);
      const infoCard = (label: string, value: string, x: number, y: number, width: number) => {
        pdf.setFillColor(247, 244, 238);
        pdf.roundedRect(x, y, width, 28, 3, 3, "F");
        pdf.setTextColor(200, 146, 42);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.text(label.toUpperCase(), x + 6, y + 8);
        pdf.setTextColor(26, 58, 92);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(pdf.splitTextToSize(value, width - 12), x + 6, y + 16);
      };
      infoCard("Duration", masterItinerary.trip.duration, 18, 38, 82);
      infoCard("Travellers", `${masterItinerary.trip.adults} adults · ${masterItinerary.trip.travellerType}`, 110, 38, 82);
      infoCard("Trip type", masterItinerary.trip.tripType, 18, 72, 82);
      infoCard("Transport", masterItinerary.trip.transport || "Practical route option", 110, 72, 82);
      pdf.setTextColor(200, 146, 42); pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.text("ROUTE", 18, 116);
      pdf.setTextColor(26, 58, 92); pdf.setFont("helvetica", "bold"); pdf.setFontSize(12); pdf.text(masterItinerary.route.join("  →  "), 18, 126, { maxWidth: 174 });
      pdf.setDrawColor(200, 146, 42); pdf.line(18, 132, 192, 132);
      section("Journey", masterItinerary.summary, 149);
      section("Daily route", masterItinerary.days.map((day) => `Day ${day.day}: ${day.location} — ${day.title}`).join("\n"), 193);
      footer();
      for (const [index, day] of masterItinerary.days.entries()) {
        pdf.addPage();
        fillPage([255, 255, 255]);
        pdf.setTextColor(200, 146, 42);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(
          `DAY ${String(day.day).padStart(2, "0")} · ${day.location}`.toUpperCase(),
          18,
          20,
        );
        pdf.setTextColor(26, 58, 92);
        pdf.setFontSize(18);
        pdf.text(day.title, 18, 31, { maxWidth: 174 });
        if (images[index]) pdf.addImage(images[index], "PNG", 18, 40, 174, 60);
        section("Morning", day.morning.join(" • "), 114);
        section("Afternoon", day.afternoon.join(" • "), 146);
        section("Evening", day.evening.join(" • "), 178);
        section("Night", day.night.join(" • "), 210);
        section(
          "Travel",
          `${day.distance} · ${day.travelTime} · ${day.transport} · Depart ${day.departure}`,
          242,
        );
        section("Meals", day.meals.join(" · "), 270);
        footer();
      }
      pdf.addPage();
      fillPage([247, 244, 238]);
      pdf.setTextColor(26, 58, 92);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text(
        category === 2
          ? "Estimated trip cost"
          : category === 3
            ? "Suggested hotel options"
            : "Travel notes",
        18,
        24,
      );
      if (category === 2)
        section(
          "Cost estimate",
          Object.entries(category2!.cost)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n"),
          42,
        );
      if (category === 3)
        section(
          "Suggested hotel options",
          category3!.hotels
            .map(
              (hotel) =>
                `${hotel.city} · ${hotel.nights} nights\n${hotel.options.join("\n")}`,
            )
            .join("\n\n"),
          42,
        );
      section(
        "Inclusions",
        masterItinerary.inclusions.join(" · "),
        category === 1 ? 42 : 190,
      );
      section(
        "Exclusions",
        masterItinerary.exclusions.join(" · "),
        category === 1 ? 100 : 234,
      );
      footer();
      pdf.save(
        `${masterItinerary.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-category-${category}.pdf`,
      );
    } catch {
      setError("The PDF could not be downloaded. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c8922a]/30 bg-[#c8922a]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6c18]">
            <Sparkles size={14} /> AI travel desk
          </div>
          <h1 className="text-4xl font-bold leading-tight text-[#1a3a5c] sm:text-6xl">
            A complete journey, ready to send.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
            Tell us how you want to travel. We will build the route, stays,
            transfers, budget and a polished customer-ready itinerary.
          </p>
        </div>
        <PlannerForm
          form={form}
          loading={loading}
          change={change}
          onSubmit={generate}
        />
        {error && (
          <p
            role="alert"
            className="mx-auto mt-4 max-w-3xl text-center text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {masterItinerary && (
          <section className="mx-auto mt-12 max-w-5xl" aria-live="polite">
            <div className="document-header">
              <div>
                <p className="print-brand">THE HIMALAYAN TRAVELS</p>
                <p className="print-contact">
                  GST: {gstNumber} · {contactNumber}
                </p>
              </div>
              <p className="print-document-label">{categoryTitle}</p>
            </div>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-label">Your master itinerary</p>
                <h2 className="section-title">{masterItinerary.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                  {categoryDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {confirmed ? (
                  <button
                    type="button"
                    onClick={() => setConfirmed(false)}
                    className="btn-outline justify-center"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmed(true)}
                    className="btn-primary justify-center"
                  >
                    <Check size={16} /> Confirm
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowHotels(!showHotels)}
                  className="btn-outline justify-center"
                >
                  <Hotel size={16} />{" "}
                  {showHotels ? "Hide hotels" : "Add hotels"}
                </button>
                <button
                  type="button"
                  onClick={downloadPdf}
                  disabled={imagesLoading}
                  className="btn-gold justify-center disabled:opacity-70"
                >
                  <Download size={16} />{" "}
                  {imagesLoading ? "Creating images..." : "Download PDF"}
                </button>
              </div>
            </div>
            <div
              className="category-tabs"
              role="tablist"
              aria-label="Itinerary output category"
            >
              {([1, 2, 3] as Category[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={category === item}
                  onClick={() => setCategory(item)}
                  className={
                    category === item ? "category-tab active" : "category-tab"
                  }
                >
                  {item === 1
                    ? "1 · Itinerary only"
                    : item === 2
                      ? "2 · Add cost"
                      : "3 · Add hotels"}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <Stat
                icon={<CalendarDays size={18} />}
                label="Duration"
                value={masterItinerary.trip.duration}
              />
              <Stat
                icon={<Users size={18} />}
                label="Travellers"
                value={`${masterItinerary.trip.adults} adults, ${masterItinerary.trip.children} children`}
              />
              <Stat
                icon={<Hotel size={18} />}
                label="Stay"
                value={`${masterItinerary.trip.nights} nights`}
              />
              <Stat
                icon={<Plane size={18} />}
                label={category === 2 ? "Estimated cost" : "Route"}
                value={
                  category === 2
                    ? masterItinerary.cost.total
                    : `${masterItinerary.route.length} stops`
                }
              />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
              <Section title="Route summary">
                <p className="text-sm font-medium text-[#1a3a5c]">
                  {masterItinerary.route.join(" → ")}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Transport:{" "}
                  {masterItinerary.trip.transport ||
                    "Practical option selected by AI"}
                  <br />
                  Meals: {masterItinerary.trip.meals}
                  <br />
                  Hotel preference: {masterItinerary.trip.hotelCategory}
                </p>
              </Section>
              {category === 2 && (
                <Section title="Estimated cost">
                  <div className="cost-table">
                    {Object.entries(masterItinerary.cost).map(([key, value]) => (
                      <label key={key} className="cost-row">
                        <span className="capitalize text-slate-600">{key}</span>
                        <input value={value} disabled={confirmed} onChange={(event) => updateCost(key, event.target.value)} className="form-input h-9 text-right" />
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Add or adjust estimates before confirming and downloading.</p>
                </Section>
              )}
              {category === 3 && (
                <Section title="Suggested hotel options">
                  {masterItinerary.hotels.map((hotel) => (
                    <div key={hotel.city} className="mb-3">
                      <strong className="text-[#1a3a5c]">
                        {hotel.city} · {hotel.nights} nights
                      </strong>
                      {hotel.options.map((option, index) => <input key={`${hotel.city}-${index}`} value={option} disabled={confirmed} onChange={(event) => updateHotelOption(hotel.city, index, event.target.value)} className="form-input mt-2 h-9" placeholder={`Suggested Hotel Option ${index + 1}`} />)}
                    </div>
                  ))}
                </Section>
              )}
            </div>
            <div className="mt-8">
              <p className="section-label">
                Same master itinerary · day by day
              </p>
              <div className="mt-3 space-y-5">
                {masterItinerary.days.map((day) => (
                  <article
                    key={day.day}
                    className="itinerary-day overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="grid lg:grid-cols-[.8fr_1.2fr]">
                      <div className="min-h-64 bg-slate-200">
                        {day.image && (
                          <img
                            src={day.image}
                            alt={`${day.location} travel`}
                            className="h-full min-h-64 w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-5 sm:p-7">
                        <p className="section-label">
                          Day {day.day} · {day.location}
                        </p>
                        <h3 className="text-2xl font-semibold text-[#1a3a5c]">
                          {day.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          {day.summary}
                        </p>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <DayPart title="Morning" items={day.morning} />
                          <DayPart title="Afternoon" items={day.afternoon} />
                          <DayPart title="Evening" items={day.evening} />
                          <DayPart title="Night" items={day.night} />
                        </div>
                        <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                          <strong>Travel:</strong> {day.distance} ·{" "}
                          {day.travelTime} · {day.transport} · {day.departure}
                        </p>
                        {category === 3 && showHotels && (
                          <div className="mt-5 border-t border-slate-100 pt-4">
                            <label className="flex items-center gap-2 text-sm font-semibold text-[#1a3a5c]">
                              <Hotel size={16} className="text-[#c8922a]" /> Add
                              hotel for {day.hotel.city}
                            </label>
                            <input
                              value={day.hotel.name}
                              disabled={confirmed}
                              onChange={(event) =>
                                updateHotel(day.day, event.target.value)
                              }
                              className="form-input mt-2"
                              placeholder="Suggested Hotel Option"
                            />
                            {bullets(day.hotel.options)}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Section title="Inclusions">
                {bullets(masterItinerary.inclusions)}
              </Section>
              <Section title="Exclusions">
                {bullets(masterItinerary.exclusions)}
              </Section>
              {category === 2 && (
                <Section title="Cost breakdown">
                  {Object.entries(masterItinerary.cost).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-slate-100 py-2 text-sm"
                    >
                      <span className="capitalize text-slate-600">{key}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </Section>
              )}
              {category === 3 && (
                <Section title="Hotel notice">
                  <p className="text-sm text-slate-600">
                    All hotels are Suggested Hotel Options. Availability and
                    booking are not guaranteed until confirmed separately.
                  </p>
                </Section>
              )}
              <Section title="Travel tips">
                {bullets(masterItinerary.tips)}
              </Section>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function PlannerForm({
  form,
  loading,
  change,
  onSubmit,
}: {
  form: FormState;
  loading: boolean;
  change: (field: keyof FormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Field
          label="Starting city"
          icon={<MapPin size={17} />}
          value={form.origin}
          onChange={(value) => change("origin", value)}
          placeholder="Delhi"
          required
        />
        <Field
          label="Destination"
          icon={<MapPin size={17} />}
          value={form.destination}
          onChange={(value) => change("destination", value)}
          placeholder="Goa, Manali, Kashmir"
          required
        />
        <Field
          label="Start date"
          icon={<CalendarDays size={17} />}
          type="date"
          value={form.startDate}
          onChange={(value) => change("startDate", value)}
        />
        <Field
          label="End date"
          icon={<CalendarDays size={17} />}
          type="date"
          value={form.endDate}
          onChange={(value) => change("endDate", value)}
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Days"
          value={form.days}
          onChange={(value) => change("days", value)}
          options={["3", "4", "5", "6", "7", "8", "10", "12", "15"]}
        />
        <Select
          label="Adults"
          value={form.adults}
          onChange={(value) => change("adults", value)}
          options={["1", "2", "3", "4", "5", "6", "8", "10"]}
        />
        <Select
          label="Children"
          value={form.children}
          onChange={(value) => change("children", value)}
          options={["0", "1", "2", "3", "4", "5"]}
        />
        <Select
          label="Traveller type"
          value={form.travellerType}
          onChange={(value) => change("travellerType", value)}
          options={[
            "Solo",
            "Couple",
            "Family",
            "Friends",
            "Group",
            "Senior citizens",
          ]}
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Trip type"
          value={form.tripType}
          onChange={(value) => change("tripType", value)}
          options={[
            "Leisure",
            "Honeymoon",
            "Adventure",
            "Pilgrimage",
            "Family holiday",
            "Beach holiday",
          ]}
        />
        <Select
          label="Hotel category"
          value={form.hotelCategory}
          onChange={(value) => change("hotelCategory", value)}
          options={["Budget", "Comfort", "Premium", "Luxury"]}
        />
        <Select
          label="Transport preference"
          value={form.transport}
          onChange={(value) => change("transport", value)}
          options={[
            "AI choose practical option",
            "Private AC cab",
            "Flight + private cab",
            "Train + private cab",
            "Volvo / bus",
          ]}
        />
        <Select
          label="Meals"
          value={form.meals}
          onChange={(value) => change("meals", value)}
          options={[
            "Breakfast only",
            "Breakfast and dinner",
            "All meals",
            "Local food suggestions",
          ]}
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Budget (optional)"
          icon={<span>₹</span>}
          value={form.budget}
          onChange={(value) => change("budget", value)}
          placeholder="₹50,000 total or per person"
        />
        <Field
          label="Special requirements"
          icon={<Users size={17} />}
          value={form.requirements}
          onChange={(value) => change("requirements", value)}
          placeholder="Child-friendly, less walking, anniversary dinner..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-gold mt-6 h-14 w-full justify-center text-base disabled:opacity-70"
      >
        {loading ? (
          <LoaderCircle className="animate-spin" size={19} />
        ) : (
          <Sparkles size={19} />
        )}
        {loading
          ? "Building your complete trip..."
          : "Create professional itinerary"}
      </button>
    </form>
  );
}
function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="form-label flex items-center gap-2">
        {icon}
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="form-input h-11"
      />
    </label>
  );
}
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input h-11"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-[#1a3a5c]">{title}</h2>
      {children}
    </section>
  );
}
function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-[#c8922a]">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-[#1a3a5c]">{value}</p>
    </div>
  );
}
function DayPart({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#c8922a]">
        {title}
      </h4>
      {bullets(items)}
    </div>
  );
}
