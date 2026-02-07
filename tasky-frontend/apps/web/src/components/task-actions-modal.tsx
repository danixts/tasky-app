import { useState, useCallback, useEffect } from "react";
import type { Task, TaskStatus, TaskPriority } from "@tasky/services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  Input,
  Textarea,
} from "@tasky/ui";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@tasky/ui/lib/utils";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from "@/lib/task-constants";
import type { TaskEditData } from "@/types/task";

const NATIVE_SELECT_CLASS = cn(
  "flex h-10 w-full rounded-md border border-(--input) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none transition-colors focus:ring-2 focus:ring-(--ring) focus:ring-offset-2 focus:ring-offset-(--background) disabled:cursor-not-allowed disabled:opacity-50"
);

interface TaskActionsModalProps {
  readonly task: Task | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSaveEdit: (taskId: string, data: TaskEditData) => void;
  readonly onDelete: (taskId: string) => void;
  readonly onMoveStatus: (taskId: string, newStatus: TaskStatus) => void;
  readonly onUpdatePriority: (taskId: string, priority: TaskPriority) => void;
}

export function TaskActionsModal({
  task,
  open,
  onOpenChange,
  onSaveEdit,
  onDelete,
  onMoveStatus,
  onUpdatePriority,
}: TaskActionsModalProps) {
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("PENDING");
  const [editPriority, setEditPriority] = useState<TaskPriority>("NORMAL");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task && open) {
      setEditTitle(task.title);
      setEditDescription(task.description ?? "");
      setEditStatus(task.status);
      setEditPriority(task.priority ?? "NORMAL");
    }
  }, [task, open]);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!task) return;
      const title = editTitle.trim();
      if (!title) return;
      setSaving(true);
      try {
        onSaveEdit(task.taskId, {
          title,
          description: editDescription.trim() || undefined,
          status: editStatus,
          priority: editPriority,
        });
        onOpenChange(false);
      } finally {
        setSaving(false);
      }
    },
    [
      task,
      editTitle,
      editDescription,
      editStatus,
      editPriority,
      onSaveEdit,
      onOpenChange,
    ]
  );

  const handleDelete = useCallback(() => {
    if (!task) return;
    onDelete(task.taskId);
    onOpenChange(false);
  }, [task, onDelete, onOpenChange]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const handleCancel = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleOpenChange(false);
    },
    [handleOpenChange]
  );

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="backdrop-blur-sm bg-black/60"
        className={
          "flex max-h-[85dvh] flex-col gap-0 overflow-hidden rounded-2xl border border-(--border) bg-(--background) p-0 shadow-2xl " +
          "!inset-auto !left-1/2 !top-1/2 !w-[90vw] !max-w-[400px] !-translate-x-1/2 !-translate-y-1/2 " +
          "pt-0"
        }
      >
        <DialogHeader className="flex shrink-0 w-full flex-row items-center justify-between border-b border-(--border) bg-(--card)/40 px-4 py-3 rounded-t-2xl">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-(--foreground)">
            <Pencil className="h-4 w-4 shrink-0 text-(--muted-foreground)" />
            Edit task
          </DialogTitle>
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-500"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </DialogHeader>
        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="modal-task-title"
                  className="text-sm font-medium text-(--foreground)"
                >
                  Title
                </Label>
                <Input
                  id="modal-task-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task name"
                  maxLength={255}
                  className="h-11 rounded-xl border-(--border) bg-(--muted)/30 text-(--foreground) placeholder:text-(--muted-foreground)/70 focus-visible:ring-2 focus-visible:ring-(--ring)"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="modal-task-desc"
                  className="text-sm font-medium text-(--foreground)"
                >
                  Description
                </Label>
                <Textarea
                  id="modal-task-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Optional"
                  rows={3}
                  maxLength={500}
                  className="min-h-[88px] resize-none rounded-xl border-(--border) bg-(--muted)/30 text-(--foreground) placeholder:text-(--muted-foreground)/70 focus-visible:ring-2 focus-visible:ring-(--ring)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="modal-task-status"
                    className="text-sm font-medium text-(--foreground)"
                  >
                    Status
                  </Label>
                  <select
                    id="modal-task-status"
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as TaskStatus)
                    }
                    className={NATIVE_SELECT_CLASS}
                  >
                    {TASK_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="modal-task-priority"
                    className="text-sm font-medium text-(--foreground)"
                  >
                    Priority
                  </Label>
                  <select
                    id="modal-task-priority"
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(e.target.value as TaskPriority)
                    }
                    className={NATIVE_SELECT_CLASS}
                  >
                    {TASK_PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 flex-row gap-3 border-t border-(--border) bg-(--card)/30 px-4 py-3 rounded-b-2xl">
            <Button
              type="button"
              variant="outline"
              className="h-11 min-w-[100px] flex-1 rounded-xl border-(--border) font-medium sm:flex-none"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 min-w-[100px] flex-1 gap-2 rounded-xl font-medium bg-(--primary) text-(--primary-foreground) hover:bg-(--primary)/90 disabled:opacity-50 sm:flex-none"
              disabled={saving || !editTitle.trim()}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
