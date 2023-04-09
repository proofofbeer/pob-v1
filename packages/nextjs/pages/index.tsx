import type { NextPage } from "next";
import { DocumentIcon, SparklesIcon, StarIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center mb-8 md:mb-4">
          <span className="block text-2xl mb-1">Create Digital Collectibles</span> <br />
          <span className="block text-orange-600 text-4xl font-bold">Proof of Engagement Protocol</span>
        </h1>
        <p className="text-center text-2xl mb-1">
          <span className="text-2xl text-orange-600 font-bold">Connect</span> with your audience
        </p>
        <p className="text-center text-2xl mb-1">
          design <span className="text-2xl text-orange-600 font-bold">Experiences</span>
        </p>
        <p className="text-center text-xl mb-2">engagement is rewarded with</p>
        <p className="text-center text-4xl text-orange-600 font-bold">Memories</p>
      </div>

      <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
        <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <div className="m-4">
              <StarIcon className="h-8 w-8 fill-orange-600" />
            </div>
            <p>
              Thinking about a new Experience for your users or audience? Draft your Experience NFT and save it as a
              Template
            </p>
          </div>
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <div className="m-4">
              <DocumentIcon className="h-8 w-8 fill-orange-600" />
            </div>
            <p>
              Design and deploy your Experience NFT Contract in 3 clicks. One-of-one, fixed supply, or unlimited. Just
              like your options, the decentralized way.
            </p>
          </div>
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <div className="m-4">
              <SparklesIcon className="h-8 w-8 fill-orange-600" />
            </div>
            <p>
              With &quot;Memories and Unlocking Mechanisms&quot;©, innovate with Experiences. Surprise your community
              with fun mechanics and reward them for their Engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
