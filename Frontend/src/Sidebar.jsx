import "./Sidebar.css";
import logo from "./assets/NexoraAI.png";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext";

function Sidebar() {
  const [toast, setToast] = useState("");
  const {
    allThreads = [],
    setAllThreads,
    currThreadId,
    setCurrThreadId,
    setPrevChats,
    setNewChat,
    setPrompt,
  } = useContext(MyContext);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getAllThreads = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/thread");
      if (!response.ok) throw new Error("Failed to fetch chat history");
      const threads = await response.json();
      setAllThreads(
        threads.map((thread) => ({
          threadId: thread.threadId,
          title: thread.title || "New conversation",
        })),
      );
    } catch (error) {
      console.error("Sidebar Error:", error);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, []);

  const createNewChat = () => {
    setPrompt("");
    setPrevChats([]);
    // null tells the backend this is a new conversation; the server creates its ID.
    setCurrThreadId(null);
    setNewChat(true);
    setIsMobileOpen(false);
  };

  const changeThread = async (threadId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${threadId}`,
      );
      if (!response.ok) throw new Error("Failed to load conversation");
      const messages = await response.json();
      setCurrThreadId(threadId);
      setPrevChats(Array.isArray(messages) ? messages : []);
      setPrompt("");
      setNewChat(false);
      setIsMobileOpen(false);
    } catch (error) {
      console.error("Open Chat Error:", error);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${threadId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      // Remove from sidebar immediately after successful deletion
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );

      // Reset current chat if it was deleted
      if (currThreadId === threadId) {
        setCurrThreadId(null);
        setPrevChats([]);
        setPrompt("");
        setNewChat(true);
      }

      // Show success toast instead of popup
      setToast("Conversation deleted successfully");

      setTimeout(() => {
        setToast("");
      }, 3000);
    } catch (error) {
      console.error("Delete Error:", error);

      setToast("Unable to delete conversation");

      setTimeout(() => {
        setToast("");
      }, 3000);
    }
  };

  return (
    <>
      <button
        className="sidebarMobileToggle"
        type="button"
        onClick={() => setIsMobileOpen((open) => !open)}
        aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isMobileOpen}
      >
        <i
          className={`fa-solid ${isMobileOpen ? "fa-xmark" : "fa-bars"}`}
          aria-hidden="true"
        ></i>
      </button>

      {isMobileOpen && (
        <button
          className="sidebarOverlay"
          type="button"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? "sidebarOpen" : ""}`}>
        <button
          type="button"
          className="newChatSidebar"
          onClick={createNewChat}
          title="Start a new chat"
        >
          <img src={logo} alt="Nexora AI logo" />
          <span>New Chat</span>
          <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
        </button>

        <ul className="history">
          {allThreads?.map((thread) => (
            <li
              key={thread.threadId}
              className={currThreadId === thread.threadId ? "active" : ""}
              onClick={() => changeThread(thread.threadId)}
              title={thread.title}
            >
              <i className="fa-regular fa-message"></i>

              <span className="threadTitle">{thread.title}</span>

              <button
                type="button"
                className="deleteThreadBtn"
                title="Delete conversation"
                aria-label={`Delete ${thread.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.threadId);
                }}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </li>
          ))}
        </ul>

        <div className="sidebarFooter">
          <p>Made with ❤️ by Deepak</p>
        </div>
      </aside>
      {toast && (
        <div
          className={`toastMessage ${
            toast.includes("Unable") ? "toastError" : ""
          }`}
        >
          <i
            className={`fa-solid ${
              toast.includes("Unable")
                ? "fa-circle-exclamation"
                : "fa-circle-check"
            }`}
          ></i>

          <span>{toast}</span>
        </div>
      )}
    </>
  );
}

export default Sidebar;
