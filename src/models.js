// Every model on the site. The home page gallery and the viewer are both
// built from this list, so adding a model means adding an entry here, its GLB
// in public/models/ and a thumbnail in public/thumbs/ (npm run thumbs).
//
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
    id: 'uffizi-torso',
    title: 'Torso',
    artist: 'Uffizi, Florence',
    kind: 'Torso',
    file: 'uffizi-torso.glb',
    credit:
      '<a href="https://www.myminifactory.com/search?query=uffizi%20torso%20scan%20the%20world" target="_blank" rel="noopener">Torso</a>, Uffizi, Florence. Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
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
    id: 'three-graces',
    title: 'The Three Graces',
    artist: 'Figure group',
    kind: 'Figure group',
    file: 'three-graces.glb',
    thumbZoom: 1.2,
    credit:
      '<a href="https://www.myminifactory.com/search?query=three%20graces%20scan%20the%20world" target="_blank" rel="noopener">The Three Graces</a>, Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'david-head',
    title: 'Head of Michelangelo’s David',
    artist: 'Michelangelo',
    kind: 'Head',
    file: 'david-head.glb',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-head-of-michelangelo-s-david-52645" target="_blank" rel="noopener">Head of Michelangelo’s David</a> (plaster cast, KAS 2232), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'laocoon',
    title: 'Laocoön and His Sons',
    artist: 'Hellenistic',
    kind: 'Figure group',
    file: 'laocoon.glb',
    thumbZoom: 1.15,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-laocoon-and-his-sons-52652" target="_blank" rel="noopener">Laocoön and His Sons</a> (plaster cast, KAS 285), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'sleeping-bacchante',
    title: 'Sleeping Bacchante',
    artist: 'Reclining figure',
    kind: 'Reclining figure',
    file: 'sleeping-bacchante.glb',
    view: { az: -20, el: 15 },
    thumbZoom: 1.2,
    credit:
      '<a href="https://www.myminifactory.com/search?query=sleeping%20bacchante" target="_blank" rel="noopener">Sleeping Bacchante</a> (marble). Scan via MyMiniFactory',
  },
  {
    id: 'einstein',
    title: 'Einstein',
    artist: 'Artur Loewenthal',
    kind: 'Portrait head',
    blurb: 'A bronze portrait head with a lined, characterful face.',
    file: 'einstein.glb',
    credit:
      '<a href="https://threedscans.com/lincoln/einstein/" target="_blank" rel="noopener">Einstein</a> by Artur Loewenthal (20th century, bronze), The Collection, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'enfant',
    title: 'Enfant au Chien',
    artist: 'Roman, 1st century',
    kind: 'Standing figure',
    blurb: 'A child holding a dog: soft, rounded forms and a lively pose.',
    file: 'enfant.glb',
    thumbZoom: 1.2,
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
  {
    id: 'triton',
    title: 'Triton',
    artist: 'Caspar Gras, 1622/30',
    kind: 'Fountain figure',
    blurb: 'A muscular sea god in a twisting, dynamic pose.',
    file: 'triton.glb',
    thumbZoom: 1.25,
    credit:
      '<a href="https://threedscans.com/ferdinandeum-innsbruck/triton/" target="_blank" rel="noopener">Triton</a> by Caspar Gras (1622/30, bronze), Ferdinandeum Innsbruck. Scan: Three D Scans',
  },
  {
    id: 'oceanus',
    title: 'Oceanus',
    artist: 'Caspar Gras, 1622/30',
    kind: 'Fountain figure',
    blurb: 'A reclining river god with an urn, full of foreshortening.',
    file: 'oceanus.glb',
    thumbZoom: 1.25,
    credit:
      '<a href="https://threedscans.com/ferdinandeum-innsbruck/oceanus/" target="_blank" rel="noopener">Oceanus</a> by Caspar Gras (1622/30, bronze), Ferdinandeum Innsbruck. Scan: Three D Scans',
  },
  {
    id: 'aphrodite',
    title: 'Aphrodite',
    artist: 'Roman copy after Praxiteles',
    kind: 'Head',
    blurb: 'A classical female head with softly modelled features.',
    file: 'aphrodite.glb',
    credit:
      '<a href="https://threedscans.com/lincoln/aphrodite/" target="_blank" rel="noopener">Aphrodite</a> (Roman copy after Praxiteles, 2nd century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'child-goose',
    title: 'Child with Goose',
    artist: 'After Boethus',
    kind: 'Figure group',
    blurb: 'A child wrestling a goose: chubby forms and a lively diagonal.',
    file: 'child-goose.glb',
    thumbZoom: 1.15,
    credit:
      '<a href="https://threedscans.com/institut-fur-klassische-archaologie/child-with-goose/" target="_blank" rel="noopener">Child with Goose</a> after Boethus (plaster copy of the marble original), Institut für Klassische Archäologie, Vienna. Scan: Three D Scans',
  },
  {
    id: 'elssler-foot',
    title: 'Right Foot of Fanny Elssler',
    artist: 'Félicie & Hippolyte de Fauveau, 1847',
    kind: 'Foot',
    blurb: 'A dancer’s foot in marble, for studying the structure of the foot.',
    file: 'elssler-foot.glb',
    credit:
      '<a href="https://threedscans.com/theater-museum/fanny-elssler/" target="_blank" rel="noopener">Right Foot of the Dancer Fanny Elssler</a> by Félicie &amp; Hippolyte de Fauveau (1847, marble), Theatermuseum, Vienna. Scan: Three D Scans',
  },
  {
    id: 'drame-au-desert',
    title: 'Drame au désert',
    artist: 'Georges Gardet, 1887',
    kind: 'Animal',
    blurb: 'A big cat in a desert struggle: tense anatomy and dramatic movement.',
    file: 'drame-au-desert.glb',
    credit:
      '<a href="https://threedscans.com/depot-des-sculptures-de-la-ville-de-paris/drameaudesert/" target="_blank" rel="noopener">Drame au désert</a> by Georges Gardet (1887, plaster), Dépôt des sculptures de la Ville de Paris. Scan: Three D Scans',
  },
  {
    id: 'hounds',
    title: 'Deux chiens de meute à l’attache',
    artist: 'Georges Lucien Vacossin, 1911',
    kind: 'Animal',
    blurb: 'Two tethered hounds, for animal anatomy and gesture.',
    file: 'hounds.glb',
    credit:
      '<a href="https://threedscans.com/depot-des-sculptures-de-la-ville-de-paris/deuxchiensdemeutealattache/" target="_blank" rel="noopener">Deux chiens de meute à l’attache</a> by Georges Lucien Vacossin (1911), Dépôt des sculptures de la Ville de Paris. Scan: Three D Scans',
  },
  {
    id: 'hermes',
    title: 'Hermes Fastening his Sandal',
    artist: 'Plaster cast',
    kind: 'Standing figure',
    blurb: 'A leaning figure tying his sandal, for weight shift and twist.',
    file: 'hermes.glb',
    thumbZoom: 1.2,
    credit:
      '<a href="https://threedscans.com/vienna/hermes-fastening-his-sandals/" target="_blank" rel="noopener">Hermes Fastening his Sandal</a> (plaster), Institut für Klassische Archäologie, Vienna. Scan: Three D Scans',
  },
  {
    id: 'horse-head',
    title: 'Horse Head',
    artist: '“Medici Riccardi” horse, 4th century BCE',
    kind: 'Animal',
    blurb: 'A monumental bronze horse head with flared nostrils and veins.',
    file: 'horse-head.glb',
    credit:
      '<a href="https://threedscans.com/museo-archeologico-nazionale/horse/" target="_blank" rel="noopener">Horse Head</a> (“Medici Riccardi” horse, second half of the 4th century BCE, bronze), Museo Archeologico Nazionale, Florence. Scan: Three D Scans',
  },
  {
    id: 'jungling',
    title: 'Jüngling vom Magdalensberg',
    artist: '16th-century bronze',
    kind: 'Standing figure',
    blurb: 'A standing youth in classical contrapposto.',
    file: 'jungling.glb',
    thumbZoom: 1.35,
    credit:
      '<a href="https://threedscans.com/kunsthistorisches-museum-wien/jungling/" target="_blank" rel="noopener">Jüngling vom Magdalensberg</a> (16th century, bronze), Kunsthistorisches Museum Wien. Scan: Three D Scans',
  },
  {
    id: 'marble-player',
    title: 'Marble Player',
    artist: 'Ella Rose Curtois',
    kind: 'Crouching figure',
    blurb: 'A crouching boy, for compact, folded poses.',
    file: 'marble-player.glb',
    credit:
      '<a href="https://threedscans.com/lincoln/marble-player/" target="_blank" rel="noopener">Marble Player</a> by Ella Rose Curtois (19th century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'mars',
    title: 'Mars',
    artist: 'John Bacon',
    kind: 'Standing figure',
    blurb: 'A standing god of war, for the heroic male figure.',
    file: 'mars.glb',
    thumbZoom: 1.3,
    credit:
      '<a href="https://threedscans.com/lincoln/mars/" target="_blank" rel="noopener">Mars</a> by John Bacon (18th century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'mercury',
    title: 'Mercury',
    artist: 'Joseph Nollekens',
    kind: 'Seated figure',
    blurb: 'A seated Mercury in winged cap, turning in space.',
    file: 'mercury.glb',
    thumbZoom: 1.15,
    credit:
      '<a href="https://threedscans.com/lincoln/mercury/" target="_blank" rel="noopener">Mercury</a> by Joseph Nollekens (18th century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'napoleon-chaudet',
    title: 'Napoleon',
    artist: 'Antoine Denis Chaudet',
    kind: 'Portrait bust',
    blurb: 'A laurel-crowned portrait bust in marble.',
    file: 'napoleon-chaudet.glb',
    credit:
      '<a href="https://threedscans.com/lincoln/napoleon/" target="_blank" rel="noopener">Napoleon</a> by Antoine Denis Chaudet (marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'salmacis',
    title: 'La Nymphe Salmacis',
    artist: 'François Joseph Bosio',
    kind: 'Seated figure',
    blurb: 'A crouching nymph, for the figure folded over itself.',
    file: 'salmacis.glb',
    credit:
      '<a href="https://threedscans.com/nouveau-musee-national-de-monaco/la-nymphe-salmacis/" target="_blank" rel="noopener">La Nymphe Salmacis</a> by François Joseph Bosio (1819–1837, marble), Nouveau Musée National de Monaco. Scan: Three D Scans',
  },
  {
    id: 'photosculpture',
    title: 'Delaunay Photosculpture',
    artist: 'François Willème, 1864',
    kind: 'Portrait bust',
    blurb: 'A 19th-century portrait bust in a buttoned coat.',
    file: 'photosculpture.glb',
    credit:
      '<a href="https://threedscans.com/musee-carnavalet/delaunay-photosculpture/" target="_blank" rel="noopener">Delaunay Photosculpture</a> by François Willème (1864, bronze), Musée Carnavalet, Paris. Scan: Three D Scans',
  },
  {
    id: 'shepherd-boy',
    title: 'Sleeping Shepherd Boy',
    artist: 'John Gibson, 1834',
    kind: 'Seated figure',
    blurb: 'A seated, sleeping boy, for relaxed weight and soft forms.',
    file: 'shepherd-boy.glb',
    thumbZoom: 1.1,
    credit:
      '<a href="https://threedscans.com/walker-art-gallery/sleeping-shepherd-boy/" target="_blank" rel="noopener">Sleeping Shepherd Boy</a> by John Gibson (1834, marble), Walker Art Gallery, Liverpool. Scan: Three D Scans',
  },
  {
    id: 'tennyson',
    title: 'Tennyson',
    artist: 'The Collection, Lincoln',
    kind: 'Portrait bust',
    blurb: 'A bearded portrait bust of the poet on a socle.',
    file: 'tennyson.glb',
    credit:
      '<a href="https://threedscans.com/lincoln/tennyson/" target="_blank" rel="noopener">Tennyson</a> (plaster), The Collection, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'hunter',
    title: 'Hunter and Dog',
    artist: 'John Gibson',
    kind: 'Figure group',
    blurb: 'A hunter restraining his dog, for action and anatomy.',
    file: 'hunter.glb',
    thumbZoom: 1.15,
    credit:
      '<a href="https://threedscans.com/lincoln/hunter-and-dog/" target="_blank" rel="noopener">Hunter and Dog</a> by John Gibson (19th century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'boy-with-thorn',
    title: 'Boy with Thorn',
    artist: 'Plaster cast',
    kind: 'Seated figure',
    blurb: 'The Spinario: a seated boy pulling a thorn from his foot.',
    file: 'boy-with-thorn.glb',
    credit:
      '<a href="https://threedscans.com/institut-fur-klassische-archaologie/boy-with-thorn/" target="_blank" rel="noopener">Boy with Thorn</a> (plaster), Institut für Klassische Archäologie, Vienna. Scan: Three D Scans',
  },
  {
    id: 'venus-cupid',
    title: 'Venus Kissing Cupid',
    artist: 'John Gibson',
    kind: 'Figure group',
    blurb: 'Two figures in an embrace, for overlapping forms.',
    file: 'venus-cupid.glb',
    thumbZoom: 1.15,
    credit:
      '<a href="https://threedscans.com/lincoln/venus-and-cupid/" target="_blank" rel="noopener">Venus Kissing Cupid</a> by John Gibson (19th century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'rhino',
    title: 'Rhinocéros',
    artist: 'Henri-Alfred Jacquemart, 1878',
    kind: 'Animal',
    blurb: 'A massive, armoured rhinoceros, for heavy forms and folds of skin.',
    file: 'rhino.glb',
    view: { az: 55, el: 12 },
    credit:
      '<a href="https://threedscans.com/depot-des-sculptures-de-la-ville-de-paris/rhino/" target="_blank" rel="noopener">Rhinocéros</a> ' +
      'by Henri-Alfred Jacquemart (1878, plaster), Dépôt des sculptures de la Ville de Paris. Scan: Three D Scans',
  },
  {
    id: 'eagle',
    title: 'Striding Eagle',
    artist: '16th century',
    kind: 'Animal',
    blurb: 'A marble eagle with half-open wings and carved feathers.',
    file: 'eagle.glb',
    credit:
      '<a href="https://threedscans.com/saint-louis-art-museum/striding-eagle/" target="_blank" rel="noopener">Striding Eagle</a> ' +
      '(16th century, marble), Saint Louis Art Museum. Scan: Three D Scans',
  },
  {
    id: 'ephebe',
    title: 'Idolino from Pesaro',
    artist: 'Efebo, c. 30 BCE',
    kind: 'Standing figure',
    blurb: 'A standing bronze youth in gentle contrapposto.',
    file: 'ephebe.glb',
    thumbZoom: 1.3,
    credit:
      '<a href="https://threedscans.com/museo-archeologico-nazionale/efebo/" target="_blank" rel="noopener">Efebo (Idolino from Pesaro)</a> ' +
      '(c. 30 BCE, bronze), Museo Archeologico Nazionale, Florence. Scan: Three D Scans',
  },
  {
    id: 'venus-italica',
    title: 'Venus Italica',
    artist: 'After Antonio Canova',
    kind: 'Bust',
    file: 'venus-italica.glb',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-venus-italica-102804" target="_blank" rel="noopener">Venus Italica</a> after Antonio Canova (plaster cast), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'genius-hand',
    title: 'Hand of the Genius of Liberty',
    artist: 'After François Rude',
    kind: 'Hand',
    file: 'genius-hand.glb',
    view: { az: 0, el: 5 },
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-hand-of-the-genius-of-liberty-la-marseillaise-143732" target="_blank" rel="noopener">Hand of the Genius of Liberty</a> from La Marseillaise, after François Rude (plaster cast). Scan: Scan the World',
  },
  {
    id: 'alexander-helios',
    title: 'Alexander as Helios',
    artist: 'Roman copy of a Hellenistic head',
    kind: 'Head',
    file: 'alexander-helios.glb',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-ideal-portrait-of-alexander-the-great-as-helios-100249" target="_blank" rel="noopener">Alexander as Helios</a> (plaster cast, KAS 283), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'athlete-python',
    title: 'Athlete Wrestling a Python',
    artist: 'Frederic Leighton, 1877',
    kind: 'Standing figure',
    file: 'athlete-python.glb',
    thumbZoom: 1.25,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-athlete-wrestling-a-python-3253" target="_blank" rel="noopener">Athlete Wrestling a Python</a> by Frederic Leighton (1877, bronze), Tate Britain, London. Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'bearded-man',
    title: 'Head of a Bearded Old Man',
    artist: 'Victoria and Albert Museum',
    kind: 'Bust',
    file: 'bearded-man.glb',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-head-of-a-bearded-old-man-24136" target="_blank" rel="noopener">Head of a Bearded Old Man</a>, Victoria and Albert Museum, London. Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'medusa',
    title: 'Bust of Medusa',
    artist: 'Gian Lorenzo Bernini',
    kind: 'Bust',
    file: 'medusa.glb',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-medusa-at-the-musei-capitolini-rome-17660" target="_blank" rel="noopener">Bust of Medusa</a> by Gian Lorenzo Bernini, Musei Capitolini, Rome. Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'diana',
    title: 'Diana',
    artist: 'After Frilli',
    kind: 'Standing figure',
    file: 'diana.glb',
    thumbZoom: 1.3,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-diana-86065" target="_blank" rel="noopener">Diana</a> after Frilli. Scan: Jadyn N. Marshall. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'marcus-aurelius',
    title: 'Marcus Aurelius',
    artist: 'Roman portrait bust',
    kind: 'Portrait bust',
    file: 'marcus-aurelius.glb',
    credit:
      '<a href="https://www.myminifactory.com/search?query=marcus%20aurelius" target="_blank" rel="noopener">Marcus Aurelius</a> (Roman portrait bust). Scan via MyMiniFactory',
  },
  {
    id: 'trotting-horse',
    title: 'Trotting Horse',
    artist: 'Nationalmuseum, Stockholm',
    kind: 'Animal',
    file: 'trotting-horse.glb',
    credit:
      '<a href="https://www.myminifactory.com/search?query=trotting%20horse%20nationalmuseum" target="_blank" rel="noopener">Trotting Horse</a>, Nationalmuseum, Stockholm. Scan via MyMiniFactory',
  },
  {
    id: 'david',
    title: 'David',
    artist: 'Michelangelo',
    kind: 'Standing figure',
    file: 'david.glb',
    thumbZoom: 1.3,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-michelangelo-s-david-in-florence-italy-2052" target="_blank" rel="noopener">David</a> by Michelangelo (1501–1504, marble), Galleria dell’Accademia, Florence. Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'discobolus',
    title: 'Townley Discobolus',
    artist: 'After Myron',
    kind: 'Standing figure',
    file: 'discobolus.glb',
    thumbZoom: 1.2,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-townley-discobolus-the-discus-thrower-25156" target="_blank" rel="noopener">Townley Discobolus</a> after Myron (plaster cast, KAS 1074), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'moses',
    title: 'Moses',
    artist: 'Michelangelo',
    kind: 'Seated figure',
    file: 'moses.glb',
    thumbZoom: 1.2,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-moses-271189" target="_blank" rel="noopener">Moses</a> by Michelangelo (plaster cast, KAS 243), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'augustus',
    title: 'Augustus of Prima Porta',
    artist: 'Roman, 1st century',
    kind: 'Standing figure',
    file: 'augustus.glb',
    thumbZoom: 1.2,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-augustus-of-prima-porta-264761" target="_blank" rel="noopener">Augustus of Prima Porta</a> (plaster cast, KAS 65), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'venus-de-milo',
    title: 'Venus de Milo',
    artist: 'Hellenistic',
    kind: 'Standing figure',
    file: 'venus-de-milo.glb',
    thumbZoom: 1.25,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-venus-aphrodite-is-the-goddess-of-love-she-was-depicted-in-the-nude-or-in-various-stages-of-nudity-and-painted-the-figure-is-executed-in-the-hellenistic-style-and-famed-for-its-sensuous-appearance-it-supposedly-lost-its-arms-in-a-struggle-arising-b-25162" target="_blank" rel="noopener">Venus de Milo</a> (plaster cast), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'farnese-head',
    title: 'Head of the Farnese Hercules',
    artist: 'After Lysippos',
    kind: 'Bust',
    file: 'farnese-head.glb',
    credit:
      '<a href="https://open.smk.dk/en/artwork/image/KAS701" target="_blank" rel="noopener">Head of the Farnese Hercules</a> (plaster cast, KAS 701), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
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
