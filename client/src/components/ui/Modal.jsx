import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export default function Modal({ open, onClose, title, children, footer, className }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();

      dialog.querySelector("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleFocus = (e) => {
    if (e.target.matches("input, textarea, select")) {
      setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={() => open && onClose()}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby={titleId}
      aria-modal="true"
      className={cn(
        "mx-auto mb-0 mt-auto w-full max-w-none rounded-t-3xl border border-line bg-canvas-2 p-0 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm open:animate-sheet-in sm:my-auto sm:max-w-lg sm:rounded-3xl",
        className
      )}
    >
      <div className="safe-bottom max-h-[88dvh] overflow-y-auto" onFocus={handleFocus}>
        <div className="sticky top-0 z-10 bg-canvas-2/95 px-5 pb-3 pt-2 backdrop-blur sm:pt-5">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex size-11 items-center justify-center rounded-xl text-muted transition hover:bg-white/5 hover:text-ink"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
        <div className="px-5 pb-5">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 px-5 pb-5 sm:flex-row sm:justify-end">{footer}</div>
        )}
      </div>
    </dialog>
  );
}
