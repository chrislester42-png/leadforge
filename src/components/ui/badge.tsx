import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        accent: "bg-accent text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/15 text-destructive",
        outline: "border border-border text-muted-foreground",
        pending: "bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending))]",
        running: "bg-[hsl(var(--status-running-bg))] text-[hsl(var(--status-running))]",
        done: "bg-[hsl(var(--status-done-bg))] text-[hsl(var(--status-done))]",
        failed: "bg-[hsl(var(--status-failed-bg))] text-[hsl(var(--status-failed))]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
