import { hardhat } from "wagmi/chains";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useHasHydrated } from "~~/hooks/next-zustand/useHasHydrated";
import { useAppStore } from "~~/services/store/store";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * Site footer
 */
export const Footer = () => {
  const hasHydrated = useHasHydrated();
  const ethPrice = useAppStore(state => state.ethPrice);

  return (
    <div className="min-h-0 p-5 mb-0 relative">
      <div className="sm:absolute bottom-0 left-0 w-full p-0">
        <div className="flex justify-between items-center w-full z-20 p-4 pointer-events-none">
          <div className="flex space-x-2 pointer-events-auto">
            {hasHydrated && ethPrice > 0 && (
              <div className="btn btn-primary btn-sm font-normal cursor-auto">
                <CurrencyDollarIcon className="h-4 w-4 mr-0.5" />
                <span>{ethPrice}</span>
              </div>
            )}
            {getTargetNetwork().id === hardhat.id && <Faucet />}
          </div>
          <SwitchTheme className="pointer-events-auto" />
        </div>
      </div>
    </div>
  );
};
