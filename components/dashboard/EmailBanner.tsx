"use client";

interface EmailBannerProps {
  needsEmail: boolean;
  onDismiss: () => void;
  onGoToSettings: () => void;
}

export default function EmailBanner({ needsEmail, onDismiss, onGoToSettings }: EmailBannerProps) {
  if (!needsEmail) return null;

  return (
    <div className="bg-orange-100 border border-orange-300 text-orange-800 p-4 rounded-xl mb-8 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center shadow-sm relative">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-orange-600 hover:text-orange-800 sm:static sm:order-last sm:ml-auto"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <div>
        <h3 className="font-bold text-sm">Action Required: Secure your account</h3>
        <p className="text-xs mt-1">
          You signed in with X. Please add an email address in Settings for account recovery and newsletter features.
        </p>
      </div>
      <button
        onClick={onGoToSettings}
        className="shrink-0 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition"
      >
        Go to Settings
      </button>
    </div>
  );
}