import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  error?: string;
  register?: UseFormRegisterReturn;
  inputClassName?: string;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  register,
  id,
  inputClassName,
  wrapperClassName,
  ...inputProps
}: InputProps) {
  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 border rounded-md ${inputClassName || ""}`}
        {...register}
        {...inputProps}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
