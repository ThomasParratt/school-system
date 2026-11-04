/** The shapes every endpoint shares: the error body and the `{ data }` envelope. */
import { z } from "zod";

export const ErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string(),
  }),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/** The error code of any input that fails its schema. */
export const VALIDATION_ERROR = "VALIDATION_ERROR";
/** The error code of a path id that is not a positive integer. */
export const INVALID_ID = "INVALID_ID";

/** Every success body wraps its payload in `data`. */
export const dataEnvelope = <T extends z.ZodType>(payload: T) => z.object({ data: payload });

/** The answer of a delete: `{ data: { message } }`. */
export const MessageResponseSchema = dataEnvelope(z.object({ message: z.string() }));
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
