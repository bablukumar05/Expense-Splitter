import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import { timeAgo } from "@/lib/format";
import { useAddComment, useComments, useDeleteComment } from "./hooks";

export default function CommentsSection({ expenseId, userId, isAdmin }) {
  const query = useComments(expenseId);
  const addComment = useAddComment(expenseId);
  const removeComment = useDeleteComment(expenseId);

  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const comments = useMemo(
    () => query.data?.pages.flatMap((page) => page.comments) ?? [],
    [query.data]
  );

  const submit = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) {
      setError("Write something first.");
      return;
    }
    setError("");
    try {
      await addComment.mutateAsync(value);
      setText("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    setDeleteError("");
    try {
      await removeComment.mutateAsync(toDelete._id);
      setToDelete(null);
      toast.success("Comment deleted");
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="font-semibold">Comments</h2>

      {query.isPending ? (
        <div role="status" aria-label="Loading comments" className="space-y-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : query.isError && !query.data ? (
        <div className="flex items-center gap-3">
          <p className="flex-1 text-sm text-muted">Couldn't load comments.</p>
          <Button size="sm" variant="secondary" onClick={() => query.refetch()}>
            Retry
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted">No comments yet. Start the conversation.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment._id} className="flex gap-3">
              <Avatar name={comment.authorName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{comment.authorName}</span>
                  <span className="ml-2 text-xs text-muted">{timeAgo(comment.createdAt)}</span>
                </p>
                <p className="whitespace-pre-wrap break-words text-sm text-ink/90">{comment.text}</p>
              </div>
              {(comment.author === userId || isAdmin) && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete comment"
                  onClick={() => {
                    setDeleteError("");
                    setToDelete(comment);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {query.hasNextPage && (
        <Button variant="ghost" size="sm" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
          Show more comments
        </Button>
      )}

      <form onSubmit={submit} noValidate className="space-y-2">
        <Textarea
          aria-label="Add a comment"
          placeholder="Add a comment"
          rows={2}
          maxLength={500}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError("");
          }}
          error={error}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">{text.length}/500</span>
          <Button type="submit" size="sm" loading={addComment.isPending}>
            Post
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this comment?"
        message="This can't be undone."
        confirmText="Delete"
        loading={removeComment.isPending}
        error={deleteError}
      />
    </Card>
  );
}
