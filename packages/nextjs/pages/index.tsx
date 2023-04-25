import type { NextPage } from "next";
import { DocumentIcon, SparklesIcon, StarIcon } from "@heroicons/react/24/outline";
import PrimaryButton from "~~/components/common/buttons/PrimaryButton";

const Home: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 mb-4">
        <h1 className="text-center mb-8 md:mb-2">
          <p className="block text-2xl mb-1">
            Are you a beer enjoyoor? <span className="text-2xl">🍺</span>
          </p>
          <br />
          <p className="block text-2xl mb-1">We present</p>
          <span className="block text-orange-600 text-4xl font-bold">Proof of Beer</span>
        </h1>
        <p className="text-center text-6xl mb-2">🍻</p>
        <p className="text-center text-2xl mb-1">
          <span className="text-2xl text-orange-600 font-bold">Collect</span> with your frens
        </p>
        <p className="text-center text-2xl mb-4">
          design drinking <span className="text-2xl text-orange-600 font-bold">Experiences</span>
        </p>
        <p className="text-center text-xl mb-2">Reward your best moments with</p>
        <p className="text-center text-4xl text-orange-600 font-bold">Beer Memories</p>
      </div>
      <div className="w-full flex justify-center">
        <PrimaryButton buttonText="Start creating POBs!" classModifier="text-xl" path="/dashboard" />
      </div>
      <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
        <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <div className="m-4">
              <SparklesIcon className="h-8 w-8 fill-orange-600" />
            </div>
            <p>
              With &quot;Profile POB&quot;©, you have unlimited mints. Make it your default POB, one you can share at
              any time, in the blink of an eye.
            </p>
          </div>
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <div className="m-4">
              <StarIcon className="h-8 w-8 fill-orange-600" />
            </div>
            <p>
              Thinking about a new experience for your audience? Create a special POB to commemorate your event! Share
              it with friends and preserve the memories! 25 POBs for 1 MATIC
            </p>
          </div>
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <div className="m-4">
              <DocumentIcon className="h-8 w-8 fill-orange-600" />
            </div>
            <p>
              Your keys, your POBs. You are in total control of the smart contracts, and you set the rules for mint,
              transfer and drops! We love decentralization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
