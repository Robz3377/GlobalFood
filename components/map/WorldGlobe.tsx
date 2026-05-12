"use client";

import Globe from "react-globe.gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { feature } from "topojson-client";
import * as THREE from "three";
import { COUNTRY_COORDS } from "@/lib/coords";
import type { Country } from "@/lib/types";

type GeoFeature = {
  type: "Feature";
  id?: string | number;
  properties?: { name?: string };
  geometry: unknown;
};

type GlobeRef = {
  controls: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableZoom: boolean;
    minDistance?: number;
    maxDistance?: number;
  };
  pointOfView: (
    coords: { lat?: number; lng?: number; altitude?: number },
    transitionMs?: number
  ) => void;
};

type Ring = { lat: number; lng: number };

type CountryLabel = {
  slug: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
};

type Props = {
  countries: Country[];
  focusSlug?: string | null;
  onFocusComplete?: (slug: string) => void;
};

/**
 * Seuils d'altitude pour le fade des labels :
 * - >= LABEL_HIDE_ALT : 0 (invisible)
 * - <= LABEL_FULL_ALT : 1 (opaque)
 * - entre : interpolation linéaire
 */
const LABEL_HIDE_ALT = 2.0;
const LABEL_FULL_ALT = 1.2;

function labelOpacity(altitude: number): number {
  if (altitude >= LABEL_HIDE_ALT) return 0;
  if (altitude <= LABEL_FULL_ALT) return 1;
  return (LABEL_HIDE_ALT - altitude) / (LABEL_HIDE_ALT - LABEL_FULL_ALT);
}

// Solid pastel ocean material — vector / minimal look (no satellite texture)
const OCEAN_MATERIAL = new THREE.MeshPhongMaterial({
  color: new THREE.Color("#EFF1EC"),
  emissive: new THREE.Color("#FAF7F2"),
  emissiveIntensity: 0.18,
  shininess: 6,
  transparent: false,
});

export function WorldGlobe({ countries, focusSlug, onFocusComplete }: Props) {
  const router = useRouter();
  const globeRef = useRef<GlobeRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const idleTimer = useRef<number | null>(null);

  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [size, setSize] = useState({ w: 800, h: 520 });
  const [hovered, setHovered] = useState<Country | null>(null);
  const [ready, setReady] = useState(false);
  /** Altitude caméra courante — utilisée pour faire apparaître les labels au zoom */
  const [altitude, setAltitude] = useState(2.2);

  const byIso = useMemo(() => {
    const m = new Map<string, Country>();
    for (const c of countries) m.set(c.isoNumeric, c);
    return m;
  }, [countries]);

  const rings = useMemo<Ring[]>(
    () =>
      countries
        .map((c) => COUNTRY_COORDS[c.slug])
        .filter(Boolean) as Ring[],
    [countries]
  );

  /**
   * Labels dynamiques : un label par pays disponible, positionné à son
   * centroïde. Le texte combine drapeau + nom pour une lecture immédiate.
   * Liste filtrée selon altitude pour éviter le coût de rendu inutile au global.
   */
  const labels = useMemo<CountryLabel[]>(() => {
    if (altitude >= LABEL_HIDE_ALT) return [];
    return countries
      .map((c) => {
        const coords = COUNTRY_COORDS[c.slug];
        if (!coords) return null;
        return {
          slug: c.slug,
          name: c.name,
          flag: c.flag,
          lat: coords.lat,
          lng: coords.lng,
        };
      })
      .filter((x): x is CountryLabel => x !== null);
  }, [countries, altitude]);

  function getCountryFor(d: GeoFeature | null | undefined): Country | undefined {
    if (!d || d.id === undefined || d.id === null) return undefined;
    const id = String(d.id).padStart(3, "0");
    return byIso.get(id);
  }

  // Load topojson once
  useEffect(() => {
    let cancelled = false;
    fetch("/countries-110m.json")
      .then((r) => r.json())
      .then((topo: unknown) => {
        if (cancelled) return;
        const t = topo as { objects: { countries: unknown } };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fc = (feature as any)(t, t.objects.countries) as { features: GeoFeature[] };
        setFeatures(fc.features);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = Math.min(Math.max(w * 0.7, 360), 560);
      setSize({ w, h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Globe controls config + auto-rotate
  useEffect(() => {
    if (!ready) return;
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    // Zoom activé : le user peut s'approcher et voir apparaître les labels pays.
    // Limites strictes pour ne pas perdre le contexte global ni rentrer dans la sphère.
    controls.enableZoom = true;
    if ("minDistance" in controls) controls.minDistance = 180;
    if ("maxDistance" in controls) controls.maxDistance = 360;
    g.pointOfView({ lat: 25, lng: 10, altitude: 2.2 }, 0);
  }, [ready]);

  // Focus animation: rotate to country, then notify caller (which navigates)
  useEffect(() => {
    if (!ready || !focusSlug) return;
    const coords = COUNTRY_COORDS[focusSlug];
    if (!coords) return;
    const g = globeRef.current;
    if (!g) return;
    g.controls().autoRotate = false;
    g.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.65 }, 1500);
    const t = window.setTimeout(() => onFocusComplete?.(focusSlug), 1600);
    return () => window.clearTimeout(t);
  }, [ready, focusSlug, onFocusComplete]);

  // Pause auto-rotate on user interaction; resume after 2s idle
  function bumpIdle() {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = false;
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      const c = globeRef.current?.controls();
      if (c && !focusSlug) c.autoRotate = true;
    }, 2000);
  }

  return (
    <div className="relative">
      {/* Soft ground shadow (pseudo-element via div) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[-12px] w-[60%] h-6 rounded-[50%] blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(46,42,38,0.22) 0%, rgba(46,42,38,0) 70%)",
        }}
      />
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-soft-lg bg-bone touch-none"
        style={{ height: size.h }}
        onPointerDown={bumpIdle}
        onPointerMove={(e) => {
          if (e.buttons) bumpIdle();
        }}
        onWheel={bumpIdle}
      >
        <Globe
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={globeRef as any}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={true}
          atmosphereColor="#A3B18A"
          atmosphereAltitude={0.22}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          globeMaterial={OCEAN_MATERIAL as any}
          polygonsData={features}
          polygonAltitude={(d: object) =>
            getCountryFor(d as GeoFeature) ? 0.018 : 0.008
          }
          polygonCapColor={(d: object) => {
            const c = getCountryFor(d as GeoFeature);
            if (!c) return "#E5E2D9"; // light gray, vector style
            if (c.slug === focusSlug) return "#C65D3A";
            return c.slug === hovered?.slug ? "#C65D3A" : "#A3B18A";
          }}
          polygonSideColor={(d: object) =>
            getCountryFor(d as GeoFeature)
              ? "rgba(58, 82, 57, 0.55)"
              : "rgba(180, 175, 165, 0.5)"
          }
          polygonStrokeColor={(d: object) =>
            getCountryFor(d as GeoFeature)
              ? "rgba(46,42,38,0.45)"
              : "rgba(180, 175, 165, 0.7)"
          }
          polygonLabel={(d: object) => {
            const c = getCountryFor(d as GeoFeature);
            if (!c) return "";
            const recipes = `${c.recipes.length} recette${
              c.recipes.length > 1 ? "s" : ""
            }`;
            return `
              <div style="
                background:#2E2A26;
                color:#FAF7F2;
                padding:8px 12px;
                border-radius:12px;
                font-family:system-ui,-apple-system,sans-serif;
                font-size:13px;
                line-height:1.3;
                box-shadow:0 12px 40px -10px rgba(0,0,0,0.4);
                pointer-events:none;
                white-space:nowrap;
              ">
                <div style="font-weight:600;font-size:14px">
                  <span style="margin-right:6px">${c.flag}</span>${c.name}
                </div>
                <div style="opacity:0.65;font-size:11px;margin-top:2px">${recipes}</div>
              </div>`;
          }}
          onPolygonHover={(d: object | null) =>
            setHovered(getCountryFor(d as GeoFeature) ?? null)
          }
          onPolygonClick={(d: object) => {
            const c = getCountryFor(d as GeoFeature);
            if (c) router.push(`/pays/${c.slug}`);
          }}
          ringsData={rings}
          ringColor={() => (t: number) => `rgba(195, 93, 58, ${0.55 * (1 - t)})`}
          ringMaxRadius={2.6}
          ringPropagationSpeed={1.6}
          ringRepeatPeriod={1700}
          ringAltitude={0.018}
          // === LABELS DYNAMIQUES — apparaissent au zoom ===
          labelsData={labels}
          labelLat={(d: object) => (d as CountryLabel).lat}
          labelLng={(d: object) => (d as CountryLabel).lng}
          labelText={(d: object) =>
            `${(d as CountryLabel).flag} ${(d as CountryLabel).name}`
          }
          labelColor={() => {
            const a = labelOpacity(altitude);
            // Ink (#2E2A26) avec alpha dynamique
            return `rgba(46, 42, 38, ${a.toFixed(2)})`;
          }}
          labelSize={0.6}
          labelDotRadius={0.18}
          labelAltitude={0.02}
          labelResolution={2}
          labelsTransitionDuration={300}
          onLabelClick={(d: object) => {
            router.push(`/pays/${(d as CountryLabel).slug}`);
          }}
          // === TRACKING ALTITUDE pour fade des labels ===
          onZoom={(pov: { altitude: number }) => setAltitude(pov.altitude)}
          onGlobeReady={() => setReady(true)}
        />

        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 shadow-soft">
            <span className="h-2 w-2 rounded-full bg-sage" />
            Disponible
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 shadow-soft">
            <span className="h-2 w-2 rounded-full bg-[#E5E2D9] border border-ink-soft/20" />
            À venir
          </span>
          <span className="ml-auto text-ink-soft/70 hidden sm:inline">
            Glissez pour faire tourner
          </span>
        </div>
      </div>
    </div>
  );
}
