import { Exclude, Expose } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { IsBoolean } from 'class-validator';
import { get, OptionsWithUrl } from 'request-promise-native';
import { AUTHORIZATION_HEADER, BASIC_AUTH, DAMAGE_ENDPOINT, REQUEST_TIMEOUT } from '../../common/config';
import { UnexpectedServiceError } from '../../errors/UnexpectedServiceError';
import { ErrorHandler } from '../../middlewares/ErrorHandler';

/**
 * Handles everything regarding consuming Damage Service routes
 */
export class DamageService {

    /**
     * Sends a get request to the damage endpoint and retrieves the damage state for a given vehicle id.
     * @param vehicleId The vehicle id, the damaged state should be retrieved for.
     */
    public static async getDamageState(vehicleId: string): Promise<boolean> {
        try {
            const options: OptionsWithUrl = {
                headers: {
                    [AUTHORIZATION_HEADER]: `Basic ${BASIC_AUTH}`,
                },
                timeout: REQUEST_TIMEOUT,
                url: `${DAMAGE_ENDPOINT}/vehicle/${vehicleId}`,
            };
            const response = await transformAndValidate(DamageStateResponse , (JSON.parse(await get(options)) as object));
            return response.damaged;
        } catch (e) {
            await ErrorHandler.handleServiceErrors(e);
        }
        throw new UnexpectedServiceError();
    }
}

/**
 * The expected response from the damage state call.
 */
@Exclude()
class DamageStateResponse {
    @Expose()
    @IsBoolean()
    public damaged: boolean;
}
