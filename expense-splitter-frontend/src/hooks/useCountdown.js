import { useEffect, useState } from "react";

// const [remaining, start] = useCountdown(); start(30) => 30, 29, ... 0
export function useCountdown() {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const id = setTimeout(() => setRemaining((seconds) => seconds - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  return [remaining, setRemaining];
}
