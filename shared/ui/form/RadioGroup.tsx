import type { UseFormRegisterReturn } from "react-hook-form";
import { Radio } from "./Radio";

interface RadioGroupProps {
  options: OptionsType[];
  label?: string;
  error?: string;
  className?: string;
  register?: UseFormRegisterReturn;
}

export interface OptionsType {
  id: string;
  value: string;
  label: string;
}

export function RadioGroup({
  options,
  label,
  error,
  className,
  register,
}: RadioGroupProps) {
  return (
    <fieldset>
      {label && (
        <legend className="block text-sm font-medium mb-2">{label}</legend>
      )}
      <div className={`flex gap-4 ${className}`}>
        {options.map((option) => (
          <Radio
            key={option.id}
            id={option.id}
            value={option.value}
            label={option.label}
            {...register}
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </fieldset>
  );
}
