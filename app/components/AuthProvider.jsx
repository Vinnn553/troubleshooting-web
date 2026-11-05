'use client';

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { Suspense, useEffect, useRef } from "react";

// Komponen pengawas inaktivitas
function IdleTimerWatcher({ timeoutMinutes = 3 }) {
  const { data: session } = useSession();
  const timerRef = useRef(null);

  useEffect(() => {
    // Timer hanya berjalan jika user sedang dalam kondisi login
    if (!session) return;

    const timeoutMs = timeoutMinutes * 60 * 1000; // 3 menit dalam milidetik

    // Fungsi reset hitung mundur
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        // Otomatis logout dan arahkan kembali ke login
        signOut({ callbackUrl: "/login" });
      }, timeoutMs);
    };

    // Daftar aktivitas user yang dipantau
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Daftarkan event listener
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Jalankan timer saat pertama kali halaman dimuat
    resetTimer();

    // Bersihkan listener jika user logout atau halaman ditutup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [session, timeoutMinutes]);

  return null;
}

export default function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <Suspense>
      <IdleTimerWatcher timeoutMinutes={3} />
      {children}
      </Suspense>
    </SessionProvider>
  );
}