import { saveAs } from "file-saver";
import JSZip from "jszip";
import QRCode, { QRCodeToDataURLOptions } from "qrcode";

const defaultOptions: Partial<QRCodeToDataURLOptions> = {
  errorCorrectionLevel: "M",
  width: 256,
};

export const getQRImages = async (list: string[], options?: QRCodeToDataURLOptions): Promise<string[]> => {
  console.log(list);
  const qrCodeUrlPromises = list.map(item => QRCode.toDataURL(item, { ...defaultOptions, ...options }));
  const images = await Promise.all(qrCodeUrlPromises);
  return images;
};

export const handleZipDownload = async (list: string[]) => {
  const zip = new JSZip();
  list.forEach((item, index) => {
    const imgData = item.substring(22);
    zip.file(`pob-batch-${index + 1}.png`, imgData, { base64: true });
  });
  const zipped = await zip.generateAsync({
    type: "blob",
    comment: "https://proofof.beer",
  });
  saveAs(zipped, "pob-batch-qr-codes");
};
