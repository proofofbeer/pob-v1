import { useCallback, useState } from "react";

type TToggleInputProps = {
  name?: string;
  textA?: string;
  textB?: string;
  valueA?: string;
  valueB?: string;
  isDefaultValueA: boolean;
  onChange: (newValue: any) => void;
};

const ToggleInput = ({ name, onChange, isDefaultValueA, textA, textB, valueA, valueB }: TToggleInputProps) => {
  const [isActiveValueA, setIsActiveValueA] = useState<boolean>(isDefaultValueA);

  const handleToggle = useCallback(() => {
    onChange(!isActiveValueA ? valueA : valueB);
    setIsActiveValueA(!isActiveValueA);
  }, [isActiveValueA, onChange, valueA, valueB]);

  return (
    <div className="flex items-center h-[2.2rem] min-h-[2.2rem] space-x-2 mt-2 p-4 text-lg pointer-events-auto">
      <span className={`${isActiveValueA ? "text-orange-600" : ""} mr-2 font-medium`}>{textA}</span>
      <input
        id={name}
        name={name}
        type="checkbox"
        className="toggle toggle-lg toggle-success bg-red"
        onChange={handleToggle}
        checked={!isActiveValueA}
      />
      <span className={`${!isActiveValueA ? "text-orange-600" : ""} ml-2 font-medium`}>{textB}</span>
    </div>
  );
};

export default ToggleInput;
