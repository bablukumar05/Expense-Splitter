import { useState } from "react";
import { Link2 as LinkIcon } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import { groupsApi } from "@/api/groups";
import AuthLayout from "@/components/AuthLayout";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import EmptyState from "@/components/ui/EmptyState";
import FormAlert from "@/components/ui/FormAlert";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { useInvitePreview, useJoinGroup } from "@/features/groups/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const previewProblem = (error) => {
  if (error.status === 410) {
    return {
      title: "This invite has reached its limit",
      text: "The link was already used the maximum number of times. Ask the group admin for a new one.",
    };
  }
  if (error.status === 429) {
    return { title: "Too many attempts", text: "Please wait a few minutes and try again." };
  }
  if (error.status === 404 || error.status === 400) {
    return {
      title: "This invite link isn't valid",
      text: "It may have expired, been turned off, or replaced by a newer link. Ask the group admin to send you a fresh one.",
    };
  }
  return null;
};

export default function JoinPage() {
  useDocumentTitle("Join group");
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { status, retry } = useAuth();
  const preview = useInvitePreview(code);
  const join = useJoinGroup();

  const [joinError, setJoinError] = useState("");
  const [alreadyMember, setAlreadyMember] = useState(false);

  const goToLogin = (path) => navigate(path, { state: { from: location } });

  const openExistingGroup = async () => {
    try {
      const wanted = preview.data.name.trim().toLowerCase();
      const { groups } = await groupsApi.list({ search: preview.data.name, limit: 50 });
      const matches = groups.filter((group) => group.name.trim().toLowerCase() === wanted);
      if (matches.length === 1) {
        toast.info("You're already in this group.");
        navigate(`/groups/${matches[0]._id}`, { replace: true });
        return;
      }
    } catch {

    }
    setAlreadyMember(true);
  };

  const handleJoin = async () => {
    setJoinError("");
    try {
      const { group } = await join.mutateAsync(code);
      toast.success(`Welcome to "${group.name}"!`);
      navigate(`/groups/${group.id}`, { replace: true });
    } catch (error) {
      if (error.status === 409 && /already a member/i.test(error.message)) {
        await openExistingGroup();
        return;
      }
      setJoinError(getErrorMessage(error));
    }
  };

  if (preview.isPending) {
    return (
      <AuthLayout title="Checking invite…">
        <div role="status" aria-label="Loading invite" className="space-y-4">
          <Skeleton className="mx-auto size-14 rounded-full" />
          <Skeleton className="mx-auto h-6 w-1/2" />
          <Skeleton className="h-11" />
        </div>
      </AuthLayout>
    );
  }

  if (preview.isError) {
    const problem = previewProblem(preview.error);
    return (
      <AuthLayout title="Invite link">
        <EmptyState
          icon={LinkIcon}
          title={problem?.title ?? "Couldn't check this invite"}
          description={problem?.text ?? "We couldn't reach the server. Check your connection and try again."}
          action={
            problem ? (
              <ButtonLink to="/">Go to my groups</ButtonLink>
            ) : (
              <Button onClick={() => preview.refetch()}>Try again</Button>
            )
          }
        />
      </AuthLayout>
    );
  }

  const { name, memberCount } = preview.data;

  return (
    <AuthLayout title="You're invited!" subtitle="Join the group to start splitting expenses">
      <div className="flex flex-col items-center text-center">
        <Avatar name={name} size="lg" />
        <h2 className="mt-3 text-xl font-semibold">{name}</h2>
        <p className="text-sm text-muted">
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <FormAlert>{joinError}</FormAlert>

        {alreadyMember ? (
          <>
            <p className="text-center text-sm text-muted">You're already a member of this group.</p>
            <ButtonLink to="/" fullWidth>
              Go to my groups
            </ButtonLink>
          </>
        ) : status === "loading" ? (
          <Skeleton className="h-11" />
        ) : status === "authenticated" ? (
          <>
            <Button fullWidth loading={join.isPending} onClick={handleJoin}>
              Join group
            </Button>
            <ButtonLink to="/" variant="ghost" fullWidth>
              Not now
            </ButtonLink>
          </>
        ) : status === "error" ? (
          <>
            <p className="text-center text-sm text-muted">We couldn't check your login. Please try again.</p>
            <Button fullWidth onClick={retry}>
              Try again
            </Button>
          </>
        ) : (
          <>
            <Button fullWidth onClick={() => goToLogin("/login")}>
              Log in to join
            </Button>
            <Button variant="secondary" fullWidth onClick={() => goToLogin("/register")}>
              Create an account
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
