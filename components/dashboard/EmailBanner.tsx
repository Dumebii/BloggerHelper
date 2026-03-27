"use client";

interface EmailBannerProps {
  needsEmail: boolean;
  onDismiss: () => void;
  onGoToSettings: () => void;
}

export default function EmailBanner({ needsEmail, onDismiss, onGoToSettings }: EmailBannerProps) {
  if (!needsEmail) return null;

  return (
    <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red p-4 rounded-xl mb-8 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center shadow-sm relative">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-brand-red/60 hover:text-brand-red sm:static sm:order-last sm:ml-auto"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <div>
        <h3 className="font-bold text-sm text-brand-red">Action Required: Secure your account</h3>

        <p className="text-xs text-brand-red/80 mt-1">
          If you signed in with X. Please add an email address in Settings for X schedule reminders. <span>              <button
        onClick={onGoToSettings}
        className="shrink-0 bg-brand-red text-white py-2 px-1  rounded-lg text-sm font-semibold hover:bg-opacity-90 transition"
      >
        Go to Settings
      </button></span>
        </p>
      </div>

    </div>
  );
}