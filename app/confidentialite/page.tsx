import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalTodo } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Map and Fork : quelles données sont traitées, où, et comment exercer vos droits RGPD.",
  robots: { index: true, follow: true },
};

/**
 * Politique de confidentialité (RGPD).
 *
 * IMPORTANT — ce document décrit l'ÉTAT ACTUEL du produit, qui est 100 %
 * client : aucune donnée n'est transmise à un serveur. Le passeport,
 * l'historique, le frigo et les préférences d'unités vivent uniquement
 * dans le `localStorage` du navigateur (clés `mapandfork.*`).
 *
 * La section 7 anticipe explicitement l'arrivée des comptes Supabase
 * (Phase 2 de la feuille de route) : par transparence on annonce le
 * changement de nature du traitement AVANT qu'il n'arrive. Ce document
 * devra être révisé le jour où l'authentification est activée.
 */
export default function ConfidentialitePage() {
  return (
    <LegalPage
      eyebrow="Vos données"
      title="Politique de confidentialité"
      intro="Map and Fork est conçu « privacy by design » : aujourd'hui, vos données ne quittent jamais votre appareil."
      updatedAt="2026-05-18"
    >
      <LegalSection title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données est{" "}
          <LegalTodo>nom de l'éditeur</LegalTodo>, joignable à l'adresse{" "}
          <LegalTodo>e-mail de contact</LegalTodo>. Les présentes informations
          complètent les{" "}
          <Link
            href="/mentions-legales"
            className="text-terracotta-deep underline underline-offset-2"
          >
            mentions légales
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Principe : un site sans serveur de données">
        <p>
          Map and Fork est une application web statique. Il n'existe
          aujourd'hui <strong>aucun compte utilisateur</strong>, aucune base
          de données distante, et aucune donnée personnelle n'est transmise à
          un quelconque serveur de l'éditeur.
        </p>
      </LegalSection>

      <LegalSection title="3. Données stockées localement sur votre appareil">
        <p>
          Pour mémoriser votre progression, le Site enregistre des données
          dans le <strong>stockage local de votre navigateur</strong>{" "}
          (<code>localStorage</code>). Ces données ne sont lisibles que par
          votre navigateur, sur votre appareil&nbsp;:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Passeport</strong> — pays «&nbsp;tamponnés&nbsp;» et date
            du tampon ;
          </li>
          <li>
            <strong>Historique</strong> — dernières recettes et pays consultés
            (30 entrées maximum) ;
          </li>
          <li>
            <strong>Mon frigo</strong> — ingrédients que vous sélectionnez
            pour obtenir des suggestions ;
          </li>
          <li>
            <strong>Préférences</strong> — système d'unités (métrique /
            impérial), mode d'affichage des étapes.
          </li>
        </ul>
        <p>
          Aucune de ces informations n'est un identifiant direct&nbsp;: elles
          ne permettent pas, seules, de vous identifier.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies et mesure d'audience">
        <p>
          Le Site n'utilise <strong>aucun cookie de traçage</strong>, aucun
          pixel publicitaire et aucun outil de mesure d'audience tiers
          (pas de Google Analytics, etc.). Le stockage local décrit ci-dessus
          est strictement technique et nécessaire au fonctionnement des
          fonctionnalités que vous activez vous-même.
        </p>
      </LegalSection>

      <LegalSection title="5. Hébergement et journaux techniques">
        <p>
          Le Site est hébergé par Vercel Inc. Comme tout hébergeur, Vercel
          peut traiter des journaux techniques (adresse IP, type de
          navigateur) à des fins de sécurité et de bon fonctionnement du
          réseau de diffusion. Ce traitement relève de l'intérêt légitime de
          l'hébergeur&nbsp;; consultez la politique de confidentialité de
          Vercel pour le détail.
        </p>
      </LegalSection>

      <LegalSection title="6. Durée de conservation">
        <p>
          Les données du stockage local sont conservées{" "}
          <strong>jusqu'à ce que vous les effaciez</strong> vous-même&nbsp;:
          via le bouton de réinitialisation du passeport, en vidant les
          données de site de votre navigateur, ou en utilisant la navigation
          privée (effacement à la fermeture).
        </p>
      </LegalSection>

      <LegalSection title="7. Évolution à venir : comptes et synchronisation">
        <p>
          Une future version proposera, de manière facultative, la{" "}
          <strong>création d'un compte</strong> afin de synchroniser votre
          passeport entre vos appareils, ainsi que des fonctions
          communautaires (commentaires, notes). À ce moment-là&nbsp;:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            les données seront stockées chez notre sous-traitant{" "}
            <strong>Supabase</strong>, sur une infrastructure située dans
            l'Union européenne ;
          </li>
          <li>
            la création de compte restera optionnelle&nbsp;; le mode «&nbsp;100&nbsp;%
            local&nbsp;» décrit ci-dessus restera disponible ;
          </li>
          <li>
            la présente politique sera <strong>mise à jour et
            re-présentée</strong> avant toute collecte côté serveur.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Vos droits (RGPD)">
        <p>
          Tant que les données restent locales, vous en gardez la maîtrise
          totale et pouvez les supprimer à tout moment depuis votre
          navigateur. Lorsque les comptes seront actifs, vous disposerez des
          droits d'accès, de rectification, d'effacement, de limitation, d'opposition
          et de portabilité prévus par le RGPD.
        </p>
        <p>
          Pour toute question ou pour exercer vos droits&nbsp;:{" "}
          <LegalTodo>e-mail de contact / DPO</LegalTodo>. Vous pouvez
          également introduire une réclamation auprès de la CNIL
          (www.cnil.fr).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
