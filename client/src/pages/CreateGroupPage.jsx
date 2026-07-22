import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Users, MapPin, Calendar, DollarSign, CheckCircle, Plus, X } from "lucide-react";
import { useTravelContext } from "../context/TravelContext";

const STEPS = [
  { id: 1, title: "Trip Basics", icon: Users, description: "Name your adventure" },
  { id: 2, title: "Destinations", icon: MapPin, description: "Where are you headed?" },
  { id: 3, title: "Dates & Budget", icon: Calendar, description: "When and how much?" },
  { id: 4, title: "First Member", icon: CheckCircle, description: "Add yourself to the trip" },
];

const INTERESTS = [
  "🏖️ Beaches", "🏔️ Mountains", "🏙️ City Life", "🍜 Food & Cuisine",
  "🎭 Culture", "🛕 History", "🌿 Nature", "🎢 Adventure", "🛍️ Shopping",
  "🧘 Wellness", "🎵 Nightlife", "📸 Photography",
];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all ${
            currentStep > step.id ? "bg-ocean-500 text-white"
              : currentStep === step.id ? "bg-ocean-600 text-white ring-4 ring-ocean-100"
              : "bg-slate-100 text-slate-400"
          }`}>
            {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 h-0.5 transition-all ${currentStep > step.id ? "bg-ocean-500" : "bg-slate-100"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const { createGroup, addMember } = useTravelContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    creator: "",
    destinations: [],
    destInput: "",
    startDate: "",
    endDate: "",
    budget: { total: "", currency: "USD" },
    selectedInterests: [],
    member: { name: "", email: "" },
  });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addDestination = () => {
    if (form.destInput.trim() && !form.destinations.includes(form.destInput.trim())) {
      update("destinations", [...form.destinations, form.destInput.trim()]);
      update("destInput", "");
    }
  };

  const removeDestination = (d) => update("destinations", form.destinations.filter((x) => x !== d));

  const toggleInterest = (i) => {
    const cur = form.selectedInterests;
    update("selectedInterests", cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]);
  };

  const handleSubmit = async () => {
    if (!form.member.name || !form.member.email) return;
    setLoading(true);
    try {
      const group = await createGroup({
        name: form.name,
        description: form.description,
        creator: form.creator,
        destinations: form.destinations,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        budget: {
          total: Number(form.budget.total) || 0,
          currency: form.budget.currency,
          perPerson: 0,
        },
        interests: form.selectedInterests,
        members: [],
      });
      await addMember(group.id, { name: form.member.name, email: form.member.email, role: "organizer" });
      navigate(`/groups/${group.id}`);
    } catch {
      // context handles notify
    } finally {
      setLoading(false);
    }
  };

  const canNext = {
    1: form.name.trim().length >= 2 && form.creator.trim().length >= 2,
    2: form.destinations.length >= 1,
    3: true,
    4: form.member.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.member.email),
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="section-title text-3xl">Plan a New Trip 🗺️</h1>
        <p className="section-subtitle text-base">Fill in the details and invite your crew</p>
      </div>

      <StepIndicator currentStep={step} />

      {/* Step Labels */}
      <div className="text-center mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-ocean-500">{STEPS[step - 1].description}</p>
        <h2 className="text-xl font-bold text-slate-800 mt-1 font-display">{STEPS[step - 1].title}</h2>
      </div>

      <div className="card p-6 md:p-8 animate-fade-in">
        {/* STEP 1: Basics */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="label">Trip Name *</label>
              <input className="input-field" placeholder="Euro Summer '25 🌍" value={form.name}
                onChange={(e) => update("name", e.target.value)} maxLength={100} />
            </div>
            <div>
              <label className="label">Your Name *</label>
              <input className="input-field" placeholder="Who's organizing this?" value={form.creator}
                onChange={(e) => update("creator", e.target.value)} />
            </div>
            <div>
              <label className="label">Trip Description</label>
              <textarea className="input-field resize-none h-24" placeholder="Epic road trip through the Amalfi Coast..."
                value={form.description} onChange={(e) => update("description", e.target.value)} maxLength={500} />
            </div>
          </div>
        )}

        {/* STEP 2: Destinations & Interests */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="label">Add Destinations *</label>
              <div className="flex gap-2">
                <input className="input-field" placeholder="Paris, France" value={form.destInput}
                  onChange={(e) => update("destInput", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDestination()} />
                <button onClick={addDestination} className="btn-primary px-4">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Add multiple destinations to vote on them</p>
            </div>
            {form.destinations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.destinations.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ocean-50 text-ocean-700 rounded-xl text-sm font-medium">
                    <MapPin className="w-3.5 h-3.5" /> {d}
                    <button onClick={() => removeDestination(d)} className="text-ocean-400 hover:text-coral-500 ml-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div>
              <label className="label">Group Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button key={interest} onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      form.selectedInterests.includes(interest)
                        ? "bg-ocean-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Dates & Budget */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date</label>
                <input type="date" className="input-field" value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)} />
              </div>
              <div>
                <label className="label">End Date</label>
                <input type="date" className="input-field" value={form.endDate}
                  onChange={(e) => update("endDate", e.target.value)} min={form.startDate} />
              </div>
            </div>
            <div>
              <label className="label">Total Budget</label>
              <div className="flex gap-2">
                <select className="input-field w-28" value={form.budget.currency}
                  onChange={(e) => update("budget", { ...form.budget, currency: e.target.value })}>
                  {["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "INR"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input type="number" className="input-field flex-1" placeholder="5000"
                  value={form.budget.total}
                  onChange={(e) => update("budget", { ...form.budget, total: e.target.value })} min="0" />
              </div>
            </div>
            <div className="bg-ocean-50 rounded-2xl p-4 text-sm text-ocean-700">
              <strong>💡 Tip:</strong> You can refine dates and budget later. AI will help break down costs per person.
            </div>
          </div>
        )}

        {/* STEP 4: First Member */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="bg-sand-50 rounded-2xl p-4 border border-sand-200">
              <p className="text-sm text-amber-700 font-medium">🎉 Almost there! Add yourself as the trip organizer.</p>
            </div>
            <div>
              <label className="label">Your Full Name *</label>
              <input className="input-field" placeholder="Jane Smith" value={form.member.name}
                onChange={(e) => update("member", { ...form.member, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Your Email *</label>
              <input type="email" className="input-field" placeholder="jane@example.com" value={form.member.email}
                onChange={(e) => update("member", { ...form.member, email: e.target.value })} />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-slate-700">Trip Summary</p>
              <div className="flex items-center gap-2 text-slate-600"><Users className="w-4 h-4 text-ocean-400" /> {form.name}</div>
              {form.destinations.length > 0 && (
                <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4 text-coral-400" /> {form.destinations.join(" → ")}</div>
              )}
              {(form.startDate || form.endDate) && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  {form.startDate || "TBD"} → {form.endDate || "TBD"}
                </div>
              )}
              {form.budget.total && (
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  {form.budget.currency} {Number(form.budget.total).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="btn-ghost">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext[step]} className="btn-primary">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading || !canNext[4]} className="btn-primary px-8">
              {loading ? "Creating..." : "Create Trip 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
