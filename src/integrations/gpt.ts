import {callGPTAPI} from "./api";
import {retryWrapper} from "./retry";
import {validateGPTResponse} from "./validation";
import {HTTPException} from "hono/dist/types/http-exception";

export async function getGPTAnswer(data: object){
    try {
        const response = await retryWrapper(() => callGPTAPI(data));
        return await validateGPTResponse(response);
    } catch {
        throw new HTTPException(503, {
            message: "GPT Integration is Down - Try Again Later"
        });
    }
}