import create from "zustand";
import { persist } from "zustand/middleware";

/**
 * Zustand Store
 *
 * You can add global state to the app using this AppStore, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type TAppStore = {
  ethPrice: number;
  setEthPrice: (newEthPriceState: number) => void;
  pobBatchDataArray: Record<string, any>[];
  setPobBatchDataArray: (newUserContract: Record<string, any>) => void;
};

export const useAppStore = create<TAppStore>()(
  persist(
    set => ({
      ethPrice: 0,
      setEthPrice: (newValue: number): void => set(() => ({ ethPrice: newValue })),
      pobBatchDataArray: [],
      setPobBatchDataArray: (newPobBatchData: Record<string, any>): void =>
        set(state => ({
          pobBatchDataArray: [...state.pobBatchDataArray, { ...newPobBatchData }],
        })),
    }),
    { name: "templates" },
  ),
);
