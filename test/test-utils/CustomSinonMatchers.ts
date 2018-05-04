/**
 * Custom matchers for sinon.
 */
export class CustomSinonMatchers {
    public static MATCH_UUID_4_MESSAGE = 'uuid.v4()';
    public static matchUUID4(value: any): boolean {
        return /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(value);
    }
}
