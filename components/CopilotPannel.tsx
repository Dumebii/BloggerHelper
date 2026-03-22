"use client";
import { useState, useRef, useEffect } from "react";
import { Send, X, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TextareaAutosize from 'react-textarea-autosize';

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToEngine: (text: string) => void;
}

export default function CopilotPanel({ isOpen, onClose, onSendToEngine }: CopilotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your content copilot. What do you want to brainstorm today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // In CopilotPanel component, add:
const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  const adjustHeight = () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  adjustHeight();
  textarea.addEventListener('input', adjustHeight);
  return () => textarea.removeEventListener('input', adjustHeight);
}, [input]); // re-run when input changes (though the event listener will handle dynamic changes)

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage], 
          search: searchEnabled   // 👈 pass the toggle state
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed to connect");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      // Add a temporary assistant message that we'll update
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Update the last message (assistant) with accumulated text
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = accumulated;
          return newMessages;
        });
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Ozigi Copilot</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-red-600">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-800 prose prose-sm max-w-none"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-800 rounded-2xl px-4 py-2 text-sm">
              <div className="flex gap-1">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse animation-delay-200">●</span>
                <span className="animate-pulse animation-delay-400">●</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 p-4 bg-white">
        <div className="flex gap-2">

<TextareaAutosize
  minRows={2}
  maxRows={10}
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Ask me anything..."
  className="flex-1 bg-white rounded-xl px-4 py-3 text-sm text-slate-900 border border-slate-200 focus:outline-none focus:border-red-500 placeholder:text-slate-400 resize-none"
/>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 self-end"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Search toggle */}
        <div className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            id="search-toggle"
            checked={searchEnabled}
            onChange={(e) => setSearchEnabled(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="search-toggle" className="text-[10px] font-bold text-slate-500">
            Search the web (enhances answers)
          </label>
        </div>

        {/* Send to Engine button */}
        {messages.length > 1 && messages[messages.length - 1].role === "assistant" && (
          <button
            onClick={() => onSendToEngine(messages[messages.length - 1].content)}
            className="mt-3 w-full bg-indigo-50 text-indigo-700 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 flex items-center justify-center gap-2"
          >
            Send to Context Engine <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}