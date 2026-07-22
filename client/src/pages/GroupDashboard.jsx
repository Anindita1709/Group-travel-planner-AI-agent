import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin, Users, Calendar, DollarSign, Copy, Hash, Map,
  UserPlus, Trash2, ChevronRight, Bot, Vote, Package, BarChart3, Send, X, Crown
} from "lucide-react";
import { useTravelContext } from "../context/TravelContext";
import { groupsApi, aiApi } from "../services/api";
import clsx from "clsx";

// ─── Members Panel ────────────────────────────────────────────────────────────
function MembersPanel({ group, onAddMember }) {
  const { removeMember, notify } = useTravelContext();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAddMember(form);
      setForm({ name: "", email: "" });
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    notify("Invite code copied! 📋");
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 font-display flex items-center gap-2">
          <Users className="w-4 h-4 text-ocean-500" /> Members ({group.members.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-ghost text-xs py-1.5 px-3">
          <UserPlus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Invite Code */}
      <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium">Invite Code</p>
          <p className="font-mono font-bold text-slate-700 text-lg tracking-widest">{group.inviteCode}</p>
        </div>
        <button onClick={copyCode} className="btn-ghost text-xs py-1.5 px-3">
          <Copy className="w-3.5 h-3.5" /> Copy
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 p-3 bg-ocean-50 rounded-xl space-y-2">
          <input className="input-field text-sm py-2" placeholder="Name" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <input type="email" className="input-field text-sm py-2" placeholder="Email" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-xs py-1.5 flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary text-xs py-1.5 flex-1">
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {group.members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: `hsl(${member.name.charCodeAt(0) * 15}, 60%, 45%)` }}>
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate flex items-center gap-1">
                {member.name}
                {member.role === "organizer" && <Crown className="w-3.5 h-3.5 text-amber-500" />}
              </p>
              <p className="text-xs text-slate-400 truncate">{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Voting Panel ─────────────────────────────────────────────────────────────
function VotingPanel({ group }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [voterId] = useState(() => `voter_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (group.destinations?.length > 1) {
      groupsApi.getVotes(group.id).then((r) => setPoll(r.data)).catch(() => {});
    }
  }, [group]);

  const handleVote = async (destination) => {
    setLoading(true);
    try {
      const r = await groupsApi.castVote(group.id, { destination, voterId });
      setPoll(r.data);
    } finally {
      setLoading(false);
    }
  };

  if (!poll || group.destinations?.length < 2) return null;

  const totalVotes = poll.destinations.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="card p-5">
      <h3 className="font-bold text-slate-800 font-display flex items-center gap-2 mb-4">
        <Vote className="w-4 h-4 text-purple-500" /> Vote for Destination
      </h3>
      <div className="space-y-3">
        {poll.destinations.map((dest) => {
          const pct = totalVotes > 0 ? Math.round((dest.count / totalVotes) * 100) : 0;
          const myVote = dest.votes.includes(voterId);
          return (
            <button key={dest.name} onClick={() => handleVote(dest.name)} disabled={loading}
              className={clsx("w-full text-left p-3 rounded-xl border-2 transition-all", myVote
                ? "border-ocean-500 bg-ocean-50" : "border-slate-100 hover:border-ocean-200 bg-white"
              )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-coral-500" />
                  {dest.name}
                  {myVote && <span className="badge badge-blue text-xs">Your vote</span>}
                </span>
                <span className="text-sm font-bold text-ocean-600">{dest.count} vote{dest.count !== 1 ? "s" : ""}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-ocean-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{pct}%</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── AI Chat Panel ────────────────────────────────────────────────────────────
function AIChatPanel({ group }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hey! I'm your AI travel assistant for "${group.name}" 🗺️ Ask me anything about destinations, local tips, budget hacks, or cultural insights!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const context = messages.slice(-6).filter((m) => m.role !== "assistant" || messages.indexOf(m) !== 0);
      const res = await aiApi.chat({ message: userMsg.content, groupId: group.id, context });
      setMessages((m) => [...m, { role: "assistant", content: res.data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I ran into an error. Please check your API key." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex flex-col" style={{ height: "400px" }}>
      <div className="flex items-center gap-2 p-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-ocean-500 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">AI Travel Assistant</p>
          <p className="text-xs text-emerald-500 font-medium">● Online</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
        {messages.map((msg, i) => (
          <div key={i} className={clsx("flex gap-2", msg.role === "user" && "flex-row-reverse")}>
            <div className={clsx("max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
              msg.role === "assistant"
                ? "bg-slate-50 text-slate-700 rounded-tl-sm"
                : "bg-ocean-500 text-white rounded-tr-sm ml-auto"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-slate-100 flex gap-2">
        <input className="input-field text-sm py-2 flex-1" placeholder="Ask anything about your trip..."
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
        <button onClick={sendMessage} disabled={!input.trim() || loading} className="btn-primary px-3 py-2">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function GroupDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentGroup, loading, fetchGroup, updateGroup, addMember, deleteGroup, notify } = useTravelContext();

  useEffect(() => {
    fetchGroup(id);
  }, [id, fetchGroup]);

  const group = currentGroup?.id === id ? currentGroup : null;

  const handleDeleteGroup = async () => {
    if (!window.confirm("Delete this trip permanently?")) return;
    await deleteGroup(id);
    navigate("/");
  };

  if (loading.group) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <div className="skeleton h-40 rounded-3xl" />
        <div className="grid lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Trip not found</h2>
        <p className="text-slate-500 mb-6">This trip may have been deleted or doesn't exist.</p>
        <Link to="/" className="btn-primary">Back to My Trips</Link>
      </div>
    );
  }

  const tripDays = group.startDate && group.endDate
    ? Math.ceil((new Date(group.endDate) - new Date(group.startDate)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-8 p-7 md:p-10"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 60%, #0d5fa5 100%)" }}>
        <div className="hero-glow bg-ocean-400 -top-20 right-20" style={{ opacity: 0.1 }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className={clsx("badge mb-2", group.status === "confirmed" ? "badge-green" : "badge-amber")}>
                {group.status}
              </span>
              <h1 className="text-2xl md:text-4xl font-bold text-white font-display mb-2">{group.name}</h1>
              {group.description && <p className="text-slate-300 text-sm md:text-base max-w-lg">{group.description}</p>}
              <div className="flex flex-wrap gap-3 mt-4">
                {group.destinations?.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white/90 rounded-xl text-sm">
                    <MapPin className="w-3.5 h-3.5 text-coral-400" /> {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateGroup(id, { status: group.status === "planning" ? "confirmed" : "planning" })}
                className="btn-ghost text-xs">
                {group.status === "planning" ? "Mark Confirmed" : "Back to Planning"}
              </button>
              <button onClick={handleDeleteGroup} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-900/30 transition-colors text-sm">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: Users, label: "Members", value: group.members.length, color: "text-ocean-300" },
              { icon: MapPin, label: "Destinations", value: group.destinations?.length || 0, color: "text-coral-400" },
              { icon: Calendar, label: "Days", value: tripDays ? `${tripDays}d` : "TBD", color: "text-purple-300" },
              { icon: DollarSign, label: "Budget", value: group.budget?.total ? `${group.budget.currency} ${Number(group.budget.total).toLocaleString()}` : "TBD", color: "text-emerald-300" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <Icon className={`w-4 h-4 mb-1 ${color}`} />
                <p className="text-white font-bold text-lg">{value}</p>
                <p className="text-slate-400 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          {
            icon: Map, label: "View Itinerary", desc: "AI-generated day plan",
            color: "from-ocean-500 to-ocean-700", action: () => navigate(`/groups/${id}/itinerary`),
          },
          {
            icon: Bot, label: "Generate Itinerary", desc: "Let AI plan your trip",
            color: "from-purple-500 to-purple-700", action: () => navigate(`/groups/${id}/itinerary`),
          },
          {
            icon: Package, label: "Packing List", desc: "Smart AI suggestions",
            color: "from-emerald-500 to-emerald-700", action: () => navigate(`/groups/${id}/itinerary?tab=packing`),
          },
          {
            icon: BarChart3, label: "Budget Breakdown", desc: "Split costs easily",
            color: "from-coral-500 to-coral-600", action: () => navigate(`/groups/${id}/itinerary?tab=budget`),
          },
        ].map(({ icon: Icon, label, desc, color, action }) => (
          <button key={label} onClick={action}
            className="card p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold text-slate-800 text-sm">{label}</p>
            <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
            <ChevronRight className="w-4 h-4 text-slate-300 mt-2 group-hover:text-ocean-500 transition-colors" />
          </button>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <VotingPanel group={group} />
          <AIChatPanel group={group} />
        </div>
        <div>
          <MembersPanel group={group} onAddMember={(data) => addMember(id, data)} />
        </div>
      </div>
    </div>
  );
}
