import {z} from 'zod';

const GPTResponseSchema = z.object({
    choices: z.array(
        z.object({
            message: z.object({
                content: z.string(),
            }),
        }),
    ),
});

export async function validateGPTResponse(response: Response): Promise<string> {
    const responseData = await response.json();
    try {
        const parsed = GPTResponseSchema.parse(responseData);
        return parsed.choices[0].message.content.trim();
    } catch (error) {
        throw new Error(`Invalid API Response Format, Format ${error}`);
    }
}
