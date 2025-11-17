import type { TextareaHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label?: string;
  error?: string;
  register?: UseFormRegisterReturn;
  textareaClassName?: string;
  wrapperClassName?: string;
}

export function TextArea({
  label,
  error,
  register,
  id,
  textareaClassName,
  wrapperClassName,
  ...textareaProps
}: TextAreaProps) {
  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full px-3 py-2 border rounded-md ${textareaClassName || ""}`}
        {...register}
        {...textareaProps}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
