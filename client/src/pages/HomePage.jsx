import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Users, MapPin, Calendar, Hash, ArrowRight, Plane, Globe2, Sparkles } from "lucide-react";
import { useTravelContext } from "../context/TravelContext";
import { groupsApi } from "../services/api";
import clsx from "clsx";

const STATUS_BADGE = {
  planning: { label: "Planning", class: "badge-amber" },
  confirmed: { label: "Confirmed", class: "badge-green" },
  completed: { label: "Completed", class: "badge-blue" },
};

function GroupCard({ group }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/groups/${group.id}`)}
      className="card p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-slate-100 hover:border-ocean-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx("badge", STATUS_BADGE[group.status]?.class)}>
              {STATUS_BADGE[group.status]?.label}
            </span>
          </div>
          <h3 className="font-bold text-slate-800 text-lg font-display group-hover:text-ocean-600 transition-colors truncate">
            {group.name}
          </h3>
          {group.description && (
            <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">{group.description}</p>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-ocean-500 transition-colors flex-shrink-0 mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {group.destinations?.length > 0 && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-coral-500 flex-shrink-0" />
            <span className="text-sm text-slate-600 truncate">
              {group.destinations.join(", ")}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-ocean-500 flex-shrink-0" />
          <span className="text-sm text-slate-600">
            {group.members.length} {group.members.length === 1 ? "member" : "members"}
          </span>
        </div>
        {(group.startDate || group.endDate) && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="text-sm text-slate-600 truncate">
              {group.startDate ? new Date(group.startDate).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
              {" → "}
              {group.endDate ? new Date(group.endDate).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-500 font-mono">{group.inviteCode}</span>
        </div>
      </div>
    </div>
  );
}

function JoinModal({ onClose, onJoin }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { joinGroup } = useTravelContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !name || !email) return;
    setLoading(true);
    try {
      const group = await joinGroup(code.trim(), { name, email });
      onClose();
      navigate(`/groups/${group.id}`);
    } catch {
      // error shown via context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="card p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="section-title mb-1">Join a Trip</h2>
        <p className="section-subtitle mb-5">Enter the invite code shared by your travel buddy</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Invite Code</label>
            <input className="input-field font-mono uppercase tracking-widest" placeholder="ABC123" value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} required />
          </div>
          <div>
            <label className="label">Your Name</label>
            <input className="input-field" placeholder="Jane Smith" value={name}
              onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Your Email</label>
            <input className="input-field" type="email" placeholder="jane@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Joining..." : "Join Trip ✈️"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { groups, loading, fetchGroups } = useTravelContext();
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-10 p-8 md:p-12"
        style={{
              backgroundImage: "url('/images/banner.png')",
              backgroundSize: "cover",
              backgroundPosition: "center"
        }}>
        <div className="hero-glow bg-ocean-400 top-0 right-0 translate-x-1/4 -translate-y-1/4" />
        <div className="hero-glow bg-coral-500 bottom-0 left-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-sand-400" />
            <span className="text-sand-200 text-sm font-semibold tracking-wide uppercase">AI-Powered Travel</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-display leading-tight mb-4">
            Plan trips your whole<br />group will love ✈️
          </h1>
          <p className="text-slate-600 text-base md:text-lg max-w-xl mb-8">
            Let AI handle itineraries, budget splitting, and destination ideas — so you can focus on making memories.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/create" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ocean-700 font-bold rounded-2xl hover:bg-sand-50 transition-colors shadow-lg">
              <Plus className="w-5 h-5" />
              Create a Trip
            </Link>
            <button onClick={() => setShowJoin(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <Globe2 className="w-5 h-5" />
              Join with Code
            </button>
          </div>
        </div>
        {/* Decorative plane */}
        <Plane className="absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 text-white/5 hidden md:block" />
      </div>

      {/* Groups Grid */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">My Trips</h2>
          <p className="section-subtitle">{groups.length} {groups.length === 1 ? "trip" : "trips"} in progress</p>
        </div>
        <Link to="/create" className="btn-ghost text-sm">
          <Plus className="w-4 h-4" /> New Trip
        </Link>
      </div>

      {loading.groups ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-5 w-2/3 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-ocean-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe2 className="w-8 h-8 text-ocean-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No trips yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Create your first group trip or join one with an invite code.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/create" className="btn-primary">Create a Trip</Link>
            <button onClick={() => setShowJoin(true)} className="btn-ghost">Join with Code</button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {showJoin && <JoinModal onClose={() => setShowJoin(false)} onJoin={() => {}} />}
    </div>
  );
}
