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
  userContracts: Record<string, any>[];
  setUserContracts: (newUserContract: Record<string, any>) => void;
  userImgObjs: any[];
  setUserImgObjs: (newUserImgObjs: any) => void;
  directoriesCids: string[];
  setDirectoriesCids: (newDirectoryCid: string) => void;
  currentImgName: string;
  setCurrentImgName: (newImgName: string) => void;
  storeAttributes: any[];
  setStoreAttributes: (attributes: string[]) => void;
  storeContract: Record<string, any>[];
  setStoreContract: (newContractForm: Record<string, any>) => void;
  storeMetadata: Record<string, any>[];
  setStoreMetadata: (newMetadataForm: Record<string, any>) => void;
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
      userContracts: [],
      setUserContracts: (newUserContract: Record<string, any>): void =>
        set(state => ({
          userContracts: [...state.userContracts, { ...newUserContract }],
        })),
      userImgObjs: [],
      setUserImgObjs: (newUserImgObj: any): void =>
        set(state => ({
          userImgObjs: [...state.userImgObjs, newUserImgObj],
        })),
      directoriesCids: [],
      setDirectoriesCids: (newDirectoryCid: string): void =>
        set(state => ({
          directoriesCids: [...state.directoriesCids, newDirectoryCid],
        })),
      currentImgName: "",
      setCurrentImgName: (newImgName: string): void => set(() => ({ currentImgName: newImgName })),
      storeAttributes: [],
      setStoreAttributes: (newAttributes: string[]): void =>
        set(state => ({
          storeAttributes: [...state.storeAttributes, [...newAttributes]],
        })),
      storeContract: [],
      setStoreContract: (contractForm: Record<string, any>): void =>
        set(state => ({
          storeContract: [...state.storeContract, { ...contractForm }],
        })),
      storeMetadata: [],
      setStoreMetadata: (metadataForm: Record<string, any>): void =>
        set(state => ({
          storeMetadata: [...state.storeMetadata, { ...metadataForm }],
        })),
    }),
    { name: "templates" },
  ),
);
