"use client";
import { useState, useRef, useEffect } from "react";
import { Send, X, ArrowRight, Trash2, Globe, User, Bot, Sparkles } from "lucide-react";
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

    const userText = input.trim();
    const userMessage = { role: "user" as const, content: userText };
    
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

      // Append an empty assistant message to act as the streaming target
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = accumulated;
            return newMessages;
          });
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `**Error:** ${err.message}` }]);
    } finally {
      setIsLoading(false);
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
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
      
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
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50 scroll-smooth">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[90%] ${isUser ? "flex-row-reverse" : ""}`}>
                
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                  isUser 
                    ? "bg-brand-red text-white" 
                    : "bg-white border border-slate-200 text-slate-700"
                }`}>
                  {isUser ? <User size={14} strokeWidth={2.5} /> : <Bot size={16} />}
                </div>

                {/* Bubble */}
                <div className={`rounded-2xl px-5 py-4 text-sm shadow-sm border ${
                  isUser
                    ? "bg-brand-red border-brand-red text-white rounded-tr-sm"
                    : "bg-white border-slate-200 text-slate-800 rounded-tl-sm"
                }`}>
                  {!isUser && msg.content === "" && isLoading ? (
                    <div className="flex items-center gap-1 h-5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  ) : isUser ? (
                    <div className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</div>
                  ) : (
                    <div className="prose prose-sm max-w-none 
                      prose-headings:font-bold prose-headings:text-slate-900 
                      prose-p:text-slate-700 prose-p:leading-relaxed 
                      prose-strong:text-slate-900 
                      prose-a:text-brand-red prose-a:no-underline hover:prose-a:underline
                      prose-code:text-brand-red prose-code:bg-red-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:p-4 prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-800
                      prose-li:text-slate-700
                    ">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-2" />
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