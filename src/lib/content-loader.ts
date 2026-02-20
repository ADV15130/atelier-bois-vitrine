/**
 * Content Loader - Charge le contenu depuis les fichiers JSON du CMS
 * Permet au client de modifier le contenu via l'interface admin
 */

export interface ServiceContent {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
}

export interface TestimonialContent {
  name: string;
  rating: number;
  text: string;
  project_type?: string;
}

export interface RealisationContent {
  title: string;
  category: string;
  location: string;
  description: string;
  image: string;
  // Decap peut renvoyer soit string[], soit { image: string }[]
  gallery?: Array<string | { image: string }>;
}

export interface HomeContent {
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  quote: {
    text: string;
    description: string;
  };
  highlights: Array<{
    title: string;
    description: string;
  }>;
  services: Array<{
    title: string;
    description: string;
    image: string;
    link: string;
  }>;
}

/**
 * Charge le contenu de la page d'accueil
 */
export async function loadHomeContent(): Promise<HomeContent> {
  const response = await fetch("/content/home.json");
  if (!response.ok) throw new Error("Failed to load home content");
  return await response.json();
}

/**
 * Charge le contenu d'un service spécifique
 * @param category - structure, menuiserie, agencement, extension
 * @param service - nom du service (ex: charpente, escaliers, etc.)
 */
export async function loadServiceContent(
  category: string,
  service: string
): Promise<ServiceContent> {
  const response = await fetch(`/content/services/${category}/${service}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load service content: ${category}/${service}`);
  }
  return await response.json();
}

/**
 * Charge tous les témoignages
 * NOTE: garde la logique actuelle (liste connue). On pourra l’améliorer plus tard si besoin.
 */
export async function loadTestimonials(): Promise<TestimonialContent[]> {
  try {
    const testimonialFiles = ["hugo-m", "claire-d", "nina-s"];
    const testimonials = await Promise.all(
      testimonialFiles.map(async (file) => {
        try {
          const response = await fetch(`/content/testimonials/${file}.json`);
          if (!response.ok) return null;
          return (await response.json()) as TestimonialContent;
        } catch {
          return null;
        }
      })
    );
    return testimonials.filter((t): t is TestimonialContent => t !== null);
  } catch (error) {
    console.error("Error loading testimonials:", error);
    return [];
  }
}

/**
 * Charge toutes les réalisations depuis le CMS
 *
 * IMPORTANT:
 * On n'utilise PAS index.json (trop fragile avec Decap CMS).
 * On liste automatiquement tous les fichiers JSON du dossier via import.meta.glob.
 *
 * Cela fonctionne avec Vite (et donc la plupart des setups React modernes).
 */
const realisationsModules = import.meta.glob<
  { default: RealisationContent }
>("../../content/realisations/*.json", { eager: true });

const normalizeGallery = (
  gallery: RealisationContent["gallery"]
): string[] => {
  if (!Array.isArray(gallery)) return [];
  return gallery
    .map((g) => (typeof g === "string" ? g : g?.image))
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0);
};

export async function loadRealisations(): Promise<RealisationContent[]> {
  try {
    const items: RealisationContent[] = Object.values(realisationsModules)
      .map((mod) => (mod as any).default ?? mod)
      // on ignore un éventuel index.json restant dans le dossier
      .filter((r: any) => r && typeof r === "object" && typeof r.title === "string")
      .map((r) => ({
        ...r,
        gallery: normalizeGallery(r.gallery),
      }));

    // Tri simple: par catégorie puis titre (optionnel)
    items.sort((a, b) => {
      const cat = (a.category || "").localeCompare(b.category || "");
      if (cat !== 0) return cat;
      return (a.title || "").localeCompare(b.title || "");
    });

    return items;
  } catch (error) {
    console.error("Error loading realisations:", error);
    return [];
  }
}
