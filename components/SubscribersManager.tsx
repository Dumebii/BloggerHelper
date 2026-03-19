"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface SubscribersManagerProps {
  session: any;
}

export default function SubscribersManager({ session }: SubscribersManagerProps) {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [newEmails, setNewEmails] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/subscribers');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubscribers = async () => {
    const emailList = newEmails
      .split('\n')
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    if (emailList.length === 0) return;

    setIsAdding(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList })
      });
      if (res.ok) {
        setNewEmails('');
        await fetchSubscribers();
      } else {
        const data = await res.json();
        alert(`Failed to add: ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding subscribers", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Remove this subscriber from your list?")) return;
    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubscribers(subscribers.filter(s => s.id !== id));
      } else {
        alert("Failed to remove subscriber");
      }
    } catch (error) {
      console.error("Error deleting subscriber", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Email Subscribers</h2>
        <p className="text-slate-500 text-sm">Manage your email list. Subscribers will receive your generated newsletters.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
          Add emails (one per line)
        </label>
        <textarea
          rows={4}
          className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 text-sm font-medium text-slate-900"
          placeholder="user@example.com&#10;friend@domain.com"
          value={newEmails}
          onChange={(e) => setNewEmails(e.target.value)}
        />
        <button
          onClick={handleAddSubscribers}
          disabled={isAdding || !newEmails.trim()}
          className="mt-3 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isAdding ? "Adding..." : "Add Emails"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Your Subscribers</h3>
          <span className="text-xs text-slate-400">{subscribers.length} total</span>
        </div>
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No subscribers yet. Add some above.
          </div>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {subscribers.map((sub) => (
              <li
                key={sub.id}
                className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{sub.email}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{sub.status}</p>
                </div>
                <button
                  onClick={() => handleDeleteSubscriber(sub.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-black px-2 py-1"
                  title="Remove"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}