import React from "react";
import BackButton from "~~/components/common/buttons/BackButton";

const CreatePOB = () => {
  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center mb-4">Your BEERS</h1>
      <BackButton />
      <div
        id="personal-beer-container"
        className="w-full md:w-11/12 my-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      ></div>
    </div>
  );
};

export default CreatePOB;
