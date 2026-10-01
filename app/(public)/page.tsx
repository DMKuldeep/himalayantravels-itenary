"use client";

import { FormEvent, useRef, useState } from "react";
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
import { extractTripRequest, suggestedDuration } from "@/lib/trip-request";
import { companyContact } from "@/lib/company";

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
  days: "",
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

function calculateTravelDays(startDate: string, endDate: string, fallbackDays: number) {
  if (!startDate || !endDate) return Number(fallbackDays) || 5;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return Number(fallbackDays) || 5;
  }
  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = Math.round(diffInMs / 86400000) + 1;
  return Math.max(1, diffInDays);
}

function suggestTripDuration(destination: string) {
  return suggestedDuration(destination);
}

function parseNaturalLanguagePrompt(rawPrompt: string, fallback: FormState) {
  if (!rawPrompt.trim()) return fallback;
  const extracted = extractTripRequest(rawPrompt);
  const lower = rawPrompt.toLowerCase();
  let travellerType = fallback.travellerType;
  let adults = fallback.adults;
  if (/solo|single/.test(lower)) {
    travellerType = "Solo";
    adults = "1";
  } else if (/family/.test(lower)) {
    travellerType = "Family";
    adults = "4";
  } else if (/friends|group/.test(lower)) {
    travellerType = "Friends";
    adults = "4";
  } else if (/couple|honeymoon/.test(lower)) {
    travellerType = "Couple";
    adults = "2";
  }

  return {
    ...fallback,
    origin: extracted.origin || fallback.origin,
    destination: extracted.destination || fallback.destination,
    days: extracted.days ? String(extracted.days) : fallback.days,
    startDate: extracted.startDate || fallback.startDate,
    endDate: extracted.endDate || fallback.endDate,
    adults,
    travellerType,
  };
}

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [tripPrompt, setTripPrompt] = useState("");
  const [masterItinerary, setMasterItinerary] = useState<Itinerary | null>(
    null,
  );
  const [category, setCategory] = useState<Category>(1);
  const [loading, setLoading] = useState(false);
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
  const parsedPromptForForm = parseNaturalLanguagePrompt(tripPrompt, {
    ...form,
    days: "",
  });
  const suggestedDays = suggestedDuration(
    parsedPromptForForm.destination || form.destination,
  );
  const promptDays = parsedPromptForForm.days || "";

  const requestId = useRef(0);

  function change(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentRequestId = ++requestId.current;
    if (!tripPrompt.trim() && !form.destination.trim()) {
      setError("Enter a destination or describe your trip above.");
      return;
    }
    setLoading(true);
    setError("");
    setMasterItinerary(null);
    setCategory(1);
    setConfirmed(false);
    setShowHotels(false);
    try {
      const parsedForm = parseNaturalLanguagePrompt(tripPrompt, form);
      const mergedForm = {
        ...form,
        ...parsedForm,
        origin: parsedForm.origin || form.origin || "Delhi",
        destination: parsedForm.destination || form.destination,
        adults: parsedForm.adults || form.adults || "2",
        children: parsedForm.children || form.children || "0",
      };
      if (!mergedForm.destination.trim()) {
        throw new Error("Please enter a destination or describe the trip in the prompt.");
      }

      const daysFromDates = calculateTravelDays(
        mergedForm.startDate,
        mergedForm.endDate,
        Number(mergedForm.days) || suggestedDuration(mergedForm.destination),
      );
      const response = await fetch("/api/itinerary", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...mergedForm,
          userQuery: tripPrompt.trim(),
          days: daysFromDates,
          adults: Number(mergedForm.adults),
          children: Number(mergedForm.children),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not create your itinerary.");
      if (currentRequestId !== requestId.current) return;
      setMasterItinerary(result as Itinerary);
    } catch (generationError) {
      if (currentRequestId === requestId.current) {
        setError(
          generationError instanceof Error
            ? generationError.message
            : "Something went wrong.",
        );
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
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
    if (!masterItinerary) {
      setError("Create an itinerary before downloading the PDF.");
      return;
    }
    try {
      const { createItineraryPdf } = await import("@/lib/itinerary-pdf");
      const pdf = createItineraryPdf(masterItinerary, category);
      pdf.save(
        `${masterItinerary.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-category-${category}.pdf`,
      );
      setError("");
    } catch (pdfError) {
      console.error("Itinerary PDF generation failed", pdfError);
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
          tripPrompt={tripPrompt}
          setTripPrompt={setTripPrompt}
          suggestedDays={String(suggestedDays)}
          promptDays={promptDays}
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
                  GST: {companyContact.gst} · {companyContact.phone}
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
                  className="btn-gold justify-center disabled:opacity-70"
                >
                  <Download size={16} /> Download PDF
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
                    <div className="p-5 sm:p-7">
                        <p className="section-label">
                          Day {String(day.day).padStart(2, "0")} · {day.date} · {day.location}
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
  tripPrompt,
  setTripPrompt,
  suggestedDays,
  promptDays,
  loading,
  change,
  onSubmit,
}: {
  form: FormState;
  tripPrompt: string;
  setTripPrompt: (value: string) => void;
  suggestedDays: string;
  promptDays: string;
  loading: boolean;
  change: (field: keyof FormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7"
    >
      <div className="mb-4">
        <Field
          label="Trip prompt (AI smart input)"
          icon={<Sparkles size={17} />}
          value={tripPrompt}
          onChange={setTripPrompt}
          placeholder='Examples: "Destination itinerary", "Origin to destination for 4 days", "Trip from origin to destination"'
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Field
          label="Starting city"
          icon={<MapPin size={17} />}
          value={form.origin}
          onChange={(value) => change("origin", value)}
          placeholder="Delhi"
        />
        <Field
          label="Destination"
          icon={<MapPin size={17} />}
          value={form.destination}
          onChange={(value) => change("destination", value)}
          placeholder="Goa, Manali, Kashmir"
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
          value={form.days || promptDays || suggestedDays}
          onChange={(value) => change("days", value)}
          options={["3", "4", "5", "6", "7", "8", "10", "12", "15"]}
        />
        <p className="-mt-2 text-xs text-slate-500 sm:col-span-2 lg:col-span-4">
          AI Suggested: {suggestedDays} Days / {Math.max(0, Number(suggestedDays) - 1)} Nights
        </p>
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
