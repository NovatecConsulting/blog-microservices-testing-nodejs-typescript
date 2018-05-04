/**
 * The stored procedure to delete all documents for a collection.
 * @param query A query that provides the documents to be deleted. eg. 'SELECT * FROM root'
 */
export function bulkDeleteAll(query: string) {
    const collection: ICollection = getContext().getCollection();
    const collectionLink: string = collection.getSelfLink();
    const response: IResponse = getContext().getResponse();
    const responseBody = {
        continuation: true,
        deleted: 0,
    };

    if (!query) { throw new Error('The query is undefined or null.'); }

    tryQueryAndDelete();

    function tryQueryAndDelete(continuation?: string) {
        const requestOptions: IFeedOptions = { continuation };
        const isAccepted: boolean = collection.queryDocuments(
            collectionLink, query, requestOptions, (err: IFeedCallbackError, retrievedDocs: any[], responseOptions: IFeedCallbackOptions) => {
                if (err) {
                    throw err;
                }

                if (retrievedDocs.length > 0) {
                    // Begin deleting documents as soon as documents are returned form the query results.
                    // tryDelete() resumes querying after deleting; no need to page through continuation tokens.
                    //  - this is to prioritize writes over reads given timeout constraints.
                    tryDelete(retrievedDocs);
                } else if (responseOptions.continuation) {
                    // Else if the query came back empty, but with a continuation token; repeat the query w/ the token.
                    tryQueryAndDelete(responseOptions.continuation);
                } else {
                    // Else if there are no more documents and no continuation token - we are finished deleting documents.
                    responseBody.continuation = false;
                    response.setBody(responseBody);
                }
            });

        // If we hit execution bounds - return continuation: true.
        if (!isAccepted) {
            response.setBody(responseBody);
        }
    }

    function tryDelete(documents: IDocumentMeta[]) {
        if (documents.length > 0) {
            // Delete the first document in the array.
            const isAccepted: boolean = collection.deleteDocument(documents[0]._self, (err: IRequestCallbackError,
                                                                                       resources: object, responseOptions: IRequestCallbackOptions) => {
                if (err) {
                    throw err;
                }
                responseBody.deleted++;
                documents.shift();
                // Delete the next document in the array.
                tryDelete(documents);
            });

            // If we hit execution bounds - return continuation: true.
            if (!isAccepted) {
                response.setBody(responseBody);
            }
        } else {
            // If the document array is empty, query for more documents.
            tryQueryAndDelete();
        }
    }
}
