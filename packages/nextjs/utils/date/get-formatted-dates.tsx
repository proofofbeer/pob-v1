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

  console.log(formattedTime);
};

export const formatDateLocale = (dateToFormat: string, format: string) => {
  let jsDateFormat;
  if (format === "yyyy-mm-dd") {
    jsDateFormat = toDate(dateToFormat);
  } else jsDateFormat = "01-01-2000";
  console.log(jsDateFormat);
  const formattedDate = new Date(jsDateFormat);
  switch (format) {
    case "yyyy-mm-dd":
      console.log(formattedDate?.toLocaleDateString("en-CA"));
      return formattedDate?.toDateString();
  }
};

const toDate = (dateStr: string) => {
  const parts = dateStr.split("-");
  console.log(parts);
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};
