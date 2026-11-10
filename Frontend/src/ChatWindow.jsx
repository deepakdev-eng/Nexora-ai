import "./ChatWindow.css";
import Chat from "./Chat";
import { MyContext } from "./MyContext";
import { useContext, useState } from "react";
import { BeatLoader } from "react-spinners";
import logo from "./assets/NexoraAI.png";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    currThreadId,
    setCurrThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
    setAllThreads,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);

  const getReply = async () => {
    const userText = prompt.trim();
    if (!userText || loading) return;

    setPrompt("");
    setNewChat(false);
    setLoading(true);
    setPrevChats((prev) => [
      ...prev,
      { role: "user", content: userText },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, threadId: currThreadId || null }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error ${response.status}: ${errorText}`);
      }
      if (!response.body) throw new Error("Response stream is not available.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processEvent = (event) => {
        const dataLine = event.split(/\r?\n/).find((line) => line.trimStart().startsWith("data:"));
        if (!dataLine) return;
        const data = dataLine.trimStart().slice(5).trim();
        if (!data || data === "[DONE]") return;

        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);

        // The server sends this event before streaming the answer.
        if (parsed.threadId) {
          setCurrThreadId(parsed.threadId);
          setAllThreads((current = []) => {
            const existing = current.some((thread) => thread.threadId === parsed.threadId);
            if (existing) return current;
            return [{ threadId: parsed.threadId, title: userText.slice(0, 50) }, ...current];
          });
        }

        if (parsed.chunk) {
          setPrevChats((current) => {
            const updated = [...current];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: updated[lastIndex].content + parsed.chunk,
              };
            }
            return updated;
          });
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || "";
        events.forEach(processEvent);
      }

      buffer += decoder.decode();
      if (buffer.trim()) processEvent(buffer);
    } catch (error) {
      console.error("Chat Error:", error);
      setPrevChats((current) => {
        const updated = [...current];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: "Sorry, something went wrong. Please try again.",
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatwindow">
      <header className="navbar">
        <div className="navbarBrand">
          <div className="brandIcon"><img src={logo} alt="Nexora AI Logo" /></div>
          <div className="brandDetails">
            <span className="logoText">Nexora AI</span>
            <span className="brandTagline">Your AI companion</span>
          </div>
          <span className="versionBadge">BETA</span>
        </div>
        <div className="navbarActions">
          <div className="userProfile" title="Your profile">
            <div className="userAvatar">D</div>
            <i className="fa-solid fa-chevron-down profileArrow" aria-hidden="true"></i>
          </div>
        </div>
      </header>

      <Chat />

      {loading && (
        <div className="centerLoader" aria-label="Generating response">
          <BeatLoader color="#a78bfa" size={12} margin={5} />
        </div>
      )}

      <form className="chatInput" onSubmit={(event) => { event.preventDefault(); getReply(); }}>
        <div className="userInput">
          <input
            type="text"
            placeholder="Ask anything..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={loading}
            aria-label="Message Nexora AI"
          />
          <button type="submit" id="submit" disabled={loading || !prompt.trim()} aria-label="Send message">
            <i className="fa-solid fa-paper-plane" aria-hidden="true"></i>
          </button>
        </div>
        <p className="info">Nexora AI can make mistakes. Check important information.</p>
      </form>
    </div>
  );
}

export default ChatWindow;
