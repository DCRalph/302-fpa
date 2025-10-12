import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";

type result<T> = { result: T; successMessage: string; errorMessage: string };

export const handleTRPCMutation = async <T>(
  mutation: () => Promise<T>,
  successMessage: string,
  errorMessage = "An error occurred",
) => {
  const promise = new Promise<result<T>>((resolve, reject) => {
    mutation()
      .then((result) => {
        resolve({ result, successMessage, errorMessage });
      })
      .catch((error) => {
        // Make error messages pretty and user-friendly
        let prettyMessage = errorMessage;

        if (error instanceof TRPCClientError) {
          // Try to extract a nice message from TRPC error data
          if (error.data && typeof error.data === 'object' && 'zodError' in error.data) {
            const zodError = (error.data as { zodError?: unknown }).zodError;
            if (zodError && typeof zodError === 'object' && 'fieldErrors' in zodError) {
              // Zod validation errors
              const fieldErrors = (zodError as { fieldErrors: Record<string, unknown> }).fieldErrors;
              const messages = Object.entries(fieldErrors)
                .map(([field, errs]) => {
                  if (Array.isArray(errs)) {
                    return errs.map((msg) => `${capitalize(field)}: ${String(msg)}`).join(" - ");
                  }
                  return "";
                })
                .filter(Boolean)
                .join(" | ");
              prettyMessage = `${errorMessage}\n${messages}`;
            }
          } else if (error.data && typeof error.data === 'object' && 'code' in error.data && error.message) {
            // TRPC error with code and message
            const code = (error.data as { code: unknown }).code;
            prettyMessage = `${errorMessage}\n${capitalize(String(code))}: ${error.message}`;
          } else if (error.message) {
            prettyMessage = `${errorMessage}\n${error.message}`;
          } else {
            prettyMessage = errorMessage;
          }
          reject(new Error(prettyMessage));
        } else if (error instanceof Error) {
          // Show the error message, not just the name
          prettyMessage = `${errorMessage}\n${error.message}`;
          reject(new Error(prettyMessage));
        } else if (typeof error === "string") {
          prettyMessage = `${errorMessage}\n${error}`;
          reject(new Error(prettyMessage));
        } else {
          reject(new Error(errorMessage));
        }
      });
  });

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  toast.promise(promise, {
    loading: "Loading...",
    success: (data: result<T>) => {
      return data.successMessage;
    },
    error: (data: Error) => {
      console.log(data);
      return data.message;
    },
  });
  return promise;
};