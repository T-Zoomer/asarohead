// Every model on the site. The home page gallery and the viewer are both
// built from this list, so adding a model means adding an entry here, its GLB
// in public/models/ and a thumbnail in public/thumbs/ (npm run thumbs).
//
// material: 'marble' (default) or 'plaster' (fully matte).
// view: starting camera angle { az, el } in degrees, if the default doesn't suit.
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
    material: 'plaster',
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
  {
    id: 'john-baptist',
    title: 'Head of Saint John the Baptist on a Platter',
    artist: 'Unknown carver, 1430',
    kind: 'Carved head',
    blurb: 'An oak head on a platter, with deep, wavy hair and a gaunt, expressive face.',
    file: 'john-baptist.glb',
    view: { az: 30, el: 20 },
    credit:
      '<a href="https://threedscans.com/bode-museum/haupt-johannes-des-taufers-in-einer-schussel/" target="_blank" rel="noopener">Head of Saint John the Baptist on a Platter</a> ' +
      '(1430, oak), Bode Museum, Berlin. Scan: Three D Scans',
  },
  {
    id: 'neptune',
    title: 'Neptune',
    artist: 'Restored by Iustinian Funie',
    kind: 'Standing figure',
    blurb: 'A standing god with trident and drapery, digitally restored.',
    file: 'neptune.glb',
    thumbZoom: 1.4,
    credit:
      '<a href="https://threedscans.com/uncategorized/neptune-restored-by-iustinian-funie/" target="_blank" rel="noopener">Neptune</a> ' +
      '(restored by Iustinian Funie), Musée de la Romanité, Nîmes. Scan: Three D Scans',
  },
  {
    id: 'enfant',
    title: 'Enfant au Chien',
    artist: 'Roman, 1st century',
    kind: 'Standing figure',
    blurb: 'A child holding a dog: soft, rounded forms and a lively pose.',
    file: 'enfant.glb',
    credit:
      '<a href="https://threedscans.com/uncategorized/enfant-au-chien-restored/" target="_blank" rel="noopener">Enfant au Chien</a> ' +
      '(restored), 1st century, marble, Musée de la Romanité, Nîmes. Scan: Three D Scans',
  },
  {
    id: 'venus',
    title: 'Sleeping Venus',
    artist: 'Roman, 1st–2nd century AD',
    kind: 'Reclining figure',
    blurb: 'A reclining figure, for foreshortening and long, flowing forms.',
    file: 'venus.glb',
    thumbZoom: 1.25,
    view: { az: -20, el: 15 },
    credit:
      '<a href="https://threedscans.com/uncategorized/sleeping-venus/" target="_blank" rel="noopener">Sleeping Venus</a> ' +
      '(1st–2nd century AD, marble), National Museums Liverpool. Scan: Three D Scans',
  },
  {
    id: 'goat',
    title: 'Statue of Resting Goat',
    artist: '3rd century BC',
    kind: 'Animal',
    blurb: 'A resting goat with a shaggy coat and curling horns.',
    file: 'goat.glb',
    view: { az: -35, el: 12 },
    credit:
      '<a href="https://threedscans.com/fondazione-torlonia/statue-of-resting-goat/" target="_blank" rel="noopener">Statue of Resting Goat</a> ' +
      '(3rd century BC, marble), Fondazione Torlonia. Scan: Three D Scans',
  },
];

export const modelById = (id) => MODELS.find((m) => m.id === id);
