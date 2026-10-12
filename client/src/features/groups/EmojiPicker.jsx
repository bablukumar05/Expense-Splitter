import { cn } from "@/lib/cn";
import { GROUP_EMOJIS } from "@/lib/constants";

export default function EmojiPicker({ value, onPick }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-ink/90">Icon</legend>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
        {GROUP_EMOJIS.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={value === item}
            aria-label={`Use ${item} icon`}
            onClick={() => onPick(item)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-xl border text-xl transition",
              value === item ? "border-brand bg-brand/20" : "border-line bg-white/5 hover:bg-white/10"
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
