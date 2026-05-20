"use client";

import { useEffect, useState } from "react";
import Toggle from "@/components/ui/Toggle";

export default function PreferencesCard() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    try {
      setNotifications(window.localStorage.getItem("sc_notifications") !== "0");
      setDarkMode(window.localStorage.getItem("sc_theme") === "dark");
    } catch {}
  }, []);

  const setTheme = (isDark: boolean) => {
    setDarkMode(isDark);
    try {
      window.localStorage.setItem("sc_theme", isDark ? "dark" : "light");
    } catch {}
    document.documentElement.classList.toggle("dark", isDark);
  };

  const setNotif = (enabled: boolean) => {
    setNotifications(enabled);
    try {
      window.localStorage.setItem("sc_notifications", enabled ? "1" : "0");
    } catch {}
  };

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Preferencias</div>
      <div className="mt-4 space-y-4">
        <Toggle checked={notifications} onChange={setNotif} label="Notificaciones" />
        <Toggle checked={darkMode} onChange={setTheme} label="Modo oscuro" />
      </div>
    </div>
  );
}

