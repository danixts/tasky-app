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
      theme="light"
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheck className="size-4 text-green-600" />,
        info: <Info className="size-4 text-blue-600" />,
        warning: <TriangleAlert className="size-4 text-amber-600" />,
        error: <OctagonX className="size-4 text-(--destructive)" />,
        loading: (
          <Loader2 className="size-4 animate-spin text-(--muted-foreground)" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--color-card)",
          "--normal-text": "var(--color-card-foreground)",
          "--normal-border": "var(--color-border)",
          "--border-radius": "var(--radius-lg)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-(--border) group-[.toaster]:bg-(--card) group-[.toaster]:text-(--card-foreground) group-[.toaster]:shadow-lg",
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
