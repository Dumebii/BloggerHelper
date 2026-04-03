"use client";
import { useState, useRef, useEffect } from "react";
import { Send, X, ArrowRight, Trash2, Globe, User, Bot, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TextareaAutosize from 'react-textarea-autosize';

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Animated thinking indicator for Copilot
function CopilotThinking() {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "Thinking...",
    "Researching...",
    "Analyzing context...",
    "Crafting response...",
    "Almost there...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-2 py-1">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-brand-red/70 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-brand-red/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-xs font-medium text-slate-500 animate-pulse">
          {messages[messageIndex]}
        </span>
      </div>
    </div>
  );
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

  const [copiedMessageIdx, setCopiedMessageIdx] = useState<number | null>(null);
  const isStreamingRef = useRef(false);
  const lastScrollRef = useRef(0);

  const scrollToBottom = (force = false) => {
    const now = Date.now();
    // Throttle scrolling during streaming to prevent janky behavior
    if (!force && isStreamingRef.current && now - lastScrollRef.current < 500) return;
    lastScrollRef.current = now;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Only scroll on new user messages or when streaming completes
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "user" || (!isLoading && lastMsg?.role === "assistant")) {
      scrollToBottom(true);
    }
  }, [messages.length, isLoading]);

  const handleCopyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageIdx(idx);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedMessageIdx(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMessage = { role: "user" as const, content: userText };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    isStreamingRef.current = true;

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

      // Append an empty assistant message with a loading placeholder
      setMessages(prev => [...prev, { role: "assistant", content: "__LOADING__" }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages(prev => {
            const newMessages = [...prev];
            // Replace loading placeholder or empty content with actual content
            newMessages[newMessages.length - 1].content = accumulated;
            return newMessages;
          });
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `**Error:** ${err.message}` }]);
    } finally {
      isStreamingRef.current = false;
      setIsLoading(false);
      scrollToBottom(true);
      setTimeout(() => textareaRef.current?.focus(), 10);
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
    <div className="fixed inset-y-0 right-0 w-[560px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-brand-red p-1.5 rounded-md">
            <Sparkles size={16} className="text-white" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-100">Ozigi Copilot</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleClearConversation}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
            title="Clear conversation"
          >
            <Trash2 size={14} /> Clear
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-brand-red transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* --- MESSAGES AREA --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isLoadingMsg = !isUser && (msg.content === "" || msg.content === "__LOADING__") && isLoading;
          
          return (
            <div key={idx} className={`group ${isUser ? "flex justify-end" : ""}`}>
              {isUser ? (
                // User message - compact bubble on right
                <div className="max-w-[80%] bg-brand-red text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                // Assistant message - full width, clean layout
                <div className="space-y-3">
                  {/* Header with avatar and copy button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm">
                        <Sparkles size={14} className="text-white" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Copilot</span>
                    </div>
                    {!isLoadingMsg && msg.content && msg.content !== "__LOADING__" && (
                      <button
                        onClick={() => handleCopyMessage(msg.content, idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg"
                      >
                        {copiedMessageIdx === idx ? (
                          <><Check size={12} /> Copied</>
                        ) : (
                          <><Copy size={12} /> Copy</>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="pl-9">
                    {isLoadingMsg ? (
                      <CopilotThinking />
                    ) : (
                      <div className="prose prose-slate prose-sm max-w-none
                        prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mt-4 prose-headings:mb-2
                        prose-p:text-slate-600 prose-p:leading-relaxed prose-p:my-2
                        prose-strong:text-slate-800 prose-strong:font-semibold
                        prose-a:text-brand-red prose-a:no-underline hover:prose-a:underline
                        prose-code:text-brand-red prose-code:bg-red-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-4 prose-pre:rounded-xl prose-pre:text-xs prose-pre:my-3
                        prose-ul:my-2 prose-ul:space-y-1 prose-li:text-slate-600 prose-li:my-0
                        prose-ol:my-2 prose-ol:space-y-1
                        prose-blockquote:border-l-brand-red prose-blockquote:bg-red-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                      ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        
        {/* Send to Engine (Sticky above input if context exists) */}
        {messages.length > 1 && messages[messages.length - 1].role === "assistant" && !isLoading && (
          <div className="mb-4">
            <button
              onClick={() => onSendToEngine(messages[messages.length - 1].content)}
              className="w-full bg-red-50 border border-red-100 text-brand-red py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 hover:border-red-200 transition-all flex items-center justify-center gap-2 group shadow-sm"
            >
              Use this context <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-brand-red focus-within:ring-1 focus-within:ring-brand-red/20 transition-all">
          <TextareaAutosize
            ref={textareaRef}
            minRows={1}
            maxRows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-none outline-none leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-brand-red text-white p-2.5 rounded-xl hover:bg-red-600 disabled:opacity-40 disabled:hover:bg-brand-red transition-all flex-shrink-0 shadow-sm"
          >
            <Send size={16} className={isLoading ? "opacity-0" : "opacity-100"} />
            {isLoading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></div>}
          </button>
        </div>

        {/* Search Toggle */}
        <div className="flex items-center gap-2 mt-4 px-2">
          <label className="relative inline-flex items-center cursor-pointer group">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={searchEnabled}
              onChange={(e) => setSearchEnabled(e.target.checked)}
            />
            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-red"></div>
            <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 flex items-center gap-1.5 transition-colors">
              <Globe size={12} className={searchEnabled ? "text-brand-red" : ""} />
              Live Web Search
            </span>
          </label>
        </div>
        
      </div>
    </div>
  );
}
