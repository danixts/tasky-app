import { useEffect, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface LightRaysProps extends Readonly<
  React.HTMLAttributes<HTMLDivElement>
> {
  readonly count?: number;
  readonly color?: string;
  readonly blur?: number;
  readonly opacity?: number;
  readonly speed?: number;
  readonly length?: string | number;
}

type LightRay = {
  id: string;
  left: number;
  rotate: number;
  width: number;
  swing: number;
  delay: number;
  duration: number;
  intensity: number;
};

type RayProps = Omit<LightRay, "id">;

function createRays(
  count: number,
  cycle: number,
  maxOpacity: number
): LightRay[] {
  if (count <= 0) return [];

  return Array.from({ length: count }, (_, index) => {
    const left = 8 + Math.random() * 84;
    const rotate = -28 + Math.random() * 56;
    const width = 160 + Math.random() * 160;
    const swing = 0.8 + Math.random() * 1.8;
    const delay = Math.random() * cycle;
    const duration = cycle * (0.75 + Math.random() * 0.5);
    const intensity = maxOpacity * (0.5 + Math.random() * 0.5);

    return {
      id: `${index}-${Math.round(left * 10)}`,
      left,
      rotate,
      width,
      swing,
      delay,
      duration,
      intensity,
    };
  });
}

function Ray({
  left,
  rotate,
  width,
  swing,
  delay,
  duration,
  intensity,
}: Readonly<RayProps>) {
  return (
    <motion.div
      className="pointer-events-none absolute -top-[12%] left-[var(--ray-left)] h-[var(--light-rays-length)] w-[var(--ray-width)] origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-[var(--light-rays-color)] to-transparent opacity-0 blur-[var(--light-rays-blur)]"
      style={
        {
          "--ray-left": `${left}%`,
          "--ray-width": `${width}px`,
        } as CSSProperties
      }
      initial={{ rotate }}
      animate={{
        opacity: [0, intensity, 0],
        rotate: [rotate - swing, rotate + swing, rotate - swing],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
        repeatDelay: duration * 0.1,
      }}
    />
  );
}

export function LightRays({
  className,
  style,
  count = 7,
  color = "rgba(160, 210, 255, 0.2)",
  blur = 36,
  opacity = 0.65,
  speed = 14,
  length = "70vh",
  ...props
}: LightRaysProps) {
  const [rays, setRays] = useState<LightRay[]>([]);
  const cycleDuration = Math.max(speed, 0.1);
  const maxOpacity = Math.min(1, Math.max(0, opacity));

  useEffect(() => {
    setRays(createRays(count, cycleDuration, maxOpacity));
  }, [count, cycleDuration, maxOpacity]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 isolate overflow-hidden rounded-[inherit]",
        className
      )}
      style={
        {
          "--light-rays-color": color,
          "--light-rays-blur": `${blur}px`,
          "--light-rays-length":
            typeof length === "number" ? `${length}px` : length,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-80"
          style={
            {
              background:
                "radial-gradient(circle at 20% 15%, var(--light-rays-color), transparent 70%)",
            } as CSSProperties
          }
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-80"
          style={
            {
              background:
                "radial-gradient(circle at 80% 10%, var(--light-rays-color), transparent 75%)",
            } as CSSProperties
          }
        />
        {rays.map((ray) => {
          const { id, ...rayProps } = ray;
          return <Ray key={id} {...rayProps} />;
        })}
      </div>
    </div>
  );
}
