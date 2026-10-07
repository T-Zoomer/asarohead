// Every model on the site. The home page gallery and the viewer are both
// built from this list, so adding a model means adding an entry here, its GLB
// in public/models/ and a thumbnail in public/thumbs/ (npm run thumbs).
//
// thumbZoom: how much closer the thumbnail camera starts than the viewer's.
// crease: angle in degrees at which normals split into hard edges. The Asaro
// head uses it to keep its planes flat; scans leave it out and shade smoothly.

export const SITE_NAME = 'Cast Room';

export const MODELS = [
  {
    id: 'asaro',
    title: 'Asaro head',
    artist: 'After John Asaro’s Planes of the Head',
    kind: 'Planes of the head',
    blurb: 'A head simplified into flat planes, for learning how light turns across a face.',
    file: 'asaro-head.glb',
    thumbZoom: 1.1,
    crease: 28,
    credit:
      '<a href="https://www.thingiverse.com/thing:7287701" target="_blank" rel="noopener">Asaro Head</a> ' +
      'by AgentSCAD, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA</a>',
  },
  {
    id: 'napoleon',
    title: 'Napoléon Ier',
    artist: 'François Joseph Bosio',
    kind: 'Portrait bust',
    blurb: 'A marble bust with a real, rounded face and deep drapery folds.',
    file: 'napoleon.glb',
    thumbZoom: 1.15,
    credit:
      '<a href="https://threedscans.com/nouveau-musee-national-de-monaco/napoleon-ler/" target="_blank" rel="noopener">Napoléon Ier</a> ' +
      'by François Joseph Bosio, Nouveau Musée National de Monaco. Scan: Three D Scans',
  },
  {
    id: 'nymph',
    title: 'Nymph Preparing for the Bath',
    artist: 'John Gibson',
    kind: 'Seated figure',
    blurb: 'A full seated figure in marble, for gesture, proportion and the figure in light.',
    file: 'nymph.glb',
    thumbZoom: 1.45,
    credit:
      '<a href="https://threedscans.com/lincoln/nymph/" target="_blank" rel="noopener">Nymph Preparing for the Bath</a> ' +
      'by John Gibson, The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
];

export const modelById = (id) => MODELS.find((m) => m.id === id);
