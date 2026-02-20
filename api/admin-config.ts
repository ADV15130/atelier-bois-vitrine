export default function handler(req: any, res: any) {
  const config = {
    backend: {
      name: 'github',
      repo: 'labbe15/atelier-bois-vitrine',
      branch: 'main',
      base_url: 'https://atelier-bois-vitrine.vercel.app',
      auth_endpoint: 'api/auth'
    },
    media_folder: 'public/images/uploads',
    public_folder: '/images/uploads',
    collections: [
      {
        name: 'realisations',
        label: 'Réalisations',
        folder: 'content/realisations',
        create: true,
        extension: 'json',
        format: 'json',
        identifier_field: 'title',
        slug: '{{slug}}',
        fields: [
          { label: 'Titre', name: 'title', widget: 'string' },
          { label: 'Catégorie', name: 'category', widget: 'select', options: ['Structure', 'Menuiserie', 'Agencement', 'Extension Bois'] },
          { label: 'Lieu', name: 'location', widget: 'string' },
          { label: 'Description', name: 'description', widget: 'text' },
          { label: 'Image principale', name: 'image', widget: 'image' },
          { label: 'Galerie d\'images', name: 'gallery', widget: 'list', required: false, field: { label: 'Image', name: 'image', widget: 'image' } }
        ]
      }
    ]
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(config);
}
