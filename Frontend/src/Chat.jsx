import "./Chat.css";
import { useContext } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const markdownComponents = {
  pre: ({ node, ...props }) => (
    <div className="code-block-wrapper">
      <pre {...props} />
    </div>
  ),
  code: ({ node, className, children, ...props }) => {
    const isBlock = /language-(\w+)/.test(className || "");
    return isBlock ? (
      <code className={className} {...props}>
        {children}
      </code>
    ) : (
      <code className="inline-code" {...props}>
        {children}
      </code>
    );
  },
  table: ({ children, ...props }) => (
    <div className="table-wrapper">
      <table {...props}>{children}</table>
    </div>
  ),
};

function Chat() {
  const { newChat, prevChats = [], setPrompt } = useContext(MyContext);

  const suggestions = [
    {
      icon: "fa-code",
      title: "Write code",
      description: "Create, debug and understand code",
      prompt: "Help me write a React component",
    },
    {
      icon: "fa-lightbulb",
      title: "Get ideas",
      description: "Explore creative ideas and solutions",
      prompt: "Give me some creative project ideas",
    },
    {
      icon: "fa-book-open",
      title: "Learn something",
      description: "Understand any topic step by step",
      prompt: "Teach me JavaScript promises",
    },
    {
      icon: "fa-pen",
      title: "Write something",
      description: "Draft emails, posts and documents",
      prompt: "Write a professional LinkedIn post",
    },
  ];

  return (
    <div className="chats">
      {newChat && prevChats.length === 0 && (
        <div className="welcomeScreen">
          <h1>
            Welcome to <span>Nexora AI</span>
          </h1>
          <p className="welcomeSubtitle">
            Your ideas, questions and creativity start here. What would you like
            to explore today?
          </p>
          <div className="suggestionGrid">
            {suggestions.map((item) => (
              <button
                type="button"
                className="suggestionCard"
                key={item.title}
                onClick={() => setPrompt(item.prompt)}
              >
                <div className="suggestionIcon">
                  <i className={`fa-solid ${item.icon}`} aria-hidden="true"></i>
                </div>
                <div className="suggestionText">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <i
                  className="fa-solid fa-arrow-up-right-from-square suggestionArrow"
                  aria-hidden="true"
                ></i>
              </button>
            ))}
          </div>
          <div className="welcomeFooter">
            <i
              className="fa-solid fa-wand-magic-sparkles"
              aria-hidden="true"
            ></i>
            <span>Powered by Nexora AI</span>
          </div>
        </div>
      )}

      {prevChats.map((chat, idx) => (
        <div
          key={`${idx}-${chat.role}`}
          className={chat.role === "user" ? "userDiv" : "gptDiv"}
        >
          {chat.role === "user" ? (
            <p className="userMessage">{chat.content}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents}
              >
                {chat.content || ""}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Chat;
