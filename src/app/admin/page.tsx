"use client";

import { useState, useEffect, useCallback } from "react";

type Invite = {
  id: string;
  label: string;
  accessCount: number;
  revoked: boolean;
  createdAt: string;
  lastAccessAt: string | null;
  expiresAt: string | null;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = loading
  const [password, setPassword] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [label, setLabel] = useState("");
  const [ttlDays, setTtlDays] = useState("");
  const [created, setCreated] = useState<{ code: string; link: string; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/invites");
      if (res.ok) {
        const d = await res.json();
        setInvites(d.invites || []);
        setAuthed(true);
      } else {
        // 401 (not logged in) or any other status -> show the login form.
        setAuthed(false);
      }
    } catch {
      setAuthed(false); // network error -> show login, never hang on "Loading…"
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      setPassword("");
      load();
    } else {
      setError("Wrong password.");
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    setCreated(null);
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, ttlDays: ttlDays ? Number(ttlDays) : null }),
    });
    setBusy(false);
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.ok) {
      const link = `${window.location.origin}/?c=${String(d.code).replace(/-/g, "")}`;
      setCreated({ code: d.code, link, label: d.label });
      setLabel("");
      setTtlDays("");
      load();
    } else {
      setError(d.error || "Could not create code.");
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this code? The person loses access on their next visit.")) return;
    await fetch(`/api/admin/invites?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  }

  if (authed === null) {
    return (
      <Shell>
        <p className="text-white/50">Loading…</p>
      </Shell>
    );
  }

  if (!authed) {
    return (
      <Shell>
        <h1 className="font-serif text-3xl text-gold">Admin</h1>
        <p className="mt-2 text-sm text-white/60">Enter the admin password to manage invite codes.</p>
        <form onSubmit={login} className="mt-6 flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            placeholder="Password"
            className="flex-1 rounded-md border border-gold/30 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-gold focus:outline-none"
          />
          <button
            disabled={busy}
            className="gradient-gold rounded-md px-5 py-3 text-sm font-semibold uppercase tracking-wider text-wine-950 disabled:opacity-60"
          >
            {busy ? "…" : "Enter"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </Shell>
    );
  }

  return (
    <Shell wide>
      <h1 className="font-serif text-3xl text-gold">Invite codes</h1>
      <p className="mt-2 text-sm text-white/60">
        Create a unique access code for each doctor, then send them the code or the one-click link.
      </p>

      <form onSubmit={create} className="mt-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="block text-xs uppercase tracking-wider text-white/50">Doctor / name</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Dr. Jane Smith"
            className="mt-1 w-full rounded-md border border-gold/30 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-gold focus:outline-none"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs uppercase tracking-wider text-white/50">Expires (days)</label>
          <input
            value={ttlDays}
            onChange={(e) => setTtlDays(e.target.value)}
            placeholder="never"
            inputMode="numeric"
            className="mt-1 w-full rounded-md border border-gold/30 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-gold focus:outline-none"
          />
        </div>
        <button
          disabled={busy}
          className="gradient-gold rounded-md px-6 py-3 text-sm font-semibold uppercase tracking-wider text-wine-950 disabled:opacity-60"
        >
          {busy ? "…" : "Generate"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      {created && (
        <div className="mt-5 rounded-lg border border-gold/40 bg-gold/10 p-4">
          <p className="text-sm text-white/70">
            New code for <strong className="text-white">{created.label}</strong> — copy it now (it can&apos;t be shown again):
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <CopyRow label="Code" value={created.code} />
            <CopyRow label="One-click link" value={created.link} />
          </div>
        </div>
      )}

      <h2 className="mt-10 text-xs uppercase tracking-wider text-white/50">Issued ({invites.length})</h2>
      <div className="mt-2 divide-y divide-white/10">
        {invites.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className={`text-white ${inv.revoked ? "line-through opacity-50" : ""}`}>{inv.label}</p>
              <p className="text-xs text-white/40">
                used {inv.accessCount}×{inv.revoked ? " · revoked" : ""}
                {inv.expiresAt ? " · expires " + new Date(inv.expiresAt).toLocaleDateString() : ""}
              </p>
            </div>
            {!inv.revoked && (
              <button
                onClick={() => revoke(inv.id)}
                className="rounded border border-red-400/40 px-3 py-1 text-xs text-red-300 hover:bg-red-400/10"
              >
                Revoke
              </button>
            )}
          </div>
        ))}
        {invites.length === 0 && <p className="py-3 text-sm text-white/40">No codes yet.</p>}
      </div>
    </Shell>
  );
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main className="min-h-[100dvh] bg-[#1c0b17] px-6 py-16">
      <div className={`mx-auto ${wide ? "max-w-2xl" : "max-w-md"}`}>{children}</div>
    </main>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-xs uppercase tracking-wider text-white/40">{label}</span>
      <code className="flex-1 truncate rounded bg-black/30 px-3 py-2 text-sm text-gold">{value}</code>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="shrink-0 rounded border border-gold/30 px-3 py-2 text-xs text-white/70 hover:bg-white/5"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
