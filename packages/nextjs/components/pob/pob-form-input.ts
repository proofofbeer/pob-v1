export type TInputsArrayElement = {
  label: string;
  name: string;
  showWithToggleName?: string[];
  type: string;
  valueA?: string;
  valueB?: string;
};

export const createBasicPobInputsArray: TInputsArrayElement[] = [
  { label: "Beer Brand", name: "name", type: "string" },
  { label: "Drink date", name: "date", type: "date" },
  { label: "Event type", name: "event_type", type: "toggle", valueA: "Virtual", valueB: "In-person" },
  { label: "City", name: "event_city", showWithToggleName: ["event_type", "In-person"], type: "string" },
  { label: "Country", name: "event_country", showWithToggleName: ["event_type", "In-person"], type: "string" },
  { label: "Platform", name: "event_platform", showWithToggleName: ["event_type", "Virtual"], type: "string" },
  { label: "Account channel", name: "event_channel", showWithToggleName: ["event_type", "Virtual"], type: "string" },
];

export const createOneTimePobInputsArray: TInputsArrayElement[] = [
  { label: "Beer Name/Brand", name: "name", type: "string" },
  { label: "POB Event/Occasion", name: "description", type: "string" },
  { label: "Drink date", name: "date", type: "date" },
  { label: "Event type", name: "event_type", type: "toggle", valueA: "Virtual", valueB: "In-person" },
  { label: "City", name: "event_city", showWithToggleName: ["event_type", "In-person"], type: "string" },
  { label: "Country", name: "event_country", showWithToggleName: ["event_type", "In-person"], type: "string" },
  { label: "Platform", name: "event_platform", showWithToggleName: ["event_type", "Virtual"], type: "string" },
  {
    label: "Account or Group Name",
    name: "event_channel",
    showWithToggleName: ["event_type", "Virtual"],
    type: "string",
  },
];

export const createPobBatchInputsArray: TInputsArrayElement[] = [
  { label: "Event Name", name: "name", type: "string" },
  { label: "Event Description", name: "description", type: "string" },
  { label: "POB Quantity", name: "pob_quantity", type: "number" },
  { label: "Event start date", name: "event_start_date", type: "date" },
  { label: "Event end date", name: "event_end_date", type: "date" },
];

export const createPobInputsArray: TInputsArrayElement[] = [
  { label: "POB Title", name: "name", type: "string" },
  { label: "POB Description", name: "description", type: "string" },
  { label: "Website", name: "external_url", type: "string" },
  { label: "Event start date", name: "event_start_date", type: "date" },
  { label: "Event end date", name: "event_end_date", type: "date" },
  { label: "Event type", name: "event_type", type: "toggle", valueA: "Virtual", valueB: "In-person" },
  { label: "City", name: "event_city", showWithToggleName: ["event_type", "In-person"], type: "string" },
  { label: "Country", name: "event_country", showWithToggleName: ["event_type", "In-person"], type: "string" },
  { label: "Platform", name: "event_platform", showWithToggleName: ["event_type", "Virtual"], type: "string" },
  { label: "Account channel", name: "event_channel", showWithToggleName: ["event_type", "Virtual"], type: "string" },
];

export const getPobInputKey = (input: TInputsArrayElement, inputIndex: number): string => {
  return input.name + `_${inputIndex}`;
};

export const getInitialPobFormState = (inputs: TInputsArrayElement[], fileInputKey?: string) => {
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
