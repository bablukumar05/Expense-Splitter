import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import { buttonStyles } from "@/components/ui/button-styles";
import EmptyState from "@/components/ui/EmptyState";

const CHUNK_ERROR =
  /dynamically imported module|Importing a module script failed|Failed to fetch dynamically|Loading chunk|error loading dynamically/i;

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    const stale = CHUNK_ERROR.test(String(error?.message ?? ""));

    const title = offline
      ? "You're offline"
      : stale
      ? "A new version is available"
      : "Something went wrong";

    const description = offline
      ? "Reconnect to the internet, then reload the page."
      : stale
      ? "The app was updated. Reload to get the latest version."
      : "An unexpected error occurred. Reloading usually fixes it.";

    const content = (
      <EmptyState
        icon={AlertTriangle}
        title={title}
        description={description}
        action={
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => window.location.reload()}>Reload page</Button>
              <a href="/" className={buttonStyles({ variant: "secondary" })}>
                Go home
              </a>
            </div>
            {error && (
              <div className="mt-3 max-w-xl text-left bg-black/60 p-3 rounded-xl border border-rose-500/20 text-rose-300 text-xs font-mono">
                <p className="font-bold">{String(error?.message || error)}</p>
                {error?.stack && <pre className="mt-1 text-[10px] text-rose-400/70 overflow-x-auto max-h-40">{error.stack}</pre>}
              </div>
            )}
          </div>
        }
      />
    );

    return this.props.inline ? (
      <div className="py-6">{content}</div>
    ) : (
      <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">{content}</main>
    );
  }
}
