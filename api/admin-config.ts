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
Et change le public/admin/index.html:

<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>Admin - L'Atelier du Volcan</title>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  <script>
    fetch('/api/admin-config')
      .then(res => res.json())
      .then(config => {
        window.CMS_CONFIG = config;
      });
  </script>
</body>
</html>
Voilà! Comme ça, la config vient d'une API, pas d'un fichier statique que Vercel redirige. 👍

