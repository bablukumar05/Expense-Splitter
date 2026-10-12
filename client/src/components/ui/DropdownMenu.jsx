import { useCallback, useEffect, useId, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/cn";

export default function DropdownMenu({ label = "More options", items, className }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const visibleItems = items.filter((item) => !item.hidden);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) close(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) menuRef.current?.querySelector('[role="menuitem"]')?.focus();
  }, [open]);

  if (visibleItems.length === 0) return null;

  const toggle = () => {
    if (!open) {
      const rect = buttonRef.current.getBoundingClientRect();
      const needed = visibleItems.length * 44 + 16;

      const below = window.innerHeight - rect.bottom - 72;
      setOpenUp(below < needed && rect.top > below);
    }
    setOpen((value) => !value);
  };

  const onMenuKeyDown = (event) => {
    const nodes = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const index = nodes.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      nodes[(index + 1) % nodes.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      nodes[(index - 1 + nodes.length) % nodes.length]?.focus();
    } else if (event.key === "Tab") {
      close(false);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
        className="inline-flex size-11 items-center justify-center rounded-xl text-muted transition hover:bg-white/5 hover:text-ink"
      >
        <EllipsisVertical className="size-5" />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={cn(
            "absolute right-0 z-30 min-w-56 animate-fade-in rounded-2xl border border-line bg-canvas-2 p-1.5 shadow-2xl",
            openUp ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          {visibleItems.map(({ label: itemLabel, icon: Icon, onSelect, tone }) => (
            <button
              key={itemLabel}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                close();
                onSelect();
              }}
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition",
                "hover:bg-white/10 focus-visible:bg-white/10",
                tone === "danger" ? "text-bad" : "text-ink"
              )}
            >
              {Icon && <Icon className="size-4" aria-hidden="true" />}
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
