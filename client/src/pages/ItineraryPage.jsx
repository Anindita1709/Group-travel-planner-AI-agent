import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft, Sparkles, Map, Package, BarChart3, Clock, MapPin,
  UtensilsCrossed, Bed, Lightbulb, DollarSign, CheckCircle2, Circle,
  ChevronDown, ChevronUp, Loader2, Download, RefreshCw
} from "lucide-react";
import { useTravelContext } from "../context/TravelContext";
import { aiApi } from "../services/api";
import clsx from "clsx";

const TABS = [
  { id: "itinerary", label: "Itinerary", icon: Map },
  { id: "packing", label: "Packing List", icon: Package },
  { id: "budget", label: "Budget", icon: BarChart3 },
];

const ACTIVITY_ICONS = {
  sightseeing: "🏛️", food: "🍜", adventure: "⛰️",
  culture: "🎭", relaxation: "🧘", transport: "🚆",
};

// ─── Generate Itinerary Form ──────────────────────────────────────────────────
function GenerateForm({ group, onGenerate, isGenerating }) {
  const [form, setForm] = useState({
    destination: group?.destinations?.[0] || "",
    days: 5,
    budget: "moderate",
    interests: group?.interests || [],
  });

  const budgetOptions = ["budget", "moderate", "luxury"];

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-bold text-slate-800 font-display">Generate AI Itinerary</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Destination *</label>
          <input className="input-field" placeholder="Paris, France"
            value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} />
        </div>
        <div>
          <label className="label">Number of Days</label>
          <input type="number" className="input-field" min={1} max={14}
            value={form.days} onChange={(e) => setForm((f) => ({ ...f, days: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="label">Budget Level</label>
          <div className="flex gap-2">
            {budgetOptions.map((b) => (
              <button key={b} onClick={() => setForm((f) => ({ ...f, budget: b }))}
                className={clsx("flex-1 py-2.5 rounded-xl text-sm font-medium border-2 capitalize transition-all", form.budget === b
                  ? "border-ocean-500 bg-ocean-50 text-ocean-700"
                  : "border-slate-100 text-slate-500 hover:border-slate-200"
                )}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Group Size</label>
          <input type="number" className="input-field" min={1} max={50}
            defaultValue={group?.members?.length || 4}
            onChange={(e) => setForm((f) => ({ ...f, groupSize: Number(e.target.value) }))} />
        </div>
      </div>
      <button onClick={() => onGenerate(form)} disabled={!form.destination || isGenerating}
        className={clsx("btn-primary mt-5 w-full justify-center text-base py-3",
          isGenerating && "opacity-70 cursor-not-allowed"
        )}>
        {isGenerating ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Generating with Claude AI...</>
        ) : (
          <><Sparkles className="w-5 h-5" /> Generate Itinerary</>
        )}
      </button>
    </div>
  );
}

// ─── Activity Card ────────────────────────────────────────────────────────────
function ActivityCard({ activity }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
      <div className="flex flex-col items-center gap-1 flex-shrink-0 w-14">
        <span className="text-xs font-semibold text-ocean-600 bg-ocean-50 rounded-lg px-1.5 py-1 text-center">{activity.time}</span>
        <div className="w-0.5 flex-1 bg-slate-200 rounded-full" />
      </div>
      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-base">{ACTIVITY_ICONS[activity.type] || "📍"}</span>
            <h4 className="font-semibold text-slate-800 text-sm">{activity.title}</h4>
          </div>
          <span className={clsx("badge text-xs flex-shrink-0", `type-${activity.type}`)}>
            {activity.type}
          </span>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mb-1">{activity.description}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.duration}</span>
          {activity.cost && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{activity.cost}</span>}
        </div>
        {activity.tip && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-2 flex items-start gap-1">
            <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" />{activity.tip}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Day Card ────────────────────────────────────────────────────────────────
function DayCard({ day, isOpen, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1a94e8, #0d5fa5)" }}>
            {day.day}
          </div>
          <div>
            <p className="font-bold text-slate-800 font-display">{day.title}</p>
            <p className="text-xs text-slate-400">{day.activities?.length || 0} activities · {day.theme}</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="border-t border-slate-100">
          {/* Meals */}
          {day.meals && (
            <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-sm text-orange-700">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span className="font-medium">Breakfast:</span> {day.meals.breakfast}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-orange-700">
                <span className="font-medium">Lunch:</span> {day.meals.lunch}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-orange-700">
                <span className="font-medium">Dinner:</span> {day.meals.dinner}
              </div>
            </div>
          )}

          <div className="px-5 pt-3 pb-1">
            {day.activities?.map((act, i) => <ActivityCard key={i} activity={act} />)}
          </div>

          {/* Accommodation */}
          {day.accommodation && (
            <div className="mx-5 mb-4 p-3 bg-purple-50 rounded-xl flex items-start gap-2">
              <Bed className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-800">{day.accommodation.name}</p>
                <p className="text-xs text-purple-600">{day.accommodation.note}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Packing Tab ──────────────────────────────────────────────────────────────
function PackingTab({ group }) {
  const [packingList, setPackingList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState({});

  const generate = async () => {
    setLoading(true);
    try {
      const res = await aiApi.packingList({
        destination: group.destinations?.[0] || "Unknown",
        days: 7,
        groupSize: group.members.length || 4,
        activities: group.interests || [],
      });
      setPackingList(res.data);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (cat, item) => {
    const key = `${cat}:${item}`;
    setChecked((c) => ({ ...c, [key]: !c[key] }));
  };

  return (
    <div className="space-y-4">
      {!packingList ? (
        <div className="card p-10 text-center">
          <Package className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 mb-2">AI Packing List</h3>
          <p className="text-slate-500 text-sm mb-5">Get a smart packing list tailored to your destination and activities.</p>
          <button onClick={generate} disabled={loading} className="btn-primary mx-auto">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Packing List</>}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="section-title">Packing List 🎒</h3>
            <button onClick={() => setPackingList(null)} className="btn-ghost text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </button>
          </div>
          {packingList.categories?.map((cat) => (
            <div key={cat.name} className="card p-5">
              <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="text-xl">{cat.emoji}</span> {cat.name}
                <span className="text-xs text-slate-400 font-normal ml-auto">
                  {cat.items.filter((item) => checked[`${cat.name}:${item.item}`]).length}/{cat.items.length} packed
                </span>
              </h4>
              <div className="space-y-2">
                {cat.items.map((item) => {
                  const key = `${cat.name}:${item.item}`;
                  const isDone = checked[key];
                  return (
                    <div key={item.item} onClick={() => toggle(cat.name, item.item)}
                      className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      {isDone
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        : <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />}
                      <div className={clsx("flex-1", isDone && "opacity-50 line-through")}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">{item.item}</span>
                          {item.essential && <span className="badge badge-coral text-xs">Essential</span>}
                        </div>
                        {item.notes && <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>}
                      </div>
                      {item.quantity && <span className="text-xs text-slate-400">{item.quantity}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {packingList.groupItems?.length > 0 && (
            <div className="card p-5">
              <h4 className="font-bold text-slate-700 mb-3">👫 Group Items (1 per group)</h4>
              <div className="flex flex-wrap gap-2">
                {packingList.groupItems.map((item) => (
                  <span key={item} className="badge badge-blue">{item}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Budget Tab ───────────────────────────────────────────────────────────────
function BudgetTab({ group }) {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalBudget, setTotalBudget] = useState(group?.budget?.total || "");
  const [days, setDays] = useState(7);

  const generate = async () => {
    if (!totalBudget) return;
    setLoading(true);
    try {
      const res = await aiApi.budgetBreakdown({
        destination: group.destinations?.[0] || "Unknown",
        days,
        groupSize: group.members.length || 4,
        totalBudget: Number(totalBudget),
        currency: group.budget?.currency || "USD",
        lifestyle: "moderate",
      });
      setBudget(res.data);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    accommodation: "bg-blue-400", food: "bg-orange-400",
    activities: "bg-purple-400", transport: "bg-emerald-400",
    shopping: "bg-pink-400", emergency: "bg-slate-400",
  };

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h3 className="font-bold text-slate-800 mb-4 font-display">Budget Calculator</h3>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="label">Total Budget ({group?.budget?.currency || "USD"})</label>
            <input type="number" className="input-field" placeholder="5000" value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)} />
          </div>
          <div>
            <label className="label">Trip Duration (days)</label>
            <input type="number" className="input-field" min={1} value={days}
              onChange={(e) => setDays(Number(e.target.value))} />
          </div>
          <div className="flex items-end">
            <button onClick={generate} disabled={!totalBudget || loading} className="btn-primary w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><DollarSign className="w-4 h-4" /> Analyze Budget</>}
            </button>
          </div>
        </div>
      </div>

      {budget && (
        <>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: "Per Person", value: `${group?.budget?.currency || "USD"} ${Number(budget.perPerson).toLocaleString()}`, color: "from-ocean-500 to-ocean-700" },
              { label: "Budget Rating", value: budget.budgetRating?.toUpperCase(), color: "from-emerald-500 to-emerald-700" },
              { label: "Per Day", value: `${group?.budget?.currency || "USD"} ${Math.round(Number(totalBudget) / days).toLocaleString()}`, color: "from-purple-500 to-purple-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-2xl p-4 bg-gradient-to-br ${color} text-white`}>
                <p className="text-white/70 text-sm">{label}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h4 className="font-bold text-slate-700 mb-4">Spending Breakdown</h4>
            <div className="space-y-3">
              {Object.entries(budget.breakdown || {}).map(([key, val]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-600 capitalize">{key}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800">{group?.budget?.currency || "USD"} {Number(val.total).toLocaleString()}</span>
                      <span className="text-xs text-slate-400 ml-2">({val.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${COLORS[key] || "bg-slate-400"}`}
                      style={{ width: `${val.percentage}%` }} />
                  </div>
                  {val.suggestion && <p className="text-xs text-slate-400 mt-1">{val.suggestion}</p>}
                </div>
              ))}
            </div>
          </div>

          {budget.savingTips?.length > 0 && (
            <div className="card p-5">
              <h4 className="font-bold text-slate-700 mb-3">💡 Money-Saving Tips</h4>
              <ul className="space-y-2">
                {budget.savingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5">✓</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Itinerary Page ──────────────────────────────────────────────────────
export default function ItineraryPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "itinerary");
  const [itinerary, setItinerary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openDays, setOpenDays] = useState([1]);
  const { currentGroup, fetchGroup, saveItinerary, fetchItinerary } = useTravelContext();

  useEffect(() => {
    fetchGroup(id);
    fetchItinerary(id).then((it) => { if (it) setItinerary(it); });
  }, [id, fetchGroup, fetchItinerary]);

  const group = currentGroup?.id === id ? currentGroup : null;

  const handleGenerate = (form) => {
    setIsGenerating(true);
    setItinerary(null);

    aiApi.generateItinerary(
      { groupId: id, ...form, groupSize: group?.members?.length || form.groupSize || 4 },
      () => {},
      async (fullItinerary) => {
        setItinerary(fullItinerary);
        setIsGenerating(false);
        setOpenDays([1]);
        if (group) await saveItinerary(id, fullItinerary);
      },
      (err) => {
        console.error(err);
        setIsGenerating(false);
      }
    );
  };

  const toggleDay = (dayNum) => {
    setOpenDays((d) => d.includes(dayNum) ? d.filter((n) => n !== dayNum) : [...d, dayNum]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link to={`/groups/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to {group?.name || "Group"}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title text-3xl">Trip Planner</h1>
          {group && <p className="section-subtitle">{group.name}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button key={tabId} onClick={() => setActiveTab(tabId)}
            className={clsx("flex items-center gap-2 flex-1 justify-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all",
              activeTab === tabId ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Itinerary Tab */}
      {activeTab === "itinerary" && (
        <div className="space-y-4">
          {!itinerary && (
            <GenerateForm group={group} onGenerate={handleGenerate} isGenerating={isGenerating} />
          )}

          {isGenerating && (
            <div className="card p-10 text-center animate-pulse-slow">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
              <p className="font-bold text-slate-700 mb-1">Claude is crafting your perfect itinerary...</p>
              <p className="text-slate-400 text-sm">This usually takes 15–30 seconds</p>
            </div>
          )}

          {itinerary && !isGenerating && (
            <>
              {/* Summary Card */}
              <div className="rounded-2xl p-6 text-white mb-4"
                style={{ background: "linear-gradient(135deg, #0a1628, #1e3a5f)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-ocean-300 text-sm font-semibold uppercase tracking-wide mb-1">📍 {itinerary.destination}</p>
                    <p className="text-white/80 text-sm max-w-lg">{itinerary.summary}</p>
                  </div>
                  <button onClick={() => { setItinerary(null); }} className="btn-ghost text-white border-white/20 bg-white/10 hover:bg-white/20 text-xs">
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {itinerary.highlights?.map((h) => (
                    <span key={h} className="px-3 py-1 bg-white/10 rounded-xl text-sm text-white/90">⭐ {h}</span>
                  ))}
                </div>
              </div>

              {/* Cost Overview */}
              {itinerary.estimatedCosts && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
                  {Object.entries(itinerary.estimatedCosts).map(([key, val]) => (
                    <div key={key} className="card p-3 text-center">
                      <p className="text-xs text-slate-400 capitalize">{key}</p>
                      <p className="font-bold text-slate-700 text-sm mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Day-by-Day */}
              <div className="space-y-3">
                {itinerary.days?.map((day) => (
                  <DayCard key={day.day} day={day}
                    isOpen={openDays.includes(day.day)}
                    onToggle={() => toggleDay(day.day)} />
                ))}
              </div>

              {/* Tips */}
              {itinerary.tips?.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Insider Tips
                  </h3>
                  <ul className="space-y-2">
                    {itinerary.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-ocean-400 font-bold">{i + 1}.</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "packing" && group && <PackingTab group={group} />}
      {activeTab === "budget" && group && <BudgetTab group={group} />}
    </div>
  );
}
