import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, CloudOff, WifiOff } from "lucide-react";
import { wakeServer } from "@/api/client";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { getServerState, markWaking, subscribeServerState } from "@/lib/serverStatus";

function useElapsedSeconds(since) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!since) return undefined;
    const tick = () => setSeconds(Math.floor((Date.now() - since) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [since]);

  return seconds;
}

function Pill({ icon, title, text, action }) {
  return (
    <div className="pointer-events-auto glass flex max-w-md items-center gap-3 rounded-2xl px-4 py-2.5 text-sm shadow-lg animate-fade-in">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        {text && <p className="text-xs text-muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export default function ServerStatusBanner() {
  const { status, since } = useSyncExternalStore(subscribeServerState, getServerState);
  const online = useOnlineStatus();
  const elapsed = useElapsedSeconds(status === "waking" ? since : null);

  let pill = null;

  if (!online) {
    pill = (
      <Pill
        icon={<WifiOff className="size-5 text-warn" />}
        title="You're offline"
        text="Reconnect to the internet to continue."
      />
    );
  } else if (status === "down") {
    pill = (
      <Pill
        icon={<CloudOff className="size-5 text-bad" />}
        title="Can't reach the server"
        text="It may be down or restarting."
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              markWaking();
              wakeServer();
            }}
          >
            Retry
          </Button>
        }
      />
    );
  } else if (status === "waking") {
    pill = (
      <Pill
        icon={<Spinner className="size-5 text-violet-300" />}
        title="Waking up the server…"
        text={`Free hosting sleeps when idle, so the first load can take up to a minute.${
          elapsed > 0 ? ` (${elapsed}s)` : ""
        }`}
      />
    );
  } else if (status === "recovered") {
    pill = <Pill icon={<Check className="size-5 text-good" />} title="Server is ready" />;
  }

  if (!pill) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
    >
      {pill}
    </div>
  );
}
