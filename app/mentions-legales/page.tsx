import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalTodo } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales de Map and Fork : éditeur, hébergeur, propriété intellectuelle et crédits.",
  robots: { index: true, follow: true },
};

/**
 * Mentions légales — obligation LCEN (loi n°2004-575, art. 6 III).
 *
 * GABARIT : les éléments propres à l'éditeur (identité, contact, statut)
 * sont marqués <LegalTodo> et DOIVENT être renseignés avant la mise en
 * production publique. L'hébergeur (Vercel) est une information publique
 * et déjà renseignée car le déploiement est connu (cf. AGENTS.md).
 */
export default function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Mentions légales"
      intro="Conformément à l'article 6 III de la loi pour la confiance dans l'économie numérique (LCEN), voici les informations relatives à l'éditeur et à l'hébergeur du site."
      updatedAt="2026-05-18"
    >
      <LegalSection title="1. Éditeur du site">
        <p>
          Le site <strong>Map and Fork</strong> (ci-après «&nbsp;le
          Site&nbsp;») est édité par&nbsp;:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Nom / raison sociale&nbsp;: <LegalTodo>raison sociale ou nom de l'éditeur</LegalTodo>
          </li>
          <li>
            Statut juridique&nbsp;: <LegalTodo>particulier / auto-entrepreneur / société</LegalTodo>
          </li>
          <li>
            Adresse&nbsp;: <LegalTodo>adresse postale</LegalTodo>
          </li>
          <li>
            Adresse e-mail&nbsp;: <LegalTodo>e-mail de contact</LegalTodo>
          </li>
          <li>
            SIREN/SIRET (le cas échéant)&nbsp;: <LegalTodo>numéro</LegalTodo>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Directeur de la publication">
        <p>
          Le directeur de la publication est{" "}
          <LegalTodo>nom du directeur de la publication</LegalTodo>.
        </p>
      </LegalSection>

      <LegalSection title="3. Hébergeur">
        <p>
          Le Site est hébergé par <strong>Vercel Inc.</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
          <li>
            Site&nbsp;:{" "}
            <a
              href="https://vercel.com"
              className="text-terracotta-deep underline underline-offset-2"
              rel="noopener noreferrer"
              target="_blank"
            >
              vercel.com
            </a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Propriété intellectuelle">
        <p>
          La marque «&nbsp;Map and Fork&nbsp;», le logo, la charte graphique,
          l'architecture du Site, les textes éditoriaux (histoires culturelles,
          secrets du chef) et la mise en forme des recettes sont protégés par
          le droit de la propriété intellectuelle. Toute reproduction ou
          réutilisation, totale ou partielle, sans autorisation préalable est
          interdite.
        </p>
        <p>
          Les recettes ont été rédigées à partir d'une triangulation de
          sources culinaires de référence. Les noms de plats et appellations
          traditionnelles relèvent du domaine public culturel.
        </p>
      </LegalSection>

      <LegalSection title="5. Crédits et visuels">
        <p>
          Les photographies illustrant les recettes ont été générées par
          intelligence artificielle puis retouchées (recadrage) pour les
          besoins éditoriaux du Site. Elles ne représentent pas des
          photographies réelles des plats.
        </p>
        <p>
          Polices&nbsp;: Fraunces et Inter (Google Fonts, licence SIL Open
          Font). Données cartographiques&nbsp;: world-atlas / Natural Earth
          (domaine public).
        </p>
      </LegalSection>

      <LegalSection title="6. Données personnelles">
        <p>
          Le traitement des données personnelles est détaillé dans notre{" "}
          <Link
            href="/confidentialite"
            className="text-terracotta-deep underline underline-offset-2"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Droit applicable">
        <p>
          Les présentes mentions légales sont régies par le droit français.
          Tout litige relatif à l'utilisation du Site relève de la compétence
          des tribunaux français.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
