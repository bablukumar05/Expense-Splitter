import { useMemo, useState } from "react";
import { AlertCircle, Plus, Receipt, Search, SlidersHorizontal } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import MoneyText from "@/components/ui/MoneyText";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import ExpenseItem from "@/features/expenses/ExpenseItem";
import { useExpenses } from "@/features/expenses/hooks";
import { buildMemberLookup } from "@/features/expenses/members";
import { useGroupContext } from "@/features/groups/useGroupContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/cn";
import { CATEGORIES } from "@/lib/constants";
import { formatMonth } from "@/lib/format";

const SORTS = [
  { value: "date:desc", label: "Newest first" },
  { value: "date:asc", label: "Oldest first" },
  { value: "amount:desc", label: "Highest amount" },
  { value: "amount:asc", label: "Lowest amount" },
];
const DEFAULT_SORT = "date:desc";

function ListSkeleton() {
  return (
    <div role="status" aria-label="Loading expenses" className="space-y-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.04] p-3.5">
          <Skeleton className="size-11 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function GroupExpenses() {
  const { group, me } = useGroupContext();
  const lookup = useMemo(() => buildMemberLookup(group), [group]);

  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = useDebouncedValue(searchInput.trim(), 300);
  const [sortBy, order] = sort.split(":");

  const filters = useMemo(() => {
    const raw = { search, category, paidBy, from: fromDate, to: toDate, sortBy, order };
    return Object.fromEntries(Object.entries(raw).filter(([, value]) => value));
  }, [search, category, paidBy, fromDate, toDate, sortBy, order]);

  const query = useExpenses(group._id, filters);

  const items = useMemo(() => query.data?.pages.flatMap((page) => page.expenses) ?? [], [query.data]);
  const total = query.data?.pages[0]?.pagination.total ?? 0;
  const totalAmount = query.data?.pages[0]?.summary.totalAmount ?? 0;

  const groupByMonth = sortBy === "date";
  const sections = useMemo(() => {
    if (items.length === 0) return [];
    if (!groupByMonth) return [{ key: "all", label: "", items }];

    const result = [];
    for (const expense of items) {
      const key = String(expense.date).slice(0, 7);
      const last = result[result.length - 1];
      if (last && last.key === key) last.items.push(expense);
      else result.push({ key, label: formatMonth(expense.date), items: [expense] });
    }
    return result;
  }, [items, groupByMonth]);

  const activeFilters =
    [category, paidBy, fromDate, toDate].filter(Boolean).length + (sort !== DEFAULT_SORT ? 1 : 0);
  const hasAnyFilter = activeFilters > 0 || search !== "";
  const dateRangeInvalid = fromDate && toDate && fromDate > toDate;

  const clearAll = () => {
    setSearchInput("");
    setCategory("");
    setPaidBy("");
    setFromDate("");
    setToDate("");
    setSort(DEFAULT_SORT);
  };

  const addHref = `/groups/${group._id}/expenses/new`;

  const renderBody = () => {
    if (query.isPending) return <ListSkeleton />;

    if (query.isError && !query.data) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load expenses"
          description="Check your connection and try again."
          action={<Button onClick={() => query.refetch()}>Try again</Button>}
        />
      );
    }

    if (items.length === 0) {
      return hasAnyFilter ? (
        <EmptyState
          icon={Search}
          title="No expenses found"
          description="Nothing matches these filters."
          action={<Button variant="secondary" onClick={clearAll}>Clear filters</Button>}
        />
      ) : (
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description={
            group.members.length > 1
              ? "Add the first expense and split it with your group."
              : "Add an expense now, or invite people first so you can split it with them."
          }
          action={
            <ButtonLink to={addHref}>
              <Plus className="size-4" /> Add expense
            </ButtonLink>
          }
        />
      );
    }

    return (
      <>
        <div className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}>
          {sections.map((section) => (
            <section key={section.key} aria-label={section.label || "Expenses"}>
              {groupByMonth && (
                <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-muted first:mt-0">
                  {section.label}
                </h3>
              )}
              <ul className="space-y-2">
                {section.items.map((expense) => (
                  <li key={expense._id}>
                    <ExpenseItem expense={expense} groupId={group._id} meId={me._id} lookup={lookup} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {query.hasNextPage && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <Button variant="secondary" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
              Load more
            </Button>
            {query.isFetchNextPageError && (
              <p className="text-xs text-bad">Couldn't load more. Please try again.</p>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <ButtonLink to={addHref}>
          <Plus className="size-4" /> Add expense
        </ButtonLink>
      </div>

      {total > 0 && (
        <Card variant="flat" className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted">{hasAnyFilter ? "Total of matching expenses" : "Total spent"}</p>
            <MoneyText value={totalAmount} currency={group.currency} className="text-xl" />
          </div>
          <Badge>
            {total} {total === 1 ? "expense" : "expenses"}
          </Badge>
        </Card>
      )}

      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Input
              type="search"
              enterKeyHint="search"
              placeholder="Search expenses"
              aria-label="Search expenses"
              icon={Search}
              autoComplete="off"
              maxLength={60}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="expense-filters"
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && <Badge tone="brand">{activeFilters}</Badge>}
          </Button>
        </div>

        {filtersOpen && (
          <Card id="expense-filters" variant="flat" className="grid gap-3 sm:grid-cols-2">
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </Select>

            <Select label="Paid by" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
              <option value="">Anyone</option>
              {group.members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member._id === me._id ? `${member.name} (you)` : member.name}
                </option>
              ))}
            </Select>

            <Input
              type="date"
              label="From date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              type="date"
              label="To date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              error={dateRangeInvalid ? "To date is before From date" : undefined}
            />

            <Select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>

            <div className="flex items-end">
              <Button variant="ghost" onClick={clearAll} disabled={!hasAnyFilter}>
                Clear all
              </Button>
            </div>
          </Card>
        )}
      </div>

      {renderBody()}
    </>
  );
}
