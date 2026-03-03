import { useEffect, useState } from "react";

export default function CountdownTimer({ startTime, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(Math.max(new Date(startTime) - new Date(), 0));

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.max(new Date(startTime) - new Date(), 0);
      setTimeLeft(diff);
      if (diff === 0 && onExpire) onExpire();
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, startTime, onExpire]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <span className="font-mono">
      {timeLeft > 0 ? formatTime(timeLeft) : "Contest Started!"}
    </span>
  );
}
