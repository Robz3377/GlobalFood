import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware racine — délègue au rafraîchissement de session Supabase.
 *
 * Le matcher exclut les assets statiques et les fichiers servis par Next
 * (images, manifest, favicon) : inutile d'y faire tourner l'auth, et ça
 * évite une latence sur chaque image de recette.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|manifest.webmanifest).*)",
  ],
};
