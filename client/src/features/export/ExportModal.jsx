import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { exportApi } from "@/api/export";
import { getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import { CATEGORIES } from "@/lib/constants";

const FORMAT_OPTIONS = [
  { value: "csv", label: "CSV Spreadsheet", icon: FileSpreadsheet },
  { value: "pdf", label: "PDF Report", icon: FileText },
];

export default function ExportModal({ open, onClose, group }) {
  const [format, setFormat] = useState("csv");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [category, setCategory] = useState("");
  const [member, setMember] = useState("");
  const [downloading, setDownloading] = useState(false);

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...CATEGORIES.map((c) => ({ value: c.value, label: `${c.emoji} ${c.label}` })),
  ];

  const memberOptions = [
    { value: "", label: "All members" },
    ...(group?.members || []).map((m) => ({
      value: m._id,
      label: m.isActive ? m.name : `${m.name} (left)`,
    })),
  ];

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    try {
      const params = { format };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (category) params.category = category;
      if (member) params.member = member;

      await exportApi.download(group._id, params, group.name);
      toast.success(
        format === "pdf" ? "PDF report downloaded" : "CSV spreadsheet downloaded"
      );
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export Expenses"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={downloading}>
            Cancel
          </Button>
          <Button onClick={handleDownload} loading={downloading}>
            <Download className="size-4" />
            Download {format.toUpperCase()}
          </Button>
        </>
      }
    >
      <form onSubmit={handleDownload} className="space-y-4 pt-1">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
            Export Format
          </label>
          <SegmentedControl
            options={FORMAT_OPTIONS}
            value={format}
            onChange={setFormat}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="From date (optional)"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label="To date (optional)"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <Select
          label="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>

        <Select
          label="Filter by member (optional)"
          value={member}
          onChange={(e) => setMember(e.target.value)}
        >
          {memberOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  );
}
