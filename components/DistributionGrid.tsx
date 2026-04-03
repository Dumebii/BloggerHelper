"use client";
import { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { toast } from "sonner";
import { CampaignDay } from "../lib/types";
import ScheduleModal from "./ScheduleModal";
import RichTextEditor from "./RichTextEditor";
import ScheduleEmailModal from "./ScheduleEmailModal";
import { uploadBase64Image } from "@/lib/utils";
import { usePlanStatus } from "@/components/hooks/usePlanStatus";
import { PLATFORMS, getApiEndpoint } from "@/lib/platforms";
import { uploadLargeAsset } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";

// Add the missing interface
interface DistributionGridProps {
  campaign?: CampaignDay[];
  session?: any;
  selectedPlatforms?: string[];
  emailContent?: string | null;
  setEmailContent?: (content: string | null) => void;
  onStatsChange?: () => void;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Expandable Text Component
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
          className="mt-2 text-[10px] font-black uppercase tracking-widest text-brand-red hover:text-brand-red/80 transition-colors self-start"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
}

// Social Card Component
function SocialCard({
  day,
  platformName,
  initialText,
  onPost,
  postStatus,
  session,
  actionButtonConfig,
  onStatsChange,
  imagesGeneratedCount,
  incrementImageCount,
  planStatus,
}: {
  day: number;
  platformName: string;
  initialText: string;
  session: any;
  onPost?: (text: string, day: number, imageUrl?: string) => void;
  postStatus?: "idle" | "loading" | "success" | "error";
  actionButtonConfig?: {
    idle: string;
    loading: string;
    success: string;
    classes: string;
  };
  onStatsChange?: () => void;
  imagesGeneratedCount: number;
  incrementImageCount: () => void;
  planStatus: any;
}) {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [imageTitle, setImageTitle] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateImage = async () => {
    if (!planStatus) return;
    if (planStatus.imageGenLimit !== -1 && imagesGeneratedCount >= planStatus.imageGenLimit) {
      toast.error(`You've reached your image limit (${planStatus.imageGenLimit} per campaign). Upgrade for more.`);
      return;
    }

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
      const publicUrl = await uploadBase64Image(data.imageUrl);
      setImageUrl(publicUrl);
      incrementImageCount();
      toast.success("Image generated!");
    } catch (err: any) {
      console.error(err);
      let errorMsg = `Image generation failed: ${err.message}`;
      if (err.message.includes("Quota exceeded")) {
        errorMsg = "Image quota exceeded. Try again later or upgrade.";
      }
      toast.error(errorMsg);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleDownloadImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;
    
    try {
      // Fetch the image as a blob to handle cross-origin
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ozigi-campaign-day-${day}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
      toast.success("Image downloaded!");
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: open in new tab
      window.open(imageUrl, "_blank");
      toast.info("Opening image in new tab");
    }
  };

const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Optional: limit file size (e.g., 5MB) and type (images only)
  if (!file.type.startsWith('image/')) {
    toast.error("Please upload an image file (JPEG, PNG, etc.)");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Image must be less than 10MB");
    return;
  }

  setIsUploadingImg(true);
  try {
    const publicUrl = await uploadLargeAsset(file);
    setImageUrl(publicUrl);
    toast.success("Image uploaded!");
  } catch (err: any) {
    console.error("Upload error:", err);
    toast.error("Failed to upload image.");
  } finally {
    setIsUploadingImg(false);
    // Reset file input so same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
};

const handleRemoveImage = () => {
  setImageUrl(null);
  toast.info("Image removed");
};

  const handleSchedule = async (scheduledFor: string, email?: string | null) => {
    const token = session?.access_token;
    if (!token) {
      toast.error("Sign in to schedule posts.");
      return;
    }

    const response = await fetch("/api/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        posts: [
          {
            platform: platformName.toLowerCase(),
            content: text,
            imageUrl: imageUrl || undefined,
            day: day,
            email: email,
          },
        ],
        scheduledFor,
        campaignId: null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to schedule");
    }

    if (onStatsChange) onStatsChange();
  };

  const imageGenButton = planStatus?.imageGenLimit !== 0 ? (
    <button
      onClick={handleGenerateImage}
      disabled={isGeneratingImg}
      className="w-full mb-5 py-3 border border-dashed border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-red hover:border-brand-red hover:bg-red-50 transition-all flex items-center justify-center gap-2"
    >
      {isGeneratingImg ? "🎨 Painting pixels..." : "🎨 Generate Graphic"}
    </button>
  ) : (
    <div className="relative group w-full mb-5">
      <button
        disabled
        className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
      >
        🔒 Upgrade to Generate
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
        Upgrade to Team for image generation
      </div>
    </div>
  );

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col p-5 hover:border-brand-red/20 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
        <span className="text-xs font-black uppercase tracking-widest text-brand-navy">Day {day}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-brand-red bg-slate-50 hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            onClick={handleCopy}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-brand-red bg-slate-50 hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-brand-red bg-slate-50 hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Schedule
          </button>
        </div>
      </div>

      {/* Image Title Input */}
      {planStatus?.imageGenLimit !== 0 && (
        <div className="mb-3">
          <input
            type="text"
            value={imageTitle}
            onChange={(e) => setImageTitle(e.target.value)}
            placeholder="Image headline (optional) - e.g., 'New Feature Launch'"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-red/50 placeholder:text-slate-400"
          />
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImg}
          className="flex-1 py-2 border border-dashed border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-red hover:border-brand-red hover:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          {isUploadingImg ? "Uploading..." : <><ImagePlus size={12} /> Upload</>}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleUploadImage}
        />
        {planStatus?.imageGenLimit !== 0 && (
          <button
            onClick={handleGenerateImage}
            disabled={isGeneratingImg}
            className="flex-1 py-2 border border-dashed border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-red hover:border-brand-red hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingImg ? "Generating..." : "Generate Graphic"}
          </button>
        )}
      </div>

{imageUrl && (
  <div className="relative mb-4 group">
    <img src={imageUrl} alt="Campaign image" className="w-full rounded-lg border border-slate-200" />
    <div className="absolute top-2 right-2 flex gap-1.5">
      <button
        onClick={handleDownloadImage}
        className="bg-white/90 rounded-full p-1.5 shadow-md hover:bg-blue-100 transition-colors"
        title="Download image"
      >
        <svg className="w-3.5 h-3.5 text-slate-600 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      <button
        onClick={handleRemoveImage}
        className="bg-white/90 rounded-full p-1.5 shadow-md hover:bg-red-100 transition-colors"
        title="Remove image"
      >
        <X size={14} className="text-slate-600 hover:text-red-600" />
      </button>
    </div>
  </div>
)}

      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 min-h-[150px] resize-y focus:outline-none focus:border-brand-red"
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
          {postStatus !== "loading" && postStatus !== "success" && actionButtonConfig.idle}
        </button>
      )}

      {isScheduleModalOpen && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSchedule={handleSchedule}
          postText={text}
          platform={platformName}
          day={day}
          imageUrl={imageUrl || undefined}
          userEmail={session?.user?.email}
        />
      )}
    </motion.div>
  );
}

// Main DistributionGrid Component
export default function DistributionGrid({
  campaign = [],
  session,
  selectedPlatforms = [],
  emailContent,
  setEmailContent,
  onStatsChange,
}: DistributionGridProps) {
  const { planStatus, loading: planLoading } = usePlanStatus();
  const [xStatuses, setXStatuses] = useState<{ [day: number]: "idle" | "loading" | "success" | "error" }>({});
  const [discordStatuses, setDiscordStatuses] = useState<{ [day: number]: "idle" | "loading" | "success" | "error" }>({});
  const [liStatuses, setLiStatuses] = useState<{ [day: number]: "idle" | "loading" | "success" | "error" }>({});
const [slackStatuses, setSlackStatuses] = useState<{ [day: number]: "idle" | "loading" | "success" | "error" }>({});
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [localEmailContent, setLocalEmailContent] = useState<string | null>(emailContent || null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [emailImageUrl, setEmailImageUrl] = useState<string | null>(null);
  const [imagesGeneratedCount, setImagesGeneratedCount] = useState(0);
  const incrementImageCount = () => setImagesGeneratedCount((prev) => prev + 1);

  useEffect(() => {
    setLocalEmailContent(emailContent || null);
  }, [emailContent]);

  const handleEmailCopy = () => {
    if (localEmailContent) {
      navigator.clipboard.writeText(localEmailContent);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const handleEmailSchedule = async (scheduledFor: string, imageUrl?: string) => {
    if (!session?.access_token) {
      toast.error("Sign in to schedule emails.");
      return;
    }
    setEmailStatus("loading");
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          posts: [
            {
              platform: PLATFORMS.EMAIL,
              content: localEmailContent,
              imageUrl: imageUrl,
              day: 0,
            },
          ],
          scheduledFor,
          campaignId: null,
        }),
      });
      if (!res.ok) throw new Error("Failed to schedule");
      setEmailStatus("success");
      setTimeout(() => setEmailStatus("idle"), 3000);
      if (onStatsChange) onStatsChange();
      toast.success("Email scheduled!");
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule email.");
      setEmailStatus("error");
    }
  };

  const handlePostToX = async (text: string, day: number) => {
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
    setXStatuses((prev) => ({ ...prev, [day]: "success" }));
    setTimeout(() => setXStatuses((prev) => ({ ...prev, [day]: "idle" })), 3000);
  };

const handlePostToDiscord = async (text: string, day: number, imageUrl?: string) => {
  const discordWebhook = session?.user?.user_metadata?.discord_webhook;
  if (!discordWebhook) {
    toast.error("Add your Discord webhook in Settings first.");
    return;
  }
  setDiscordStatuses((prev) => ({ ...prev, [day]: "loading" }));
  try {
      const res = await fetch(getApiEndpoint(PLATFORMS.DISCORD), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        webhookUrl: discordWebhook,
        imageUrl,
      }),
    });
    if (!res.ok) throw new Error("Discord rejected the webhook payload.");
    setDiscordStatuses((prev) => ({ ...prev, [day]: "success" }));
    setTimeout(() => setDiscordStatuses((prev) => ({ ...prev, [day]: "idle" })), 3000);
    toast.success("Posted to Discord!");
  } catch (error: any) {
    console.error("Discord Error:", error);
    setDiscordStatuses((prev) => ({ ...prev, [day]: "error" }));
    toast.error(`Failed to post to Discord: ${error.message}`);
  }
};

  const handlePostToLinkedIn = async (text: string, day: number, imageUrl?: string) => {
    if (!session?.access_token) {
      toast.error("Sign in to post to LinkedIn.");
      return;
    }
    setLiStatuses((prev) => ({ ...prev, [day]: "loading" }));
    try {
      const res = await fetch(getApiEndpoint(PLATFORMS.LINKEDIN), {
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
      toast.success("Posted to LinkedIn!");
    } catch (error: any) {
      console.error("LinkedIn Posting Error:", error);
      setLiStatuses((prev) => ({ ...prev, [day]: "error" }));
      toast.error(`Failed to post: ${error.message}`);
    }
  };

const handlePostToSlack = async (text: string, day: number, imageUrl?: string) => {
  const slackWebhook = session?.user?.user_metadata?.slack_webhook;
  if (!slackWebhook) {
    toast.error("Add your Slack webhook in Settings first.");
    return;
  }
  setSlackStatuses((prev) => ({ ...prev, [day]: "loading" }));
  try {
      const res = await fetch(getApiEndpoint(PLATFORMS.SLACK), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        webhookUrl: slackWebhook,
        imageUrl,
      }),
    });
    if (!res.ok) throw new Error("Slack rejected the webhook payload.");
    setSlackStatuses((prev) => ({ ...prev, [day]: "success" }));
    setTimeout(() => setSlackStatuses((prev) => ({ ...prev, [day]: "idle" })), 3000);
    toast.success("Posted to Slack!");
  } catch (error: any) {
    console.error("Slack Error:", error);
    setSlackStatuses((prev) => ({ ...prev, [day]: "error" }));
    toast.error(`Failed to post to Slack: ${error.message}`);
  }
};

  const safeCampaign = campaign ?? [];
  const safePlatforms = selectedPlatforms ?? [];

  const hasX = safeCampaign.some((d: CampaignDay) => d.x) && safePlatforms.includes(PLATFORMS.X);
  const hasLinkedIn = safeCampaign.some((d: CampaignDay) => d.linkedin) && safePlatforms.includes(PLATFORMS.LINKEDIN);
  const hasDiscord = safeCampaign.some((d: CampaignDay) => d.discord) && safePlatforms.includes(PLATFORMS.DISCORD);
  const hasEmail = !!localEmailContent && safePlatforms.includes(PLATFORMS.EMAIL);
  const hasSlack = safeCampaign.some((d: CampaignDay) => d.slack) && safePlatforms.includes(PLATFORMS.SLACK);

  return (
    <div className="space-y-12">
      {/* X ROW */}
      {hasX && (
        <section>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-3 mb-5"
          >
            <svg className="w-5 h-5 fill-current text-brand-navy" viewBox="0 0 1200 1227">
              <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
            </svg>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-navy">X Strategy</h3>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {safeCampaign.map((dayData: CampaignDay) =>
              dayData.x && (
                <SocialCard
                  key={`x-${dayData.day}`}
                  day={dayData.day}
                  platformName="X"
                  session={session}
                  initialText={dayData.x}
                  imagesGeneratedCount={imagesGeneratedCount}
                  incrementImageCount={incrementImageCount}
                  planStatus={planStatus}
                  onPost={handlePostToX}
                  postStatus={xStatuses[dayData.day]}
                  actionButtonConfig={{
                    idle: "🚀 Post to X",
                    loading: "Posting...",
                    success: "✅ Published!",
                    classes: "bg-black text-white hover:bg-slate-800 active:scale-95",
                  }}
                  onStatsChange={onStatsChange}
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
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-3 mb-5"
          >
            <svg className="w-5 h-5 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-navy">LinkedIn Strategy</h3>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {safeCampaign.map((dayData: CampaignDay) =>
              dayData.linkedin && (
                <SocialCard
                  key={`li-${dayData.day}`}
                  day={dayData.day}
                  platformName="LinkedIn"
                  session={session}
                  initialText={dayData.linkedin}
                  imagesGeneratedCount={imagesGeneratedCount}
                  incrementImageCount={incrementImageCount}
                  planStatus={planStatus}
                  onPost={handlePostToLinkedIn}
                  postStatus={liStatuses[dayData.day]}
                  actionButtonConfig={{
                    idle: "💼 Post to LinkedIn",
                    loading: "Posting...",
                    success: "✅ Published!",
                    classes: "bg-[#0A66C2] text-white hover:bg-[#004182] active:scale-95",
                  }}
                  onStatsChange={onStatsChange}
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
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-3 mb-5"
          >
            <svg className="w-5 h-5 fill-current text-[#5865F2]" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.7,77.7,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-navy">Discord Strategy</h3>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {safeCampaign.map((dayData: CampaignDay) =>
              dayData.discord && (
                <SocialCard
                  key={`disc-${dayData.day}`}
                  day={dayData.day}
                  platformName="Discord"
                  session={session}
                  initialText={dayData.discord}
                  imagesGeneratedCount={imagesGeneratedCount}
                  incrementImageCount={incrementImageCount}
                  planStatus={planStatus}
                  onPost={handlePostToDiscord}
                  postStatus={discordStatuses[dayData.day]}
                  actionButtonConfig={{
                    idle: "👾 Send to Discord",
                    loading: "Posting...",
                    success: "✅ Sent!",
                    classes: "bg-[#5865F2] text-white hover:bg-[#4752C4] active:scale-95",
                  }}
                  onStatsChange={onStatsChange}
                />
              )
            )}
          </motion.div>
        </section>
      )}

      {/* SLACK ROW */}
{hasSlack && (
  <section>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="flex items-center gap-3 mb-5"
    >
      <svg className="w-5 h-5 fill-current text-[#4A154B]" viewBox="0 0 24 24">
        <path d="M5.5 12.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm4-4a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5zm4-4a2 2 0 1 1 0 4h-2V6.5a2 2 0 0 1 2-2zm-4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
      </svg>
      <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-navy">Slack Strategy</h3>
    </motion.div>
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {safeCampaign.map((dayData: CampaignDay) =>
        dayData.slack && (
          <SocialCard
            key={`slack-${dayData.day}`}
            day={dayData.day}
            platformName="Slack"
            session={session}
            initialText={dayData.slack}
            imagesGeneratedCount={imagesGeneratedCount}
            incrementImageCount={incrementImageCount}
            planStatus={planStatus}
            onPost={handlePostToSlack}
            postStatus={slackStatuses[dayData.day]}
            actionButtonConfig={{
              idle: "💬 Send to Slack",
              loading: "Posting...",
              success: "✅ Sent!",
              classes: "bg-[#4A154B] text-white hover:bg-[#36123b] active:scale-95",
            }}
            onStatsChange={onStatsChange}
          />
        )
      )}
    </motion.div>
  </section>
)}

      {/* EMAIL NEWSLETTER SECTION */}
      {hasEmail && (
        <section className="mt-12 pt-8 border-t-2 border-slate-100">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-3 mb-5"
          >
            <svg className="w-5 h-5 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-navy">Email Newsletter</h3>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-widest text-brand-navy">Campaign Summary</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-brand-red bg-slate-50 hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {isEditingEmail ? "Save" : "Edit"}
                  </button>
                  <button
                    onClick={handleEmailCopy}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-brand-red bg-slate-50 hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {emailCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {isEditingEmail ? (
                <RichTextEditor
                  content={localEmailContent || ""}
                  onChange={(html) => {
                    setLocalEmailContent(html);
                    if (setEmailContent) setEmailContent(html);
                  }}
                  placeholder="Write your newsletter content..."
                />
              ) : (
                <div
                  className="mb-4 prose prose-sm max-w-none text-sm font-medium text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: localEmailContent || "" }}
                />
              )}

              {planStatus?.emailSendsLimit !== 0 ? (
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  disabled={emailStatus === "loading"}
                  className="w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all bg-brand-red text-white hover:bg-opacity-90 active:scale-95 flex items-center justify-center gap-2"
                >
                  {emailStatus === "loading" ? "Scheduling..." : "📧 Schedule Newsletter"}
                </button>
              ) : (
                <div className="relative group">
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-slate-200 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    🔒 Upgrade to Send
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    Upgrade to Team to send newsletters
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </section>
      )}
      {isScheduleModalOpen && (
        <ScheduleEmailModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSchedule={(isoString) => {
            handleEmailSchedule(isoString, emailImageUrl || undefined);
          }}
        />
      )}
    </div>
  );
}
