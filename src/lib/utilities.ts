export const createTimeout = (ms: number, errorMessage: string): Promise<never> => {
    return new Promise((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), ms)
    );
};
