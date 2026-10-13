import { useMemo, useState } from "react";
import { AlertCircle, Plus, RefreshCw, Search, Users } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/useAuth";
import BalanceSummary from "@/features/groups/BalanceSummary";
import CreateGroupModal from "@/features/groups/CreateGroupModal";
import GroupCard, { GroupListSkeleton } from "@/features/groups/GroupCard";
import JoinGroupModal from "@/features/groups/JoinGroupModal";
import { useGroups, useMyBalances } from "@/features/groups/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/cn";

export default function Dashboard() {
  useDocumentTitle("Home");
  const { user } = useAuth();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [manualRefresh, setManualRefresh] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 300);

  const groups = useGroups(search);
  const balances = useMyBalances();

  const items = useMemo(() => groups.data?.pages.flatMap((page) => page.groups) ?? [], [groups.data]);
  const total = groups.data?.pages[0]?.pagination.total ?? 0;

  const balanceByGroup = useMemo(
    () => new Map((balances.data?.groups ?? []).map((row) => [String(row.groupId), row])),
    [balances.data]
  );

  const showSearch = searchInput !== "" || total > 5;
  const firstName = user?.name ? user.name.split(" ")[0].toUpperCase() : "THERE";

  const refresh = async () => {
    setManualRefresh(true);
    const results = await Promise.all([groups.refetch(), balances.refetch()]);
    setManualRefresh(false);
    if (results.some((result) => result.isError)) {
      toast.error("Couldn't refresh. Showing saved data.");
    }
  };

  const renderGroups = () => {
    if (groups.isPending) return <GroupListSkeleton />;

    if (groups.isError && !groups.data) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load your groups"
          description="Check your connection and try again."
          action={<Button onClick={() => groups.refetch()}>Try again</Button>}
        />
      );
    }

    if (items.length === 0) {
      return search ? (
        <EmptyState
          icon={Search}
          title="No groups found"
          description={`Nothing matches "${search}". Try a different name.`}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="Create your first group"
          description="Make a group for a trip, your flat or a night out, add expenses and settle up easily."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" /> New group
              </Button>
              <Button variant="secondary" onClick={() => setJoinOpen(true)}>
                Join with a link
              </Button>
            </div>
          }
        />
      );
    }

    return (
      <>
        <div className={cn("grid gap-3.5 transition-opacity md:grid-cols-2", groups.isPlaceholderData && "opacity-60")}>
          {items.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              balance={balanceByGroup.get(String(group._id))?.balance}
              balanceLoading={balances.isPending}
            />
          ))}
        </div>

        {groups.hasNextPage && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <Button variant="secondary" loading={groups.isFetchingNextPage} onClick={() => groups.fetchNextPage()}>
              Load more
            </Button>
            {groups.isFetchNextPageError && (
              <p className="text-xs text-bad">Couldn't load more. Please try again.</p>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
          title={`Hi, ${firstName} 👋`}
          subtitle="Here's where you stand"
          actions={
            <>
              <Button
                variant="secondary"
                size="icon"
                onClick={refresh}
                disabled={manualRefresh}
                aria-label="Refresh"
                aria-busy={manualRefresh}
                className="size-10 rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 backdrop-blur-md hover:bg-white/10"
              >
                <RefreshCw className={cn("size-5", manualRefresh && "animate-spin")} />
              </Button>
              <Button
                onClick={() => setCreateOpen(true)}
                className="gap-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition hover:bg-blue-500"
              >
                <Plus className="size-4" />
                New group
              </Button>
            </>
          }
        />

        <BalanceSummary
          summary={balances.data?.summary}
          loading={balances.isPending}
          error={balances.isError && !balances.data}
          onRetry={() => balances.refetch()}
        />

        <section aria-labelledby="groups-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="groups-heading" className="text-lg font-bold text-white">
              Your groups
            </h2>
            {total > 0 && (
              <span className="text-sm font-medium text-slate-400">
                {total} {total === 1 ? "group" : "groups"}
              </span>
            )}
          </div>

          {showSearch && (
            <div className="mb-4">
              <Input
                type="search"
                enterKeyHint="search"
                placeholder="Search groups"
                aria-label="Search groups"
                icon={Search}
                autoComplete="off"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          )}

          {renderGroups()}

          {!groups.isPending && items.length > 0 && (
            <div className="mt-8 text-center">
              <Button
                variant="ghost"
                onClick={() => setJoinOpen(true)}
                className="text-sm font-medium text-slate-400 hover:text-white"
              >
                Have an invite link? Join a group
              </Button>
            </div>
          )}
        </section>

        <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} />
        <JoinGroupModal open={joinOpen} onClose={() => setJoinOpen(false)} />
      </div>
    );
  }
