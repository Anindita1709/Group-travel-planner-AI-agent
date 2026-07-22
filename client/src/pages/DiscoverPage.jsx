import { useState } from "react";
import { Sparkles, MapPin, Globe2, Users, DollarSign, Clock, Loader2, Search } from "lucide-react";
import { aiApi } from "../services/api";
import clsx from "clsx";

const INTEREST_OPTS = ["🏖️ Beaches", "🏔️ Mountains", "🏙️ City Life", "🍜 Food", "🎭 Culture", "🌿 Nature", "⛷️ Adventure", "🧘 Wellness"];
const DURATION_OPTS = ["Weekend (2-3 days)", "Short (4-6 days)", "Week (7 days)", "Extended (10-14 days)"];
const BUDGET_OPTS = ["Budget-friendly", "Moderate", "Luxury"];
const DIFFICULTY_COLORS = { easy: "badge-green", moderate: "badge-amber", adventurous: "badge-coral" };

function DestinationCard({ dest, index }) {
  return (
    <div className="card p-5 animate-slide-up hover:shadow-md transition-all hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{dest.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-800 font-display leading-tight">{dest.name}</h3>
            <span className={clsx("badge flex-shrink-0 capitalize", DIFFICULTY_COLORS[dest.difficulty])}>
              {dest.difficulty}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5 italic">{dest.tagline}</p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex flex-wrap gap-1.5">
          {dest.highlights?.map((h) => (
            <span key={h} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs">{h}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          <span className="truncate">{dest.estimatedBudget}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-ocean-400" />
          <span className="truncate">{dest.bestFor}</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span className="truncate">{dest.weather}</span>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const [form, setForm] = useState({
    interests: [],
    budget: "",
    duration: "",
    groupSize: 4,
    preferences: "",
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleInterest = (i) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
    }));
  };

  const handleDiscover = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await aiApi.suggestDestinations({
        interests: form.interests,
        budget: form.budget,
        duration: form.duration,
        groupSize: form.groupSize,
        preferences: form.preferences,
      });
      setResults(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" /> AI Destination Discovery
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 font-display mb-2">
          Where should your group go?
        </h1>
        <p className="text-slate-500 text-lg max-w-lg mx-auto">
          Tell us about your group and let Claude suggest the perfect destinations.
        </p>
      </div>

      {/* Preferences Form */}
      <div className="card p-6 md:p-8 mb-8">
        <div className="space-y-5">
          {/* Interests */}
          <div>
            <label className="label">What's your group into?</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTS.map((i) => (
                <button key={i} onClick={() => toggleInterest(i)}
                  className={clsx("px-3 py-2 rounded-xl text-sm font-medium transition-all", form.interests.includes(i)
                    ? "bg-ocean-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Duration */}
            <div>
              <label className="label">Trip Duration</label>
              <select className="input-field" value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}>
                <option value="">Any duration</option>
                {DURATION_OPTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="label">Budget Level</label>
              <select className="input-field" value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}>
                <option value="">Any budget</option>
                {BUDGET_OPTS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>

            {/* Group Size */}
            <div>
              <label className="label">Group Size</label>
              <input type="number" className="input-field" min={2} max={50} value={form.groupSize}
                onChange={(e) => setForm((f) => ({ ...f, groupSize: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Extra Preferences */}
          <div>
            <label className="label">Any special requirements?</label>
            <textarea className="input-field resize-none h-20 text-sm"
              placeholder="e.g. visa-free for US passports, kid-friendly, wheelchair accessible, good nightlife..."
              value={form.preferences} onChange={(e) => setForm((f) => ({ ...f, preferences: e.target.value }))} />
          </div>

          <button onClick={handleDiscover} disabled={loading}
            className="btn-primary w-full py-3.5 text-base justify-center">
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Claude is searching the world...</>
            ) : (
              <><Search className="w-5 h-5" /> Discover My Perfect Destination</>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-red-700 text-sm">
          ⚠️ {error} — Make sure your API key is configured correctly.
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6 animate-fade-in">
          {/* AI Recommendation */}
          {results.recommendation && (
            <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #0a1628, #1e3a5f)" }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-ocean-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ocean-300 mb-1">Claude's Top Pick</p>
                  <p className="text-white/90 text-sm leading-relaxed">{results.recommendation}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="section-title mb-4">
              <Globe2 className="inline w-6 h-6 text-ocean-500 mr-2" />
              {results.destinations?.length} Destinations for Your Group
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {results.destinations?.map((dest, i) => (
                <DestinationCard key={dest.name} dest={dest} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
