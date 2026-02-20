import { useMemo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { loadRealisations, type RealisationContent } from "@/lib/content-loader";

const FALLBACK_IMAGE = "/images/uploads/placeholder.jpg"; // Mets une image placeholder à cet endroit si tu veux

const safeString = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;

const safeArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const getProjectKey = (p: RealisationContent) => {
  // On évite les keys instables et on ne dépend pas d’un "id" qui n’existe pas forcément
  const title = safeString((p as any).title, "untitled");
  const location = safeString((p as any).location, "noloc");
  const category = safeString((p as any).category, "nocat");
  const image = safeString((p as any).image, "noimg");
  return `${category}__${title}__${location}__${image}`;
};

const Realisations = () => {
  const [selectedProject, setSelectedProject] = useState<RealisationContent | null>(null);
  const [projects, setProjects] = useState<RealisationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tous");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await loadRealisations();
        // Tri optionnel : les plus récents d’abord si tu ajoutes une date plus tard
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load realisations:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(projects.map((p) => safeString((p as any).category)).filter(Boolean))
    );
    return ["Tous", ...unique];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "Tous") return projects;
    return projects.filter((p) => safeString((p as any).category) === activeCategory);
  }, [projects, activeCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading text-primary mb-4">
            Nos Réalisations
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez quelques-uns de nos projets terminés
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            Aucune réalisation dans cette catégorie pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredProjects.map((project) => {
              const title = safeString((project as any).title, "Sans titre");
              const category = safeString((project as any).category, "Projet");
              const location = safeString((project as any).location, "");
              const description = safeString((project as any).description, "");
              const image = safeString((project as any).image, FALLBACK_IMAGE);

              return (
                <Card
                  key={getProjectKey(project)}
                  className="overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={image}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src.endsWith(FALLBACK_IMAGE)) return;
                        img.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {category}
                      </span>
                      {location && (
                        <span className="text-xs text-muted-foreground">{location}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{title}</h3>
                    {description ? (
                      <p className="text-base text-muted-foreground line-clamp-2">
                        {description}
                      </p>
                    ) : (
                      <p className="text-base text-muted-foreground italic">
                        Description à venir.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Project Detail Dialog */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading text-primary">
                {safeString((selectedProject as any)?.title, "Sans titre")}
              </DialogTitle>
            </DialogHeader>

            {selectedProject && (() => {
              const title = safeString((selectedProject as any).title, "Sans titre");
              const category = safeString((selectedProject as any).category, "Projet");
              const location = safeString((selectedProject as any).location, "");
              const description = safeString((selectedProject as any).description, "");
              const heroImage = safeString((selectedProject as any).image, FALLBACK_IMAGE);

              // gallery: list of strings OR list of objects { image: string }
              const rawGallery = safeArray<any>((selectedProject as any).gallery);
              const galleryImages = rawGallery
                .map((g) => (typeof g === "string" ? g : safeString(g?.image)))
                .filter(Boolean);

              const images = [heroImage, ...galleryImages].filter(Boolean);

              return (
                <div>
                  <img
                    src={heroImage}
                    alt={title}
                    className="w-full h-96 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src.endsWith(FALLBACK_IMAGE)) return;
                      img.src = FALLBACK_IMAGE;
                    }}
                  />

                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {category}
                    </span>
                    {location && (
                      <span className="text-sm text-muted-foreground">{location}</span>
                    )}
                  </div>

                  {description ? (
                    <p className="text-muted-foreground mb-6">{description}</p>
                  ) : (
                    <p className="text-muted-foreground italic mb-6">Description à venir.</p>
                  )}

                  {images.length > 1 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Galerie</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {images.slice(1).map((src) => (
                          <img
                            key={src}
                            src={src}
                            alt={title}
                            loading="lazy"
                            className="w-full h-32 object-cover rounded-md"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (img.src.endsWith(FALLBACK_IMAGE)) return;
                              img.src = FALLBACK_IMAGE;
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Realisations;
