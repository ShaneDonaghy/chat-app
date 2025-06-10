export async function callGPTAPI(data: object) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Bun.env.OPEN_API_KEY}`
        },
    });
    return res;
}
