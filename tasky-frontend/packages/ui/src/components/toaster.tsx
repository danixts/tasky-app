import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheck,
  Info,
  Loader2,
  OctagonX,
  TriangleAlert,
} from "lucide-react";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme={props.theme ?? "system"}
      className="toaster group"
      position="bottom-right"
      icons={{
        success: (
          <CircleCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ),
        info: (
          <Info className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
        ),
        warning: (
          <TriangleAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        ),
        error: (
          <OctagonX className="size-5 shrink-0 text-red-600 dark:text-red-400" />
        ),
        loading: (
          <Loader2 className="size-5 shrink-0 animate-spin text-(--foreground)" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-2 group-[.toaster]:border-(--border) group-[.toaster]:bg-(--card) group-[.toaster]:text-(--foreground) group-[.toaster]:shadow-xl",
          description: "group-[.toast]:text-(--muted-foreground)",
          actionButton:
            "group-[.toast]:bg-(--primary) group-[.toast]:text-(--primary-foreground)",
          cancelButton:
            "group-[.toast]:bg-(--muted) group-[.toast]:text-(--muted-foreground)",
        },
      }}
      {...props}
    />
  );
}
