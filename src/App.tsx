import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";

function useTg() {
  return useMemo(() => {
    const tg = window?.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    return {
      tg,
      firstName: user?.first_name ?? "Путник",
    };
  }, []);
}

export default function App() {
  const { tg, firstName } = useTg();

  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.("secondary_bg_color");
  }, [tg]);

  return (
    <div className="w-full h-[100dvh] flex items-center justify-center">
      <div className="w-[100vw] h-[100dvh] max-w-[480px] bg-[#121720] text-white flex flex-col items-center justify-center px-4">
        <motion.img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Fire_icon.svg/240px-Fire_icon.svg.png"
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
          Добро пожаловать, {firstName}!
        </motion.h1>
        <p className="text-center text-sm opacity-80 mt-2">
          Вертикальная карточная игра в стиле русских сказок
        </p>

        <button
          onClick={() => tg?.HapticFeedback?.impactOccurred?.("medium")}
          className="mt-6 px-5 py-3 rounded-xl bg-emerald-600 active:scale-95 transition"
        >
          Начать
        </button>

        <div className="mt-6 text-xs opacity-70">
          Telegram Mini App • портрет
        </div>
      </div>
    </div>
  );
}
