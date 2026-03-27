"use client";
import { useState, useRef, useEffect } from "react";
import { Send, X, ArrowRight, Trash2, Globe, Loader2, User, Bot } from "lucide-react";
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
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ozigi_copilot_conversation");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [
      { role: "assistant", content: "Hi! I'm your content copilot. What do you want to brainstorm today?" }
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem("ozigi_copilot_conversation", JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
          search: searchEnabled
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed to connect");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

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

  const handleClearConversation = () => {
    setMessages([
      { role: "assistant", content: "Hi! I'm your content copilot. What do you want to brainstorm today?" }
    ]);
    localStorage.removeItem("ozigi_copilot_conversation");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-brand-navy text-white">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h2 className="text-sm font-black uppercase tracking-widest">Ozigi Copilot</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearConversation}
            className="text-white/70 hover:text-white transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={16} />
          </button>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === "user" 
                  ? "bg-brand-red text-white" 
                  : "bg-slate-100 text-slate-600"
              }`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={`rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-brand-red text-white"
                  : "bg-slate-100 text-slate-800"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-red-600 prose-code:bg-slate-200 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:overflow-x-auto prose-pre:text-xs">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" className="text-brand-red underline" />
                        ),
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        h1: ({ children }) => <h1 className="text-xl font-black mt-4 mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        code: ({ node, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const inline = !match && !className?.includes('language-');
                          return inline ? (
                            <code className="bg-slate-200 px-1 rounded text-xs text-red-600" {...props}>{children}</code>
                          ) : (
                            <pre className="bg-slate-800 text-slate-100 p-3 rounded-lg overflow-x-auto my-2 text-xs">
                              <code className={className} {...props}>{children}</code>
                            </pre>
                          );
                        },
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-brand-red pl-3 my-2 text-slate-600 italic">
                            {children}
                          </blockquote>
                        ),
                        hr: () => <hr className="my-4 border-slate-200" />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Bot size={16} className="text-slate-600" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-800">
                <Loader2 size={16} className="animate-spin" />
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
            ref={textareaRef}
            minRows={2}
            maxRows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-900 border border-slate-200 focus:outline-none focus:border-brand-red placeholder:text-slate-400 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-brand-navy text-white p-3 rounded-xl hover:bg-opacity-90 disabled:opacity-50 self-end transition-colors"
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
            className="rounded border-slate-300 text-brand-red focus:ring-brand-red"
          />
          <label htmlFor="search-toggle" className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
            <Globe size={12} />
            Search the web (enhances answers)
          </label>
        </div>

        {/* Send to Engine button */}
        {messages.length > 1 && messages[messages.length - 1].role === "assistant" && (
          <button
            onClick={() => onSendToEngine(messages[messages.length - 1].content)}
            className="mt-3 w-full bg-brand-red/10 text-brand-red py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-red/20 transition-colors flex items-center justify-center gap-2"
          >
            Send to Context Engine <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}