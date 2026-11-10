import express from "express";
import { randomUUID } from "node:crypto";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const thread = new Thread({
      threadId: randomUUID(),
      title: "Testing New Threads",
      messages: [],
    });

    const response = await thread.save();
    return res.status(201).json(response);
  } catch (err) {
    console.error("Test Thread Error:", err);

    return res.status(500).json({
      error: "Failed to create test thread",
    });
  }
});
// Get all threads
router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find({}).sort({ updatedAt: -1 });

    return res.json(threads);
  } catch (err) {
    console.error("Fetch Threads Error:", err);

    return res.status(500).json({
      error: "Failed to fetch threads",
    });
  }
});

// Get single thread messages
router.get("/thread/:threadId", async (req, res) => {
  try {
    const thread = await Thread.findOne({
      threadId: req.params.threadId,
    });

    if (!thread) {
      return res.status(404).json({
        error: "Thread not found",
      });
    }

    return res.json(thread.messages);
  } catch (err) {
    console.error("Fetch Thread Error:", err);

    return res.status(500).json({
      error: "Failed to fetch thread",
    });
  }
});

// Delete thread
router.delete("/thread/:threadId", async (req, res) => {
  try {
    const deletedThread = await Thread.findOneAndDelete({
      threadId: req.params.threadId,
    });

    if (!deletedThread) {
      return res.status(404).json({
        error: "Thread not found",
      });
    }

    return res.status(200).json({
      success: "Thread deleted successfully",
    });
  } catch (err) {
    console.error("Delete Thread Error:", err);

    return res.status(500).json({
      error: "Failed to delete thread",
    });
  }
});

// Chat with Nexora AI - SSE Streaming
router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;

  // Validate message
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "A valid message is required",
    });
  }

  try {
    let thread;

    // Find existing conversation
    if (threadId) {
      thread = await Thread.findOne({ threadId });

      if (!thread) {
        return res.status(404).json({
          error: "Thread not found",
        });
      }
    } else {
      // Create a new conversation
      thread = new Thread({
        threadId: randomUUID(),
        title: message.trim().slice(0, 50),
        messages: [],
      });
    }

    // Save user message
    thread.messages.push({
      role: "user",
      content: message.trim(),
    });

    // Configure streaming response
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");

    res.setHeader("Cache-Control", "no-cache, no-transform");

    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    // Send thread ID first
    res.write(
      `data: ${JSON.stringify({
        threadId: thread.threadId,
      })}\n\n`,
    );

    // Stream AI response
    const fullReply = await getOpenAIAPIResponse(message.trim(), (chunk) => {
      if (!res.writableEnded && !res.destroyed) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    });

    if (typeof fullReply !== "string" || !fullReply.trim()) {
      throw new Error("AI returned an empty response");
    }

    // Save assistant response
    thread.messages.push({
      role: "assistant",
      content: fullReply,
    });

    thread.updatedAt = new Date();

    await thread.save();

    // Finish stream
    if (!res.writableEnded && !res.destroyed) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (err) {
    console.error("Streaming Chat Error:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        error: "Failed to generate response",
      });
    }

    if (!res.writableEnded && !res.destroyed) {
      res.write(
        `data: ${JSON.stringify({
          error: err.message || "Failed to generate response",
        })}\n\n`,
      );

      res.end();
    }
  }
});

export default router;
