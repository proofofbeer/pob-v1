export type TInputsArrayElement = {
  label: string;
  name: string;
  showWithToggleName?: string[];
  type: string;
  valueA?: string;
  valueB?: string;
};

export const createPoepInputsArray: TInputsArrayElement[] = [
  { label: "POEP Title", name: "name", type: "string" },
  { label: "POEP Description", name: "description", type: "string" },
  { label: "Website", name: "external_url", type: "string" },
  { label: "Event start date", name: "event_start_date", type: "date" },
  { label: "Event end date", name: "event_end_date", type: "date" },
  { label: "Event type", name: "event_type", type: "toggle", valueA: "Virtual", valueB: "In-person" },
  { label: "City", name: "event_city", showWithToggleName: ["event_type", "In-person"], type: "string" },
  { label: "Country", name: "event_country", showWithToggleName: ["event_type", "In-person"], type: "string" },
  { label: "Platform", name: "event_platform", showWithToggleName: ["event_type", "Virtual"], type: "string" },
  { label: "Account channel", name: "event_channel", showWithToggleName: ["event_type", "Virtual"], type: "string" },
];

export const getPoepInputKey = (input: TInputsArrayElement, inputIndex: number): string => {
  return input.name + `_${inputIndex}`;
};

export const getInitialPoepFormState = (inputs: TInputsArrayElement[], fileInputKey?: string) => {
  const initialForm: Record<string, any> = {};
  inputs.forEach((input: TInputsArrayElement) => {
    const key = input.name;
    if (input.type !== "toggle") {
      initialForm[key] = input.valueA;
    } else {
      initialForm[key] = "Virtual";
    }
  });
  if (fileInputKey) initialForm[fileInputKey] = undefined;
  return initialForm;
};
