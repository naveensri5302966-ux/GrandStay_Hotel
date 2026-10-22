export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold tracking-[1.5px] uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-sm shadow-xs";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-[9px] tracking-[1.5px]",
    md: "px-5 py-2.5 text-[10px] tracking-[2px]",
    lg: "px-7 py-3.5 text-[11px] tracking-[2.5px]"
  };

  const variantStyles = {
    primary:
      "bg-[#2F7FC1] text-white hover:bg-[#24659A] active:bg-[#1E527D] focus:ring-[#7CC8FF]",
    secondary:
      "bg-[#B7E3FF] text-[#0F2942] hover:bg-[#7CC8FF] focus:ring-[#2F7FC1]",
    outline:
      "border border-[#2F7FC1] text-[#2F7FC1] bg-white hover:bg-[#2F7FC1] hover:text-white focus:ring-[#7CC8FF]",
    danger:
      "border border-red-500 text-red-600 bg-white hover:bg-red-600 hover:text-white focus:ring-red-500",
    ghost:
      "text-[#2F7FC1] bg-transparent hover:bg-[#B7E3FF]/30 focus:ring-[#7CC8FF]"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-3.5 w-3.5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
