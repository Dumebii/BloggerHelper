"use client";
import { useState } from "react";
import { Provider } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleSignIn = async (provider: Provider) => {
    setLoadingProvider(provider);

    // Define the specific write permissions we need for each platform
    let scopes = undefined;
    if (provider === "x") {
      scopes = "tweet.read tweet.write users.read offline.access";
    } else if (provider === "linkedin_oidc") {
      scopes = "w_member_social openid profile email";
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
        scopes: scopes, // 👈 Ask for write permission here!
      },
    });

    if (error) {
      console.error(`Error with ${provider} login:`, error);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl border-4 border-slate-900 relative flex flex-col items-center animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-red-600 font-black text-2xl transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">
          Join Ozigi
        </h2>
        <p className="text-slate-500 text-sm font-medium mb-8 text-center px-4">
          Choose your preferred provider to start generating agentic social
          content.
        </p>
        <p className="text-slate-500 text-sm font-medium mb-8 text-center px-4">
  Choose your preferred provider to start generating agentic social content.
</p>

{/* 👇 New context message */}
<p className="text-xs text-slate-400 mb-4 text-center border-t border-slate-100 pt-4">
  Sign in to save personas, access campaign history, and publish directly to LinkedIn & Discord.
</p>

        <div className="w-full space-y-3">
          {/* GOOGLE */}
          <button
            onClick={() => handleSignIn("google")}
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-900 hover:border-slate-400 hover:bg-slate-50 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
          >
            {loadingProvider === "google" ? (
              "Connecting..."
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* LINKEDIN */}
          <button
            onClick={() => handleSignIn("linkedin_oidc")} // Supabase uses linkedin_oidc for new apps
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] border-2 border-[#0A66C2] text-white hover:bg-[#084e96] px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
          >
            {loadingProvider === "linkedin_oidc" ? (
              "Connecting..."
            ) : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Continue with LinkedIn
              </>
            )}
          </button>

          {/* X (TWITTER) */}
          <button
            onClick={() => handleSignIn("x" as Provider)}
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 bg-black border-2 border-black text-white hover:bg-slate-800 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
          >
            {loadingProvider === "twitter" ? (
              "Connecting..."
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 1200 1227">
                  <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
                </svg>
                Continue with X
              </>
            )}
          </button>

          {/* GITHUB */}
          <button
            onClick={() => handleSignIn("github")}
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 border-2 border-slate-900 text-white hover:bg-slate-700 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
          >
            {loadingProvider === "github" ? (
              "Connecting..."
            ) : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
