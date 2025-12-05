import type { InputHTMLAttributes } from "react";

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
  className?: string;
}

export function Radio({ id, label, className, ...inputProps }: RadioProps) {
  return (
    <label htmlFor={id} className={`flex items-center ${className}`}>
      <input id={id} type="radio" className="mr-2" {...inputProps} />
      {label}
    </label>
  );
}
