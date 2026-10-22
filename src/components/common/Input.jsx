export function Input({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  className = "",
  min,
  max,
  ...props
}) {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={inputId}
            className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
      )}

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          className={`
            w-full border rounded-xs bg-[#F8FBFF] px-3.5 py-2.5 text-sm text-[#0F2942] outline-none transition-colors placeholder:text-[#5A738E]/60
            ${
              error
                ? "border-red-400 bg-red-50/40 focus:border-red-600 focus:ring-1 focus:ring-red-400"
                : "border-[#D7E2EA] focus:border-[#2F7FC1] focus:ring-1 focus:ring-[#7CC8FF]"
            }
            ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-400" : ""}
          `}
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-medium">
          <span>⚠</span> {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-[11px] text-[#5A738E]">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;
