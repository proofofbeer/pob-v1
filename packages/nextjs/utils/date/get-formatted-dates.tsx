export const getJsDateFromUnixTimestamp = (unixTimestamp: number) => {
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date = new Date(unixTimestamp * 1000);
  // Hours part from the timestamp
  const hours = date.getHours();
  // Minutes part from the timestamp
  const minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  const seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  const formattedTime = hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  return formattedTime;
};

export const formatDateLocale = (dateToFormat: string, format: string): string => {
  let jsDateFormat;
  let formattedDate;
  if (format === "yyyy-mm-dd") {
    jsDateFormat = toDate(dateToFormat);
  } else jsDateFormat = "01-01-2000";

  const jsDate = new Date(jsDateFormat);
  switch (format) {
    case "yyyy-mm-dd":
      formattedDate = jsDate.toDateString();
  }

  return formattedDate as string;
};

const toDate = (dateStr: string) => {
  const parts = dateStr.split("-");
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};
