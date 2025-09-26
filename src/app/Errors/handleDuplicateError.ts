import {
  TErrorSources,
  TGenericErrorResponse,
} from "../Interface/error.interface";

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/"([^"]+)"/);

  const extractedMessage = match && match[1];

  const errorSources: TErrorSources = [
    {
      path: "",
      message: `${extractedMessage} is already exists`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: "Duplicate error!",
    errorSources,
  };
};

export default handleDuplicateError;
