import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

type PlayerProfile = {
  id: string;
  name: string;
  level: number;
  xp: number;
};

function useTg() {
  return useMemo(() => {
    const tg = window?.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    return {
      tg,
      initData: tg?.initData || "",
      firstName: user?.first_name ?? "Путник",
    };
  }, []);
}

export default function App() {
  const { tg, initData, firstName } = useTg();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.("secondary_bg_color");

    // Отправляем initData на сервер
    if (initData) {
      axios
        .post("/api/auth", { initData })
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => {
          console.error("Auth error:", err);
        });
    }
  }, [tg, initData]);

  return (
    <div className="w-full h-[100dvh] flex items-center justify-center">
      <div className="w-[100vw] h-[100dvh] max-w-[480px] bg-[#121720] text-white flex flex-col items-center justify-center px-4">
        <motion.img
          src="/logo.png" // можно заменить позже
          alt="HearthFolk"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 mb-4"
        />
        <motion.h1
          className="text-2xl font-bold text-center"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Добро пожаловать, {profile?.name || firstName}!
        </motion.h1>
        {profile && (
          <p className="mt-2 text-sm opacity-80">
            Уровень: {profile.level} • Опыт: {profile.xp}
          </p>
        )}
        <button
          onClick={() => tg?.HapticFeedback?.impactOccurred?.("medium")}
          className="mt-6 px-5 py-3 rounded-xl bg-emerald-600 active:scale-95 transition"
        >
          Начать
        </button>
      </div>
    </div>
  );
}
