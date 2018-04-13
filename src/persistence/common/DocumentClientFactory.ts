import { ConnectionPolicy, DocumentClient, MediaReadMode, RetryOptions } from 'documentdb';
import { DATABASE_MASTER_KEY, DATABASE_URL } from '../../common/config';

/**
 * Returns the documentdb document client.
 */
class DocumentClientFactory {

    public documentClient: DocumentClient;

    constructor() {
        this.documentClient = new DocumentClient(DATABASE_URL,
            { masterKey: DATABASE_MASTER_KEY },
            new ConnPolicy(8000, 8000, new RetOptions(5, 1)),
            'Session',
        );
    }
}

// tslint:disable:variable-name

/**
 * Represents a ConnectionPolicy for DocumentClient.
 */
class ConnPolicy implements ConnectionPolicy {
    public ConnectionMode: number;
    public RetryOptions: RetryOptions;
    public MediaReadMode: MediaReadMode;

    constructor(public MediaRequestTimeout: number = 300000, public RequestTimeout: number = 60000, retryOptions?: RetryOptions,
                mediaReadMode: MediaReadMode = 'Buffered', public EnableEndpointDiscovery: boolean = true, public PreferredLocations: any[] = [],
                public DisableSSLVerification: boolean = false) {
        this.ConnectionMode = 0; // Gateway at the moment this is the only option. DirectMode would be much nicer and better in performance.
        this.RetryOptions = retryOptions !== undefined ? retryOptions : new RetOptions();
        this.MediaReadMode = mediaReadMode;
    }
}

/**
 * Represents the RetryOptions object for ConnectionPolicy.
 */
class RetOptions implements RetryOptions {
    constructor(public MaxRetryAttemptCount: number = 9, public MaxWaitTimeInSeconds: number = 30, public FixedRetryIntervalInMilliseconds?: number) { }
}

export default new DocumentClientFactory().documentClient;
