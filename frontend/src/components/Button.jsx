import "../styles/styles.css";

export default function Button({
  children,
  className = "",
  loading = false,
  disabled,
  variant = "primary",
  size = "md",
  leading = null,
  trailing = null,
  fullWidth = false,
  href,
  type = "button",
  ...props
}) {
  const Comp = href ? "a" : "button";
  const isDisabled = !!(disabled || loading);

  const sizeMap = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  const variantMap = {
    primary: "btn-primary",
    outline: "btn-outline",
    ghost: "btn-ghost",
    subtle: "",
    destructive: "btn-danger",
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
        "btn",
        sizeMap[size] || "",
        variantMap[variant] || "",
        fullWidth ? "w-full" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {loading ? (
        <span className="ide-spinner" style={{ width: 16, height: 16 }} />
      ) : (
        leading
      )}

      <span className="whitespace-nowrap">{children}</span>

      {trailing && !loading && (
        <span className="inline-flex items-center">{trailing}</span>
      )}
    </Comp>
  );
}
