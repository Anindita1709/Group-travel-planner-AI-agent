import { Link, useLocation } from "react-router-dom";
import { Globe, Plus, Compass, Map } from "lucide-react";
import clsx from "clsx";

const navLinks = [
  { to: "/", label: "My Trips", icon: Map },
  { to: "/discover", label: "Discover", icon: Compass },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #1a94e8, #0d5fa5)" }}>
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-slate-800 font-display">Wander</span>
              <span className="font-bold text-xl font-display text-gradient-ocean">Group</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  location.pathname === to
                    ? "bg-ocean-50 text-ocean-700"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <Link to="/create" className="btn-primary">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Trip</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
