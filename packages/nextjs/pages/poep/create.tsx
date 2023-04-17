import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "~~/components/common/Loader";
import BackButton from "~~/components/common/buttons/BackButton";
import FilePreview from "~~/components/image-handling/FilePreview";
import { InputBase } from "~~/components/inputs/InputBase";
import ToggleInput from "~~/components/inputs/ToggleInput";
import { createPoepInputsArray, getInitialPoepFormState } from "~~/components/poep/poep-form-inputs";
import { useAppStore } from "~~/services/store/store";

const CreatePOEP = () => {
  const router = useRouter();
  const fileFormKey = "poap_image_file";
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialPoepFormState(createPoepInputsArray, fileFormKey),
  );
  const [imageObj, setImgObj] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentImgName = useAppStore(state => state.currentImgName);

  const previewImage = useMemo(() => {
    console.log(imageObj);
    if (imageObj) {
      return URL.createObjectURL(new Blob([imageObj]));
    }
    return null;
  }, [imageObj]);

  const poepFormInputs = useMemo(
    () =>
      createPoepInputsArray.map((input: any, inputIndex: number) => {
        if (input.showWithToggleName?.length > 1 && form[input.showWithToggleName[0]] !== input.showWithToggleName[1]) {
          return;
        }
        return (
          <div className="w-full mb-4 lg:mb-4" key={`${input.name}_${inputIndex}`}>
            <div className="mb-1 pl-2">
              <label className="text-lg font-medium">{input.label}</label>
            </div>
            {input.type !== "toggle" ? (
              <InputBase
                name={input.name}
                type={input.type}
                value={form[input.name] || ""}
                onChange={(value: any) => {
                  setForm(form => ({ ...form, [input.name]: value }));
                }}
                placeholder={input.placeholder}
                error={input.isError || false}
                disabled={input.isDisabled || false}
              />
            ) : (
              <ToggleInput
                name={input.name}
                isDefaultValueA={true}
                onChange={(value: any) => {
                  setForm(form => ({ ...form, [input.name]: value }));
                }}
                valueA={input.valueA}
                valueB={input.valueB}
              />
            )}
          </div>
        );
      }),
    [form],
  );

  const handleSubmit: any = useCallback(
    async (event: any) => {
      setIsLoading(true);
      event?.preventDefault();
      console.log(form);
      try {
        const formData = new FormData();
        formData.append("imgFileName", currentImgName);
        formData.append("files", new Blob([imageObj]));
        if (Object.keys(form).length > 0) {
          for (const key in form) {
            formData.append(key, form[key]);
          }
        }
        const response = await axios.post("/api/upload-files", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        alert(JSON.stringify(response.data));
        toast.success("Successfully created your POEP drop!!!", {
          position: "top-center",
        });
        router.push("/poep");
      } catch (error: any) {
        if (error.body) {
          const parsedBody = JSON.parse(error.body);
          const { message } = parsedBody.error;
          toast.error(message, {
            position: "bottom-right",
          });
        } else {
          console.error(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentImgName, form, imageObj, router],
  );

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center">
      <h1 className="text-4xl font-semibold text-center mb-4">Create POEP Drop</h1>
      <BackButton />
      <div
        id="preview-container"
        className="w-full md:w-4/5 mb-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      >
        <FilePreview fileFormKey={fileFormKey} previewImage={previewImage} setImgObj={setImgObj} />
      </div>
      <div
        id="form-container"
        className="w-full md:w-4/5 mb-4 rounded-lg flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center w-full md:w-3/5 pb-4 pt-8 px-6"
        >
          {poepFormInputs}
          <div className="w-full flex justify-center my-4 py-4">
            <button
              className="flex items-center justify-center normal-case text-lg btn bg-orange-600 hover:bg-orange-500 border-orange-600 text-white btn-md w-3/5 md:w-1/3 lg:w-1/4 xl:w-1/5"
              disabled={isLoading}
            >
              {!isLoading ? "Create DROP" : "Creating"}
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

export default CreatePOEP;
