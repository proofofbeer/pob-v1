import { ChangeEvent, useCallback } from "react";
import { CommonInputProps } from "~~/components/scaffold-eth";

type InputBaseProps<T> = CommonInputProps<T> & {
  error?: boolean;
  disabled?: boolean;
  isRequired?: boolean;
  max?: number;
  min?: number;
};

export const InputBase = <T extends { toString: () => string } = string>({
  name,
  value,
  onChange,
  type,
  placeholder,
  error,
  disabled,
  isRequired = false,
  max,
  min,
}: InputBaseProps<T>) => {
  let modifier = "";
  if (error) {
    modifier = "border-error";
  } else if (disabled) {
    modifier = "border-disabled bg-base-300";
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as unknown as T);
    },
    [onChange],
  );
  return (
    <div className={`flex border-2 border-base-300 bg-base-200 rounded-lg text-accent ${modifier}`}>
      <input
        className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400 disabled:text-gray-400"
        type={type || "text"}
        placeholder={placeholder}
        name={name}
        value={value?.toString()}
        onChange={handleChange}
        max={max}
        min={min}
        disabled={disabled}
        autoComplete="off"
        required={isRequired}
      />
    </div>
  );
};
