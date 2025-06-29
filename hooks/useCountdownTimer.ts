import { useCallback, useEffect, useRef, useState } from 'react';

export function useCountdownTimer(
  initialTime = 30,
  onTimeOver?: () => void
) {
  const [time, setTime] = useState(initialTime);
  const timeRef = useRef(initialTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  const start = useCallback(() => {
    if (timerRef.current !== null) return;

    timerRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          stop();
          onTimeOver?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onTimeOver]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback((newTime = initialTime) => {
    stop();
    setTime(newTime);
    timeRef.current = newTime;
  }, [initialTime, stop]);

  const increase = useCallback((amount: number) => {
    setTime(prev => {
      const updated = prev + amount;
      timeRef.current = updated;
      return updated;
    });
  }, []);

  const getTime = () => timeRef.current;

  return {
    time,
    start,
    stop,
    reset,
    increase,
    getTime,
  };
}
