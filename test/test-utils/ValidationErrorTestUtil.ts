import { ValidationError } from 'class-validator';

/**
 * Util class for helping with ValidationErrors to be handled easier.
 */
export class ValidationErrorTestUtil {
    public static validationErrorToStringArray(validationErrors: ValidationError[] | ValidationError[][]): string[] | string[][] {
        if ((validationErrors as ValidationError[][]).every((e: ValidationError[]) => Array.isArray(e))) {
            return (validationErrors as ValidationError[][]).map((val: ValidationError[]) => ValidationErrorTestUtil.validationErrorToStringArray(val)) as string[][];
        } else {
            return (validationErrors as ValidationError[]).reduce((accumulator: string[], currentError: ValidationError): string[] => {
                if (currentError.constraints === undefined && currentError.children !== undefined) {
                    accumulator.push(...ValidationErrorTestUtil.validationErrorToStringArray(currentError.children) as string[]);
                }
                if (currentError.constraints !== undefined) {
                    accumulator.push(...Object.values(currentError.constraints).map((value) => value + '.'));
                }
                return accumulator;
            }, []);
        }
    }
}
