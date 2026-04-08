import Link from "next/link";
import Image from "next/image";

interface AuthorBioProps {
  author?: string;
  authorImage?: string;
  authorBio?: string;
  authorUrl?: string;
  authorHandle?: string;
  variant?: "inline" | "full";
}

export default function AuthorBio({
  author,
  authorImage,
  authorBio,
  authorUrl,
  authorHandle,
  variant = "inline",
}: AuthorBioProps) {
  if (!author) return null;

  // Generate initials avatar
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const AuthorContent = () => (
    <div className={`flex items-start gap-3 ${variant === "full" ? "gap-4" : ""}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {authorImage ? (
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-brand-red/20">
            <Image
              src={authorImage}
              alt={author}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-brand-red to-brand-red/60 flex items-center justify-center text-white font-black text-sm md:text-base border-2 border-brand-red/20">
            {initials}
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          {authorUrl ? (
            <a
              href={authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-900 hover:text-brand-red transition-colors"
            >
              {author}
            </a>
          ) : (
            <span className="font-bold text-slate-900">{author}</span>
          )}
          {authorHandle && (
            <span className="text-xs text-slate-500">{authorHandle}</span>
          )}
        </div>
        {authorBio && (
          <p
            className={`text-slate-600 ${
              variant === "full" ? "text-sm leading-relaxed mt-1" : "text-xs"
            }`}
          >
            {authorBio}
          </p>
        )}
      </div>
    </div>
  );

  if (variant === "inline") {
    return (
      <div className="my-4 py-4 border-y border-slate-200">
        <AuthorContent />
      </div>
    );
  }

  return (
    <div className="my-12 py-8 border-t border-slate-200">
      <h3 className="text-lg font-black uppercase tracking-tighter mb-4">About the author</h3>
      <AuthorContent />
    </div>
  );
}
