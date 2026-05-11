/**
 * Reusable Button component
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-dark)] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 focus:ring-indigo-500",
    secondary:
      "bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)] focus:ring-[var(--color-border)]",
    ghost:
      "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5 focus:ring-white/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
