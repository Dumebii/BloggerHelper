"use client";
import { useState } from "react";
import { Provider } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [authMode, setAuthMode] = useState<"oauth" | "email">("oauth");

  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  const handleSignIn = async (provider: Provider) => {
    setLoadingProvider(provider);
    let scopes = undefined;
    if (provider === "x") {
      scopes = "tweet.read tweet.write users.read offline.access";
    } else if (provider === "linkedin_oidc") {
      scopes = "w_member_social openid profile email";
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: scopes,
      },
    });

    if (error) {
      console.error(`Error with ${provider} login:`, error);
      setLoadingProvider(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    try {
      if (isSignUp) {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;
        setEmailSuccess("Check your email to confirm your account.");
        // After sign-up, we don't close the modal – they need to verify email.
        // Optionally, we could auto-login if email confirmation is disabled.
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Success: close modal and redirect (the parent will handle session change)
        onClose();
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setEmailError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl border-4 border-slate-900 relative flex flex-col items-center animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-red-600 font-black text-2xl transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">
          Sign in to Ozigi
        </h2>
        <p className="text-slate-500 text-sm font-medium mb-8 text-center px-4">
          Choose your preferred method to continue.
        </p>

        {/* Tabs */}
        <div className="flex w-full mb-6 border-b border-slate-200">
          <button
            onClick={() => setAuthMode("oauth")}
            className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider ${
              authMode === "oauth"
                ? "text-brand-red border-b-2 border-brand-red"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Social login
          </button>
          <button
            onClick={() => setAuthMode("email")}
            className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider ${
              authMode === "email"
                ? "text-brand-red border-b-2 border-brand-red"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Email / Password
          </button>
        </div>

        {/* OAuth Section */}
        {authMode === "oauth" && (
          <div className="w-full space-y-3">
            <button
              onClick={() => handleSignIn("google")}
              disabled={!!loadingProvider}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-900 hover:border-slate-400 hover:bg-slate-50 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
            >
              {loadingProvider === "google" ? "Connecting..." : "Continue with Google"}
            </button>

            <button
              onClick={() => handleSignIn("linkedin_oidc")}
              disabled={!!loadingProvider}
              className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] border-2 border-[#0A66C2] text-white hover:bg-[#084e96] px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
            >
              {loadingProvider === "linkedin_oidc" ? "Connecting..." : "Continue with LinkedIn"}
            </button>

            <button
              onClick={() => handleSignIn("x" as Provider)}
              disabled={!!loadingProvider}
              className="w-full flex items-center justify-center gap-3 bg-black border-2 border-black text-white hover:bg-slate-800 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
            >
              {loadingProvider === "twitter" ? "Connecting..." : "Continue with X"}
            </button>

            <button
              onClick={() => handleSignIn("github")}
              disabled={!!loadingProvider}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 border-2 border-slate-900 text-white hover:bg-slate-700 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
            >
              {loadingProvider === "github" ? "Connecting..." : "Continue with GitHub"}
            </button>
          </div>
        )}

        {/* Email/Password Section */}
        {authMode === "email" && (
          <form onSubmit={handleEmailAuth} className="w-full space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-brand-red/50 text-sm font-medium"
                  required={isSignUp}
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-brand-red/50 text-sm font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-brand-red/50 text-sm font-medium"
                required
              />
            </div>

            {emailError && (
              <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                {emailError}
              </div>
            )}
            {emailSuccess && (
              <div className="text-xs text-green-600 bg-green-50 p-3 rounded-lg">
                {emailSuccess}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-brand-red text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {isSignUp ? "Create account" : "Sign in"}
            </button>

            <div className="text-center text-xs text-slate-500">
              {isSignUp ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-brand-red font-bold underline"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-brand-red font-bold underline"
                  >
                    Sign up
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}