import { useEffect, useState } from "react";

type TWindowSize = {
  width: number | undefined;
  height: number | undefined;
};

const useGetWindowSize = () => {
  const [windowSize, setWindowSize] = useState<TWindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleWindowResize);

    handleWindowResize();

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return windowSize;
};

export default useGetWindowSize;
