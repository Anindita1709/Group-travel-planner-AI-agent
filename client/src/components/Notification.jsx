import { CheckCircle, AlertCircle, X } from "lucide-react";
import { useTravelContext } from "../context/TravelContext";
import clsx from "clsx";

export default function Notification() {
  const { notification, notify } = useTravelContext();

  if (!notification) return null;

  const isError = notification.type === "error";

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-up">
      <div
        className={clsx(
          "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border min-w-[280px] max-w-sm",
          isError
            ? "bg-red-50 border-red-100 text-red-800"
            : "bg-white border-slate-100 text-slate-800"
        )}
      >
        {isError ? (
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        )}
        <p className="text-sm font-medium flex-1">{notification.message}</p>
        <button
          onClick={() => notify("", "clear")}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
