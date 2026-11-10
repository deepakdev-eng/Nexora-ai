import "dotenv/config";

const getOpenAIAPIResponse = async (message, onChunk) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing from .env");
  }

  if (typeof message !== "string" || !message.trim()) {
    throw new Error("A valid message is required");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        messages: [
          {
            role: "user",
            content: message.trim(),
          },
        ],
        temperature: 0.7,
        stream: true,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    let errorMessage = "Groq API request failed";

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("Groq response stream is unavailable");
  }

  let fullReply = "";
  let buffer = "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const processLine = (line) => {
    line = line.trim();

    if (!line.startsWith("data:")) return false;

    const data = line.slice(5).trim();

    if (!data) return false;

    if (data === "[DONE]") return true;

    const parsed = JSON.parse(data);

    if (parsed.error) {
      throw new Error(parsed.error.message || "Groq streaming error");
    }

    const chunk = parsed.choices?.[0]?.delta?.content || "";

    if (chunk) {
      fullReply += chunk;

      if (typeof onChunk === "function") {
        onChunk(chunk);
      }
    }

    return false;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");

      // Keep incomplete line for the next stream chunk
      buffer = lines.pop() || "";

      for (const line of lines) {
        processLine(line);
      }
    }

    // Process remaining decoder data
    buffer += decoder.decode();

    if (buffer.trim()) {
      processLine(buffer);
    }

    if (!fullReply.trim()) {
      throw new Error("Groq returned an empty response");
    }

    return fullReply;
  } catch (error) {
    console.error("Groq Streaming Error:", error.message);
    throw error;
  } finally {
    reader.releaseLock();
  }
};

export default getOpenAIAPIResponse;
