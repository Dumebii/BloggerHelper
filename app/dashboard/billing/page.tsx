"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useSession } from "@/components/SessionProvider";
import { format } from "date-fns";
import Link from "next/link";

interface PaymentRecord {
  id: string;
  payment_id: string;
  plan: string;
  amount: number;
  currency: string;
  billing_period: string;
  status: string;
  payment_date: string;
  next_billing_date: string | null;
}

export default function BillingPage() {
  const router = useRouter();
  const { session, sessionLoading } = useSession();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("free");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      // Fetch user's current plan
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .single();

      if (profile?.plan) {
        setCurrentPlan(profile.plan);
      }

      // Fetch payment history
      const { data: paymentData, error } = await supabase
        .from("payment_history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("payment_date", { ascending: false });

      if (error) {
        console.error("Error fetching payment history:", error);
      } else {
        setPayments(paymentData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [session, sessionLoading, router, supabase]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      succeeded: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
      refunded: "bg-slate-100 text-slate-700",
    };
    return statusStyles[status] || "bg-slate-100 text-slate-700";
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-brand-red hover:text-brand-red/80 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Billing & Invoices
          </h1>
          <p className="text-slate-600 mt-2">
            View your payment history and download receipts for your records.
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Current Plan
              </p>
              <p className="text-2xl font-black uppercase tracking-tighter text-brand-navy">
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </p>
            </div>
            {currentPlan !== "free" && (
              <Link
                href="/pricing"
                className="text-sm font-bold text-brand-red hover:text-brand-red/80"
              >
                Change Plan →
              </Link>
            )}
            {currentPlan === "free" && (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-brand-red text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-brand-red/90 transition-colors"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-black uppercase tracking-tighter">
              Payment History
            </h2>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-slate-600 mb-4">No payment history yet</p>
              <Link
                href="/pricing"
                className="text-sm font-bold text-brand-red hover:text-brand-red/80"
              >
                View pricing plans →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-slate-900">
                          {payment.plan.charAt(0).toUpperCase() +
                            payment.plan.slice(1)}{" "}
                          Plan
                        </span>
                        <span
                          className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${getStatusBadge(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                        <span className="text-xs text-slate-500 capitalize">
                          {payment.billing_period}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>
                          {format(
                            new Date(payment.payment_date),
                            "MMM dd, yyyy"
                          )}
                        </span>
                        <span className="font-mono text-xs">
                          {payment.payment_id}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      {payment.next_billing_date && (
                        <p className="text-xs text-slate-500">
                          Next:{" "}
                          {format(
                            new Date(payment.next_billing_date),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Need help with billing?{" "}
            <a
              href="mailto:support@ozigi.app"
              className="text-brand-red hover:text-brand-red/80 font-semibold"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
