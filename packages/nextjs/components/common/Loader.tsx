import React from "react";

type TLoaderProps = {
  borderSize?: number;
  classModifier?: string;
  loaderWidth?: number;
  showText?: boolean;
};

const Loader = ({ borderSize = 2, classModifier = "", loaderWidth = 6, showText = false }: TLoaderProps) => {
  return (
    <div
      className={`inline-block h-${loaderWidth} w-${loaderWidth} animate-spin rounded-full border-${borderSize} border-solid border-current border-r-transparent align-[-0.125em] text-white motion-reduce:animate-[spin_1.5s_linear_infinite] ${classModifier}`}
      role="status"
    >
      {showText && (
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      )}
    </div>
  );
};

export default Loader;
