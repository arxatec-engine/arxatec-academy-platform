import { useCallback, useEffect, useState } from "react";

const SECOND_IN_MS = 1000;

const remainingSeconds = (deadline: number): number =>
  Math.max(0, Math.ceil((deadline - Date.now()) / SECOND_IN_MS));

export interface Countdown {
  seconds: number;
  isRunning: boolean;
  start: (seconds: number) => void;
}

export const useCountdown = (): Countdown => {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (deadline === null) return;

    const tick = (): void => {
      const remaining = remainingSeconds(deadline);
      setSeconds(remaining);
      if (remaining === 0) setDeadline(null);
    };

    tick();
    const timer = window.setInterval(tick, SECOND_IN_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [deadline]);

  const start = useCallback((value: number) => {
    const total = value > 0 ? Math.ceil(value) : 0;
    setSeconds(total);
    setDeadline(total > 0 ? Date.now() + total * SECOND_IN_MS : null);
  }, []);

  return { seconds, isRunning: seconds > 0, start };
};
