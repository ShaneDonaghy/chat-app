export async function retryWrapper(
    fn: () => Promise<Response>,
    retryCount: number = 3,
    delay: number = 1000,
): Promise<Response> {
    async function attempt(attemptNumber: number = 1): Promise<Response> {
        try {
            const result = await fn();
            if(!result.ok){
                throw new Error(`Request Failed with status ${result.status}`);
            }
        }
    }
}

)