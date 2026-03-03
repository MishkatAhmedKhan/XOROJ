import '../styles/styles.css';

export default function Button({
  children,
  className = "",
  loading = false,
  disabled,
  variant = "primary",       // "primary" | "outline" | "ghost" | "subtle" | "destructive"
  size = "md",               // "sm" | "md" | "lg"
  leading = null,            // React node before text
  trailing = null,           // React node after text
  fullWidth = false,
  href,                      // if provided, renders an <a>
  type = "button",
  ...props
}) {
  const Comp = href ? "a" : "button";
  const isDisabled = !!(disabled || loading);

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };

  const variantClasses = {
    primary: [
      "bg-[var(--accent-600,#4f46e5)]",
      "text-[var(--accent-contrast,#ffffff)]",
      "hover:bg-[var(--accent-500,#6366f1)]",
      "border border-transparent",
      "shadow-md hover:shadow-lg",
    ].join(" "),
    outline: [
      "bg-transparent",
      "text-[var(--accent-600,#4f46e5)]",
      "border border-[var(--accent-600,#4f46e5)]",
      "hover:bg-black/[0.04] dark:hover:bg-white/[0.08]",
    ].join(" "),
    ghost: [
      "bg-transparent",
      "text-[var(--btn-text,var(--colour-2,#111827))]",
      "hover:bg-black/[0.04] dark:hover:bg-white/[0.08]",
      "border border-transparent",
    ].join(" "),
    subtle: [
      "bg-[var(--colour-3,#e5e7eb)]",
      "text-[var(--btn-text,var(--colour-2,#111827))]",
      "hover:bg-[var(--colour-6,rgba(0,0,0,0.06))]",
      "border border-[var(--colour-5,#d1d5db)]",
      "shadow-sm",
    ].join(" "),
    destructive: [
      "bg-red-600 text-white hover:bg-red-700",
      "border border-transparent",
      "shadow-md hover:shadow-lg",
    ].join(" "),
  };

  return (
    <Comp
      {...props}
      href={href}
      type={href ? undefined : type}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      disabled={Comp === "button" ? isDisabled : undefined}
      className={[
        // base
        "inline-flex items-center justify-center gap-2",
        "rounded-md font-medium",
        "transition-all duration-200",
        "transform hover:-translate-y-0.5 active:translate-y-px",
        "focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-[var(--accent-400,#93c5fd)]",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-[var(--colour-1,#ffffff)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        variantClasses[variant],
        fullWidth ? "w-full" : "",
        // keep your original defaults for primary
        !className && variant === "primary" ? "" : "",
        className,
      ].join(" ")}
    >
      {/* Left icon / spinner */}
      {loading ? (
        <svg
          className="w-4 h-4 animate-spin shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.25"
          />
          <path
            d="M22 12a10 10 0 0 0-10-10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        leading
      )}

      <span className="whitespace-nowrap">{children}</span>

      {/* Right icon placeholder to avoid layout shift */}
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
        {loading ? null : trailing}
      </span>
    </Comp>
  );
}
