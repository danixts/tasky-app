import type { CSSProperties } from "react";
import { cn } from "../lib/utils";

interface ShineBorderProps {
  className?: string;
  shineColor?: string | string[];
  borderWidth?: number;
  duration?: number;
  style?: React.CSSProperties;
}

export function ShineBorder({
  className,
  shineColor = "#000000",
  borderWidth = 1,
  duration = 14,
  style,
}: Readonly<ShineBorderProps>) {
  const colors = Array.isArray(shineColor) ? shineColor : [shineColor];
  const mainColor = colors[0];
  const gradientString = `linear-gradient(90deg, transparent, ${mainColor}, transparent)`;

  return (
    <>
      <style>
        {`
          @keyframes shine-border {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]",
          className
        )}
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--duration": `${duration}s`,
            padding: "var(--border-width)",
            backgroundImage: gradientString,
            backgroundSize: "200% 100%",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            animation: "shine-border var(--duration) linear infinite",
            opacity: 0.85,
            ...style,
          } as CSSProperties
        }
      />
    </>
  );
}
