function InputField({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-1">
      {/* Label - now properly connected to input using htmlFor */}
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <input
        id={name}
        type={type || 'text'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={
          name === 'password' ? 'current-password' :
          name === 'email' ? 'email' :
          name === 'name' ? 'name' : 'off'
        }
        className={`
          w-full px-4 py-3 rounded-lg border text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-200
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error
            ? 'border-red-400 bg-red-50 focus:ring-red-400'
            : 'border-gray-300 bg-white hover:border-blue-400'
          }
        `}
      />

      {error && (
        <p className="text-xs text-red-500 mt-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}

export default InputField