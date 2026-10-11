import { useState } from "react";
import { Mail, Plus, Receipt, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/constants";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import MoneyInput from "@/components/ui/MoneyInput";
import MoneyText from "@/components/ui/MoneyText";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import AppToaster from "@/components/ui/Toaster";

const people = [
  { name: "Bablu Kumar", balance: 1700 },
  { name: "Rahul Sharma", balance: -400 },
  { name: "Priya Singh", balance: -1300 },
  { name: "Aman Verma", balance: 0 },
];

export default function App() {
  const [open, setOpen] = useState(false);
  const [splitType, setSplitType] = useState("EQUAL");
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        {/* Header */}
        <header className="mb-8 flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
            <Wallet className="size-6 text-white" />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-tight sm:text-2xl">
              <span className="text-gradient">{APP_NAME}</span> design preview
            </h1>
            <p className="text-sm text-muted">Mobile-first dark theme</p>
          </div>
        </header>

        {/* Mobile par 1 column, tablet+ par 2 columns */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="mb-3 font-semibold">Buttons</h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast.success("Expense added")}>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Delete</Button>
              <Button loading>Saving</Button>
              <Button size="sm">Small</Button>
              <Button size="icon" aria-label="Add">
                <Plus className="size-5" />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="brand">Admin</Badge>
              <Badge tone="good">Settled</Badge>
              <Badge tone="bad">You owe</Badge>
              <Badge tone="warn">Placeholder</Badge>
              <Badge>Member</Badge>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Form fields</h2>
            <div className="space-y-3">
              <Input label="Email" type="email" placeholder="you@example.com" icon={Mail} />
              <Input label="Amount" placeholder="0.00" inputMode="decimal" error="Enter a valid amount" />
              <Textarea label="Notes" placeholder="Optional note" hint="Max 500 characters" />
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 font-semibold">Balances</h2>
            <ul className="divide-y divide-line">
              {people.map((p) => (
                <li key={p.name} className="flex items-center gap-3 py-3">
                  <Avatar name={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.balance > 0 ? "gets back" : p.balance < 0 ? "owes" : "settled up"}
                    </p>
                  </div>
                  <MoneyText value={p.balance} signed />
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">Loading skeleton</h2>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="md:col-span-2">
            <h2 className="mb-3 font-semibold">Expense form pieces</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <MoneyInput label="Amount" />
              <Select label="Category" defaultValue="food">
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="rent">Rent</option>
              </Select>
            </div>
            <div className="mt-3">
              <SegmentedControl
                label="Split type"
                value={splitType}
                onChange={setSplitType}
                options={[
                  { value: "EQUAL", label: "Equally" },
                  { value: "EXACT", label: "Exact" },
                  { value: "PERCENTAGE", label: "Percent" },
                  { value: "SHARES", label: "Shares" },
                ]}
              />
            </div>
            <Button variant="danger" className="mt-3" onClick={() => setConfirmOpen(true)}>
              Delete expense
            </Button>
          </Card>

          <Card className="md:col-span-2">
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Add your first expense and split it with your group."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={() => setOpen(true)}>
                    <Plus className="size-4" /> Open modal
                  </Button>
                  <Button variant="secondary" onClick={() => toast.error("Something went wrong")}>
                    <Users className="size-4" /> Error toast
                  </Button>
                </div>
              }
            />
          </Card>
        </div>
      </main>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add group"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                toast.success("Group created");
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Group name" placeholder="Goa Trip" />
          <Textarea label="Description" placeholder="Dec 2026" />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.success("Expense deleted");
        }}
        title="Delete expense?"
        message="This will remove the expense and update everyone's balances."
        confirmText="Delete"
      />

      <AppToaster />
    </>
  );
}
