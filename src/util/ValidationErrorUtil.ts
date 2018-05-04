import { ValidationError } from 'class-validator';

/**
 * Utility functions regarding ValidationErrors.
 */
export class ValidationErrorUtil {
    /**
     * Checks if the given object is an Array of ValidationErrors.
     * @param e The error.
     * @param logMeta The log meta data
     */
    public static async checkForValidationErrors(e: any): Promise<boolean> {
        if (Array.isArray(e) && e.length > 0 && e.every((error) => Array.isArray(error))) {
            return (await Promise.all((e as any[][]).map((errors: any[]) => ValidationErrorUtil.checkForValidationErrors(errors)))).every((result) => result);
        } else {
            return (Array.isArray(e) && e.length > 0 && e.every((error) => error instanceof ValidationError));
        }
    }
}
