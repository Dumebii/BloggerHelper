"use client";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { CampaignDay } from "../lib/types";
import ScheduleModal from "./ScheduleModal";

// --- Framer Motion Variants ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// 1. Expandable Text Component
function ExpandableText({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = text.length > 250;

  return (
    <div className="flex-1 flex flex-col mb-4">
      <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap flex-1 leading-relaxed">
        {isExpanded || !isLong ? text : `${text.slice(0, 250)}...`}
      </p>
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-[10px] font-black uppercase tracking-widest text-red-700 hover:text-red-900 transition-colors self-start"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
}

// 2. Universal Social Card Component
function SocialCard({
  day,
  platformName,
  initialText,
  onPost,
  postStatus,
  session,
  actionButtonConfig,
}: {
  day: number;
  platformName: string;
  initialText: string;
  session: any
  onPost?: (text: string, day: number, imageUrl?: string) => void;
  postStatus?: "idle" | "loading" | "success" | "error";
  actionButtonConfig?: {
    idle: string;
    loading: string;
    success: string;
    classes: string;
  };
}) {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [imageTitle, setImageTitle] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImg(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          platform: platformName,
          graphicTitle: imageTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      alert(`Image Error: ${err.message}`);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleDownloadImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ozigi-campaign-day-${day}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSchedule = async (scheduledFor: string) => {
    // Get the user's access token from session
    const token = session?.access_token;
    if (!token) {
      alert("You must be signed in to schedule posts.");
      return;
    }

    const response = await fetch("/api/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 👈 send token
      },
      body: JSON.stringify({
        posts: [{
          platform: platformName.toLowerCase(),
          content: text,
          imageUrl: imageUrl || undefined,
          day: day
        }],
        scheduledFor,
        campaignId: null
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to schedule");
    }
  };

  return (
    <motion.div variants={fadeUp} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col p-5 hover:border-slate-300 hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
        <span className="text-xs font-black uppercase tracking-widest text-slate-900">
          Day {day}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            onClick={handleCopy}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          {/* Schedule button added */}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Schedule
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Optional: Text overlay for graphic"
          value={imageTitle}
          onChange={(e) => setImageTitle(e.target.value)}
          className="w-full text-[10px] font-bold tracking-wide text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-slate-400 transition-colors placeholder:font-medium placeholder:text-slate-400"
        />
      </div>
      
      {imageUrl ? (
        <div className="mb-5 flex flex-col gap-2 relative z-10">
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <img
              src={imageUrl}
              alt="Generated graphic"
              className="w-full h-auto object-cover aspect-video"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImg}
                className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors shadow-lg"
              >
                {isGeneratingImg ? "Generating..." : "Regenerate"}
              </button>
            </div>
          </div>
          <button
            onClick={handleDownloadImage}
            type="button"
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            ⬇️ Download
          </button>
        </div>
      ) : (
        <button
          onClick={handleGenerateImage}
          disabled={isGeneratingImg}
          className="w-full mb-5 py-3 border border-dashed border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          {isGeneratingImg ? "🎨 Painting pixels..." : "🎨 Generate Graphic"}
        </button>
      )}

      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 min-h-[150px] resize-y focus:outline-none focus:border-red-400"
        />
      ) : (
        <ExpandableText text={text} />
      )}

      {onPost && actionButtonConfig && (
        <button
          onClick={() => onPost(text, day, imageUrl || undefined)}
          disabled={postStatus === "loading" || postStatus === "success"}
          className={`w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 mt-auto ${
            postStatus === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : actionButtonConfig.classes
          }`}
        >
          {postStatus === "loading" && actionButtonConfig.loading}
          {postStatus === "success" && actionButtonConfig.success}
          {postStatus !== "loading" &&
            postStatus !== "success" &&
            actionButtonConfig.idle}
        </button>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSchedule={handleSchedule}
          postText={text}
          platform={platformName}
          day={day}
          imageUrl={imageUrl || undefined}
        />
      )}
    </motion.div>
  );
}

// 3. Main Grid Component
export default function DistributionGrid({
  campaign,
  session,
  selectedPlatforms,
}: {
  campaign: CampaignDay[];
  session: any;
  selectedPlatforms: string[];
}) {
  const [xStatuses, setXStatuses] = useState<{ [day: number]: "idle" | "loading" | "success" | "error" }>({});
  const [discordStatuses, setDiscordStatuses] = useState<{ [day: number]: "idle" | "loading" | "success" | "error" }>({});
  const [liStatuses, setLiStatuses] = useState<{ [day: number]: "idle" | "loading" | "success" | "error" }>({});

  const handlePostToX = async (text: string, day: number) => {
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
    setXStatuses((prev) => ({ ...prev, [day]: "success" }));
    setTimeout(() => setXStatuses((prev) => ({ ...prev, [day]: "idle" })), 3000);
  };

  const handlePostToDiscord = async (text: string, day: number) => {
    const webhookUrl = session?.user?.user_metadata?.discord_webhook;
    if (!webhookUrl) {
      alert("No Discord Webhook found. Please add one in Settings ⚙️");
      return;
    }
    setDiscordStatuses((prev) => ({ ...prev, [day]: "loading" }));
    try {
      const res = await fetch("/api/post-discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, webhookUrl }),
      });
      if (!res.ok) throw new Error("Discord rejected the webhook payload.");
      setDiscordStatuses((prev) => ({ ...prev, [day]: "success" }));
      setTimeout(() => setDiscordStatuses((prev) => ({ ...prev, [day]: "idle" })), 3000);
    } catch (error: any) {
      console.error("Discord Error:", error);
      setDiscordStatuses((prev) => ({ ...prev, [day]: "error" }));
      alert(`Failed to post to Discord: ${error.message}`);
    }
  };

  const handlePostToLinkedIn = async (text: string, day: number, imageUrl?: string) => {
    if (!session?.access_token) return alert("You must be signed in to post!");
    setLiStatuses((prev) => ({ ...prev, [day]: "loading" }));
    try {
      const res = await fetch("/api/publish/linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text, userId: session.user.id, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post to LinkedIn");
      setLiStatuses((prev) => ({ ...prev, [day]: "success" }));
      setTimeout(() => setLiStatuses((prev) => ({ ...prev, [day]: "idle" })), 3000);
    } catch (error: any) {
      console.error("LinkedIn Posting Error:", error);
      setLiStatuses((prev) => ({ ...prev, [day]: "error" }));
      alert(`Failed to post: ${error.message}`);
    }
  };

  const hasX = campaign.some((d) => d.x) && selectedPlatforms.includes('x');
  const hasLinkedIn = campaign.some((d) => d.linkedin) && selectedPlatforms.includes('linkedin');
  const hasDiscord = campaign.some((d) => d.discord) && selectedPlatforms.includes('discord');

  return (
    <div className="space-y-12">
      
      {/* X ROW */}
      {hasX && (
        <section>
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} 
            className="flex items-center gap-3 mb-5"
          >
            <svg className="w-5 h-5" viewBox="0 0 1200 1227" fill="currentColor">
              <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
            </svg>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">
              X Strategy
            </h3>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {campaign.map(
              (dayData) =>
                dayData.x && (
                  <SocialCard
                    key={`x-${dayData.day}`}
                    day={dayData.day}
                    platformName="X"
                      session={session} // 👈 pass it
                    initialText={dayData.x}
                    onPost={handlePostToX}
                    postStatus={xStatuses[dayData.day]}
                    actionButtonConfig={{
                      idle: "🚀 Post to X",
                      loading: "Posting...",
                      success: "✅ Published!",
                      classes: "bg-black text-white hover:bg-slate-800 active:scale-95",
                    }}
                  />
                )
            )}
          </motion.div>
        </section>
      )}

      {/* LINKEDIN ROW */}
      {hasLinkedIn && (
        <section>
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} 
            className="flex items-center gap-3 mb-5"
          >
            <svg className="w-5 h-5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">
              LinkedIn Strategy
            </h3>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {campaign.map(
              (dayData) =>
                dayData.linkedin && (
                  <SocialCard
                    key={`li-${dayData.day}`}
                    day={dayData.day}
                    platformName="LinkedIn"
                      session={session} // 👈 pass it
                    initialText={dayData.linkedin}
                    onPost={handlePostToLinkedIn}
                    postStatus={liStatuses[dayData.day]}
                    actionButtonConfig={{
                      idle: "💼 Post to LinkedIn",
                      loading: "Posting...",
                      success: "✅ Published!",
                      classes: "bg-[#0A66C2] text-white hover:bg-[#004182] active:scale-95",
                    }}
                  />
                )
            )}
          </motion.div>
        </section>
      )}

      {/* DISCORD ROW */}
      {hasDiscord && (
        <section>
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} 
            className="flex items-center gap-3 mb-5"
          >
            <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 127.14 96.36" fill="currentColor">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.7,77.7,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">
              Discord Strategy
            </h3>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {campaign.map(
              (dayData) =>
                dayData.discord && (
                  <SocialCard
                    key={`disc-${dayData.day}`}
                    day={dayData.day}
                    platformName="Discord"
                      session={session} // 👈 pass it
                    initialText={dayData.discord}
                    onPost={handlePostToDiscord}
                    postStatus={discordStatuses[dayData.day]}
                    actionButtonConfig={{
                      idle: "👾 Send to Discord",
                      loading: "Posting...",
                      success: "✅ Sent!",
                      classes: "bg-[#5865F2] text-white hover:bg-[#4752C4] active:scale-95",
                    }}
                  />
                )
            )}
          </motion.div>
        </section>
      )}

      {/* VISUAL PLATFORMS ANNOUNCEMENT */}
      <motion.section 
        initial="hidden" animate="visible" variants={fadeUp} 
        className="mt-20 border-t border-dashed border-slate-200 pt-16"
      >
         <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-200/50 blur-3xl rounded-full pointer-events-none group-hover:bg-slate-300/50 transition-colors duration-500"></div>
            
            <div className="relative z-10 flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm mb-4">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pipeline Expansion</span>
               </div>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-3">
                  Visual Platforms Incoming.
               </h3>
               <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
                  The engine is expanding. We are currently architecting the routing logic for <span className="text-slate-900 font-bold">TikTok</span> scripts, <span className="text-slate-900 font-bold">Instagram</span> captions, and <span className="text-slate-900 font-bold">YouTube</span> descriptions. 
               </p>
            </div>
            
            <div className="relative z-10 flex gap-4 shrink-0">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm text-2xl opacity-50 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-100 group-hover:-translate-y-1">📱</div>
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm text-2xl opacity-50 grayscale transition-all delay-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:-translate-y-1">📸</div>
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm text-2xl opacity-50 grayscale transition-all delay-150 group-hover:grayscale-0 group-hover:opacity-100 group-hover:-translate-y-1">▶️</div>
            </div>
         </div>
      </motion.section>

    </div>
  );
}