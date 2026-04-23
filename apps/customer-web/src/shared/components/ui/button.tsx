import { cn } from "@/src/shared/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  return (
    <button
      className={cn(
        "px-5 py-2 rounded-lg text-sm font-medium transition",
        variant === "primary" &&
          "bg-secondary text-white hover:opacity-90",
        variant === "outline" &&
          "border hover:bg-gray-100",
        className
      )}
      {...props}
    />
  );
}