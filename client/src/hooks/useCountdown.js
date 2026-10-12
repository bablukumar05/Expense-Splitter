import { useEffect, useState } from "react";

export function useCountdown() {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const id = setTimeout(() => setRemaining((seconds) => seconds - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  return [remaining, setRemaining];
}
