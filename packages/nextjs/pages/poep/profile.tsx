import { useState } from "react";
import Loader from "~~/components/common/Loader";
import BackButton from "~~/components/common/buttons/BackButton";

const CreatePOEPProfile = () => {
  // const [form, setForm] = useState<Record<string, any>>(() => getInitialPoepFormState(createPoepInputsArray));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (event: any) => {
    event.preventDefault();
  };
  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center">
      <h1 className="text-4xl font-semibold text-center mb-4">Create POEP Profile</h1>
      <BackButton />
      <div
        id="form-container"
        className="w-full md:w-4/5 mb-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center w-full md:w-3/5 pb-4 pt-8 px-6"
        >
          Here are the inputs
          <div className="w-full flex justify-center my-4 py-4">
            <button
              className="flex items-center justify-center normal-case text-lg btn bg-orange-600 hover:bg-orange-500 border-orange-600 text-white btn-md w-3/5 md:w-1/3 lg:w-1/4 xl:w-1/5"
              disabled={isLoading}
            >
              {!isLoading ? "Create Profile" : "Creating"}
              {isLoading && (
                <div className="ml-2">
                  <Loader />
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePOEPProfile;
