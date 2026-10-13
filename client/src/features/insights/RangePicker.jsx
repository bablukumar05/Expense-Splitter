import { Input } from "@/components/ui/Input";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { todayInputValue } from "@/lib/format";
import { RANGE_PRESETS } from "./range";

export default function RangePicker({ preset, onPresetChange, custom, onCustomChange, error }) {
  const today = todayInputValue();

  return (
    <div className="space-y-3">
      <SegmentedControl
        label="Date range"
        value={preset}
        onChange={onPresetChange}
        options={RANGE_PRESETS.map(({ value, label }) => ({ value, label }))}
      />

      {preset === "custom" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            type="date"
            label="From"
            max={custom.to || today}
            value={custom.from}
            onChange={(e) => onCustomChange({ ...custom, from: e.target.value })}
          />
          <Input
            type="date"
            label="To"
            min={custom.from || undefined}
            max={today}
            value={custom.to}
            onChange={(e) => onCustomChange({ ...custom, to: e.target.value })}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-bad">
          {error}
        </p>
      )}
    </div>
  );
}
