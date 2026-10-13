import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function DesignPreview() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-xl font-bold">Design Preview</h1>
      <Card className="space-y-3">
        <p className="text-sm text-muted">Preview of buttons, cards, and theme colors.</p>
        <div className="flex gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>
    </div>
  );
}
