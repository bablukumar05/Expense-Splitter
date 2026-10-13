import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setMessage(document.title), 250);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
