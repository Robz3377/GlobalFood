"use client";

import { useState, type FormEvent } from "react";
import { Mail, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";

type Status = "idle" | "sending" | "sent" | "error" | "unavailable";

/**
 * Formulaire de connexion par lien magique (OTP e-mail, flux PKCE).
 *
 * `signInWithOtp` envoie un e-mail dont le lien revient sur
 * `/auth/callback` (cf. app/auth/callback/route.ts) qui échange le `code`
 * PKCE contre une session. Si Supabase n'est pas configuré, le composant
 * l'indique proprement au lieu de planter (contrat opt-in).
 */
export function MagicLinkForm({ next = "/passeport" }: { next?: string }) {
  const { user, loading } = useSupabaseUser();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus("unavailable");
      return;
    }
    setStatus("sending");
    setError("");
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next
    )}`;
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });
    if (otpError) {
      setStatus("error");
      setError(otpError.message);
    } else {
      setStatus("sent");
    }
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <p className="text-sm text-ink-soft" aria-live="polite">
        Vérification de la session…
      </p>
    );
  }

  if (user) {
    return (
      <div className="space-y-4">
        <p className="text-ink">
          Connecté·e en tant que{" "}
          <strong className="font-medium">{user.email}</strong>.
        </p>
        <p className="text-sm text-ink-soft">
          Ton passeport et ton historique se synchronisent automatiquement
          sur tes appareils.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-soft bg-bone-deep px-4 py-2.5 text-sm font-medium text-ink hover:bg-sage-soft transition-colors"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
          Se déconnecter
        </button>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div
        className="flex items-start gap-3 rounded-soft bg-sage-soft/40 p-4"
        aria-live="polite"
      >
        <CheckCircle2
          className="h-5 w-5 flex-none text-sage mt-0.5"
          strokeWidth={2}
          aria-hidden
        />
        <div className="text-sm">
          <p className="font-medium text-ink">Vérifie ta boîte mail</p>
          <p className="mt-1 text-ink-soft">
            Un lien de connexion a été envoyé à{" "}
            <strong className="font-medium">{email}</strong>. Il expire après
            quelques minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-ink mb-1.5"
        >
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          disabled={status === "sending"}
          className="w-full rounded-soft border border-bone-deep bg-bone px-4 py-2.5 text-ink placeholder:text-ink-soft/60 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 disabled:opacity-60"
        />
      </div>

      {status === "error" && (
        <p
          className="flex items-center gap-2 text-sm text-terracotta-deep"
          aria-live="assertive"
        >
          <AlertCircle className="h-4 w-4 flex-none" strokeWidth={2} aria-hidden />
          {error || "Une erreur est survenue. Réessaie."}
        </p>
      )}

      {status === "unavailable" && (
        <p className="text-sm text-ink-soft" aria-live="polite">
          La connexion n'est pas disponible (backend non configuré). Tes
          données restent enregistrées localement sur cet appareil.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-soft bg-terracotta px-4 py-3 font-medium text-bone hover:bg-terracotta-deep transition-colors disabled:opacity-60"
      >
        <Mail className="h-4 w-4" strokeWidth={2} aria-hidden />
        {status === "sending" ? "Envoi en cours…" : "Recevoir le lien magique"}
      </button>

      <p className="text-xs text-ink-soft">
        Aucun mot de passe. Nous t'envoyons un lien sécurisé à usage unique.
      </p>
    </form>
  );
}
