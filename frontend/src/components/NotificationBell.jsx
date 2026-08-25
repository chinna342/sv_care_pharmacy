import { useState } from "react";

export default function NotificationBell({
  notifications = [],
  onMarkAllRead,
  onNotificationClick,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-emerald-500 transition active:scale-95 shadow-2xs"
        title="In-App Notifications"
      >
        <span className="text-sm">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl z-50 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && onMarkAllRead && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="text-[11px] font-bold text-emerald-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-50">
              {notifications.map((notif, idx) => (
                <div
                  key={notif.id || idx}
                  onClick={() => {
                    if (onNotificationClick) onNotificationClick(notif);
                    setIsOpen(false);
                  }}
                  className={`p-2.5 rounded-2xl cursor-pointer transition ${
                    notif.is_read
                      ? "bg-slate-50/50 hover:bg-slate-100/70 text-slate-600"
                      : "bg-emerald-50/60 border border-emerald-200/60 hover:bg-emerald-100/50 text-slate-900 font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800 text-xs line-clamp-1">{notif.title}</p>
                    <span className="text-[10px] text-slate-400">
                      {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{notif.message}</p>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No notifications yet. You will receive live fulfillment alerts here!
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
