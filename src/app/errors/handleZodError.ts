import { ZodError, ZodIssue } from "zod";
import { TErrorDetails, TGenericErrorResponse } from "../interface/error";

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  let message = "";
  const errorDetails: TErrorDetails = {
    issues: err.issues.map((issue: ZodIssue) => {
      const fieldPath = issue?.path[issue.path.length - 1] ?? 'field';
      message =
        message + issue.message == "Expected number, received string"
          ? fieldPath as string + " " + issue.message
          : message + ". " + issue.message;
      return {
        path: fieldPath,
        message: issue.message,
      };
    }),
  };

  const statusCode = 400;

  return {
    statusCode,
    message,
    errorDetails,
  };
};

export default handleZodError;
