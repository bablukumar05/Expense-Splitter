import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info); // baad mein yahan Sentry jaisa tool laga sakte ho
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <EmptyState
          icon={AlertTriangle}
          title="Something went wrong"
          description="An unexpected error occurred. Reloading usually fixes it."
          action={<Button onClick={() => window.location.reload()}>Reload page</Button>}
        />
      </main>
    );
  }
}
