import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import { downloadGroupExport } from "@/api/exports";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { saveBlob, safeFilename } from "@/lib/download";
import { formatDay } from "@/lib/format";

export default function ExportCard({ group, range, category, disabled }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const run = async (format) => {
    if (!range || busy) return;
    setBusy(format);
    setError("");

    try {
      const { blob, filename } = await downloadGroupExport(group._id, { format, ...range, category });
      if (!blob || blob.size === 0) throw new Error("The export file was empty.");
      saveBlob(blob, safeFilename(filename, `${group.name}-expenses-${range.to}`, format));
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (err) {
      const message = getErrorMessage(err, err?.message);
      setError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">Export</h2>
      <p className="text-sm text-muted">
        Download the expenses {range ? ` from ${formatDay(range.from)} to ${formatDay(range.to)}` : ""}{" "}
        {category ? " in the selected category" : ""}.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="secondary"
          onClick={() => run("csv")}
          loading={busy === "csv"}
          disabled={disabled || Boolean(busy)}
        >
          <FileSpreadsheet className="size-4" /> Download CSV
        </Button>
        <Button
          variant="secondary"
          onClick={() => run("pdf")}
          loading={busy === "pdf"}
          disabled={disabled || Boolean(busy)}
        >
          <FileText className="size-4" /> Download PDF summary
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-bad">
          {error}
        </p>
      )}

      <p className="text-xs text-muted">
        CSV opens in Excel or Google Sheets. The PDF has totals, balances and the settle-up plan. Very large
        ranges may be refused: choose a shorter range.
      </p>
    </Card>
  );
}
