// Every model on the site. The home page gallery, the viewer, the About
// page's credits and models/LICENSE.txt are all built from this list, so
// adding a model means adding an entry here, its GLB in public/models/<id>.glb
// and a thumbnail in public/thumbs/<id>.webp (npm run thumbs).
//
// view: starting camera angle { az, el } in degrees, if the default doesn't suit.
// thumbZoom: how much closer the thumbnail camera starts than the viewer's.
// crease: angle in degrees at which normals split into hard edges. The Asaro
// head uses it to keep its planes flat; scans leave it out and shade smoothly.

export const SITE_NAME = 'Light & Form';

export const MODELS = [
  {
    id: 'asaro',
    title: 'Asaro head',
    artist: 'After John Asaro’s Planes of the Head',
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
    thumbZoom: 1.15,
    credit:
      '<a href="https://threedscans.com/nouveau-musee-national-de-monaco/napoleon-ler/" target="_blank" rel="noopener">Napoléon Ier</a> ' +
      'by François Joseph Bosio, Nouveau Musée National de Monaco. Scan: Three D Scans',
  },
  {
    id: 'uffizi-torso',
    title: 'Torso',
    artist: 'Uffizi, Florence',
    credit:
      '<a href="https://www.myminifactory.com/search?query=uffizi%20torso%20scan%20the%20world" target="_blank" rel="noopener">Torso</a>, Uffizi, Florence. Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'john-baptist',
    title: 'Head of Saint John the Baptist on a Platter',
    artist: 'Unknown carver, 1430',
    view: { az: 30, el: 20 },
    credit:
      '<a href="https://threedscans.com/bode-museum/haupt-johannes-des-taufers-in-einer-schussel/" target="_blank" rel="noopener">Head of Saint John the Baptist on a Platter</a> ' +
      '(1430, oak), Bode Museum, Berlin. Scan: Three D Scans',
  },
  {
    id: 'salmacis',
    title: 'La Nymphe Salmacis',
    artist: 'François Joseph Bosio',
    credit:
      '<a href="https://threedscans.com/nouveau-musee-national-de-monaco/la-nymphe-salmacis/" target="_blank" rel="noopener">La Nymphe Salmacis</a> by François Joseph Bosio (1819–1837, marble), Nouveau Musée National de Monaco. Scan: Three D Scans',
  },
  {
    id: 'three-graces',
    title: 'The Three Graces',
    artist: 'Figure group',
    thumbZoom: 1.2,
    credit:
      '<a href="https://www.myminifactory.com/search?query=three%20graces%20scan%20the%20world" target="_blank" rel="noopener">The Three Graces</a>, Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'david-head',
    title: 'Head of Michelangelo’s David',
    artist: 'Michelangelo',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-head-of-michelangelo-s-david-52645" target="_blank" rel="noopener">Head of Michelangelo’s David</a> (plaster cast, KAS 2232), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'laocoon',
    title: 'Laocoön and His Sons',
    artist: 'Hellenistic',
    thumbZoom: 1.15,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-laocoon-and-his-sons-52652" target="_blank" rel="noopener">Laocoön and His Sons</a> (plaster cast, KAS 285), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'sleeping-bacchante',
    title: 'Sleeping Bacchante',
    artist: 'Reclining figure',
    view: { az: -20, el: 15 },
    thumbZoom: 1.2,
    credit:
      '<a href="https://www.myminifactory.com/search?query=sleeping%20bacchante" target="_blank" rel="noopener">Sleeping Bacchante</a> (marble). Scan via MyMiniFactory',
  },
  {
    id: 'einstein',
    title: 'Einstein',
    artist: 'Artur Loewenthal',
    credit:
      '<a href="https://threedscans.com/lincoln/einstein/" target="_blank" rel="noopener">Einstein</a> by Artur Loewenthal (20th century, bronze), The Collection, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'enfant',
    title: 'Enfant au Chien',
    artist: 'Roman, 1st century',
    thumbZoom: 1.2,
    credit:
      '<a href="https://threedscans.com/uncategorized/enfant-au-chien-restored/" target="_blank" rel="noopener">Enfant au Chien</a> ' +
      '(restored), 1st century, marble, Musée de la Romanité, Nîmes. Scan: Three D Scans',
  },
  {
    id: 'venus',
    title: 'Sleeping Venus',
    artist: 'Roman, 1st–2nd century AD',
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
    view: { az: -35, el: 12 },
    credit:
      '<a href="https://threedscans.com/fondazione-torlonia/statue-of-resting-goat/" target="_blank" rel="noopener">Statue of Resting Goat</a> ' +
      '(3rd century BC, marble), Fondazione Torlonia. Scan: Three D Scans',
  },
  {
    id: 'triton',
    title: 'Triton',
    artist: 'Caspar Gras, 1622/30',
    thumbZoom: 1.25,
    credit:
      '<a href="https://threedscans.com/ferdinandeum-innsbruck/triton/" target="_blank" rel="noopener">Triton</a> by Caspar Gras (1622/30, bronze), Ferdinandeum Innsbruck. Scan: Three D Scans',
  },
  {
    id: 'oceanus',
    title: 'Oceanus',
    artist: 'Caspar Gras, 1622/30',
    thumbZoom: 1.25,
    credit:
      '<a href="https://threedscans.com/ferdinandeum-innsbruck/oceanus/" target="_blank" rel="noopener">Oceanus</a> by Caspar Gras (1622/30, bronze), Ferdinandeum Innsbruck. Scan: Three D Scans',
  },
  {
    id: 'aphrodite',
    title: 'Aphrodite',
    artist: 'Roman copy after Praxiteles',
    credit:
      '<a href="https://threedscans.com/lincoln/aphrodite/" target="_blank" rel="noopener">Aphrodite</a> (Roman copy after Praxiteles, 2nd century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'child-goose',
    title: 'Child with Goose',
    artist: 'After Boethus',
    thumbZoom: 1.15,
    credit:
      '<a href="https://threedscans.com/institut-fur-klassische-archaologie/child-with-goose/" target="_blank" rel="noopener">Child with Goose</a> after Boethus (plaster copy of the marble original), Institut für Klassische Archäologie, Vienna. Scan: Three D Scans',
  },
  {
    id: 'drame-au-desert',
    title: 'Drame au désert',
    artist: 'Georges Gardet, 1887',
    credit:
      '<a href="https://threedscans.com/depot-des-sculptures-de-la-ville-de-paris/drameaudesert/" target="_blank" rel="noopener">Drame au désert</a> by Georges Gardet (1887, plaster), Dépôt des sculptures de la Ville de Paris. Scan: Three D Scans',
  },
  {
    id: 'hounds',
    title: 'Deux chiens de meute à l’attache',
    artist: 'Georges Lucien Vacossin, 1911',
    credit:
      '<a href="https://threedscans.com/depot-des-sculptures-de-la-ville-de-paris/deuxchiensdemeutealattache/" target="_blank" rel="noopener">Deux chiens de meute à l’attache</a> by Georges Lucien Vacossin (1911), Dépôt des sculptures de la Ville de Paris. Scan: Three D Scans',
  },
  {
    id: 'hermes',
    title: 'Hermes Fastening his Sandal',
    artist: 'Plaster cast',
    thumbZoom: 1.2,
    credit:
      '<a href="https://threedscans.com/vienna/hermes-fastening-his-sandals/" target="_blank" rel="noopener">Hermes Fastening his Sandal</a> (plaster), Institut für Klassische Archäologie, Vienna. Scan: Three D Scans',
  },
  {
    id: 'horse-head',
    title: 'Horse Head',
    artist: '“Medici Riccardi” horse, 4th century BCE',
    credit:
      '<a href="https://threedscans.com/museo-archeologico-nazionale/horse/" target="_blank" rel="noopener">Horse Head</a> (“Medici Riccardi” horse, second half of the 4th century BCE, bronze), Museo Archeologico Nazionale, Florence. Scan: Three D Scans',
  },
  {
    id: 'jungling',
    title: 'Jüngling vom Magdalensberg',
    artist: '16th-century bronze',
    thumbZoom: 1.35,
    credit:
      '<a href="https://threedscans.com/kunsthistorisches-museum-wien/jungling/" target="_blank" rel="noopener">Jüngling vom Magdalensberg</a> (16th century, bronze), Kunsthistorisches Museum Wien. Scan: Three D Scans',
  },
  {
    id: 'marble-player',
    title: 'Marble Player',
    artist: 'Ella Rose Curtois',
    credit:
      '<a href="https://threedscans.com/lincoln/marble-player/" target="_blank" rel="noopener">Marble Player</a> by Ella Rose Curtois (19th century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'mars',
    title: 'Mars',
    artist: 'John Bacon',
    thumbZoom: 1.3,
    credit:
      '<a href="https://threedscans.com/lincoln/mars/" target="_blank" rel="noopener">Mars</a> by John Bacon (18th century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'mercury',
    title: 'Mercury',
    artist: 'Joseph Nollekens',
    thumbZoom: 1.15,
    credit:
      '<a href="https://threedscans.com/lincoln/mercury/" target="_blank" rel="noopener">Mercury</a> by Joseph Nollekens (18th century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'napoleon-chaudet',
    title: 'Napoleon',
    artist: 'Antoine Denis Chaudet',
    credit:
      '<a href="https://threedscans.com/lincoln/napoleon/" target="_blank" rel="noopener">Napoleon</a> by Antoine Denis Chaudet (marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'neptune',
    title: 'Neptune',
    artist: 'Restored by Iustinian Funie',
    thumbZoom: 1.4,
    credit:
      '<a href="https://threedscans.com/uncategorized/neptune-restored-by-iustinian-funie/" target="_blank" rel="noopener">Neptune</a> ' +
      '(restored by Iustinian Funie), Musée de la Romanité, Nîmes. Scan: Three D Scans',
  },
  {
    id: 'shepherd-boy',
    title: 'Sleeping Shepherd Boy',
    artist: 'John Gibson, 1834',
    thumbZoom: 1.1,
    credit:
      '<a href="https://threedscans.com/walker-art-gallery/sleeping-shepherd-boy/" target="_blank" rel="noopener">Sleeping Shepherd Boy</a> by John Gibson (1834, marble), Walker Art Gallery, Liverpool. Scan: Three D Scans',
  },
  {
    id: 'tennyson',
    title: 'Tennyson',
    artist: 'The Collection, Lincoln',
    credit:
      '<a href="https://threedscans.com/lincoln/tennyson/" target="_blank" rel="noopener">Tennyson</a> (plaster), The Collection, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'hunter',
    title: 'Hunter and Dog',
    artist: 'John Gibson',
    thumbZoom: 1.15,
    credit:
      '<a href="https://threedscans.com/lincoln/hunter-and-dog/" target="_blank" rel="noopener">Hunter and Dog</a> by John Gibson (19th century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'boy-with-thorn',
    title: 'Boy with Thorn',
    artist: 'Plaster cast',
    credit:
      '<a href="https://threedscans.com/institut-fur-klassische-archaologie/boy-with-thorn/" target="_blank" rel="noopener">Boy with Thorn</a> (plaster), Institut für Klassische Archäologie, Vienna. Scan: Three D Scans',
  },
  {
    id: 'venus-cupid',
    title: 'Venus Kissing Cupid',
    artist: 'John Gibson',
    thumbZoom: 1.15,
    credit:
      '<a href="https://threedscans.com/lincoln/venus-and-cupid/" target="_blank" rel="noopener">Venus Kissing Cupid</a> by John Gibson (19th century, marble), The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'rhino',
    title: 'Rhinocéros',
    artist: 'Henri-Alfred Jacquemart, 1878',
    view: { az: 55, el: 12 },
    credit:
      '<a href="https://threedscans.com/depot-des-sculptures-de-la-ville-de-paris/rhino/" target="_blank" rel="noopener">Rhinocéros</a> ' +
      'by Henri-Alfred Jacquemart (1878, plaster), Dépôt des sculptures de la Ville de Paris. Scan: Three D Scans',
  },
  {
    id: 'eagle',
    title: 'Striding Eagle',
    artist: '16th century',
    credit:
      '<a href="https://threedscans.com/saint-louis-art-museum/striding-eagle/" target="_blank" rel="noopener">Striding Eagle</a> ' +
      '(16th century, marble), Saint Louis Art Museum. Scan: Three D Scans',
  },
  {
    id: 'ephebe',
    title: 'Idolino from Pesaro',
    artist: 'Efebo, c. 30 BCE',
    thumbZoom: 1.3,
    credit:
      '<a href="https://threedscans.com/museo-archeologico-nazionale/efebo/" target="_blank" rel="noopener">Efebo (Idolino from Pesaro)</a> ' +
      '(c. 30 BCE, bronze), Museo Archeologico Nazionale, Florence. Scan: Three D Scans',
  },
  {
    id: 'venus-italica',
    title: 'Venus Italica',
    artist: 'After Antonio Canova',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-venus-italica-102804" target="_blank" rel="noopener">Venus Italica</a> after Antonio Canova (plaster cast), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'genius-hand',
    title: 'Hand of the Genius of Liberty',
    artist: 'After François Rude',
    view: { az: 0, el: 5 },
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-hand-of-the-genius-of-liberty-la-marseillaise-143732" target="_blank" rel="noopener">Hand of the Genius of Liberty</a> from La Marseillaise, after François Rude (plaster cast). Scan: Scan the World',
  },
  {
    id: 'alexander-helios',
    title: 'Alexander as Helios',
    artist: 'Roman copy of a Hellenistic head',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-ideal-portrait-of-alexander-the-great-as-helios-100249" target="_blank" rel="noopener">Alexander as Helios</a> (plaster cast, KAS 283), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'athlete-python',
    title: 'Athlete Wrestling a Python',
    artist: 'Frederic Leighton, 1877',
    thumbZoom: 1.25,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-athlete-wrestling-a-python-3253" target="_blank" rel="noopener">Athlete Wrestling a Python</a> by Frederic Leighton (1877, bronze), Tate Britain, London. Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'bearded-man',
    title: 'Head of a Bearded Old Man',
    artist: 'Victoria and Albert Museum',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-head-of-a-bearded-old-man-24136" target="_blank" rel="noopener">Head of a Bearded Old Man</a>, Victoria and Albert Museum, London. Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'medusa',
    title: 'Bust of Medusa',
    artist: 'Gian Lorenzo Bernini',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-medusa-at-the-musei-capitolini-rome-17660" target="_blank" rel="noopener">Bust of Medusa</a> by Gian Lorenzo Bernini, Musei Capitolini, Rome. Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'diana',
    title: 'Diana',
    artist: 'After Frilli',
    thumbZoom: 1.3,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-diana-86065" target="_blank" rel="noopener">Diana</a> after Frilli. Scan: Jadyn N. Marshall. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'marcus-aurelius',
    title: 'Marcus Aurelius',
    artist: 'Roman portrait bust',
    credit:
      '<a href="https://www.myminifactory.com/search?query=marcus%20aurelius" target="_blank" rel="noopener">Marcus Aurelius</a> (Roman portrait bust). Scan via MyMiniFactory',
  },
  {
    id: 'trotting-horse',
    title: 'Trotting Horse',
    artist: 'Nationalmuseum, Stockholm',
    credit:
      '<a href="https://www.myminifactory.com/search?query=trotting%20horse%20nationalmuseum" target="_blank" rel="noopener">Trotting Horse</a>, Nationalmuseum, Stockholm. Scan via MyMiniFactory',
  },
  {
    id: 'david',
    title: 'David',
    artist: 'Michelangelo',
    thumbZoom: 1.3,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-michelangelo-s-david-in-florence-italy-2052" target="_blank" rel="noopener">David</a> by Michelangelo (1501–1504, marble), Galleria dell’Accademia, Florence. Scan: Scan the World. <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, converted for the web',
  },
  {
    id: 'discobolus',
    title: 'Townley Discobolus',
    artist: 'After Myron',
    thumbZoom: 1.2,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-townley-discobolus-the-discus-thrower-25156" target="_blank" rel="noopener">Townley Discobolus</a> after Myron (plaster cast, KAS 1074), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'moses',
    title: 'Moses',
    artist: 'Michelangelo',
    thumbZoom: 1.2,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-moses-271189" target="_blank" rel="noopener">Moses</a> by Michelangelo (plaster cast, KAS 243), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'augustus',
    title: 'Augustus of Prima Porta',
    artist: 'Roman, 1st century',
    thumbZoom: 1.2,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-augustus-of-prima-porta-264761" target="_blank" rel="noopener">Augustus of Prima Porta</a> (plaster cast, KAS 65), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'farnese-head',
    title: 'Head of the Farnese Hercules',
    artist: 'After Lysippos',
    credit:
      '<a href="https://open.smk.dk/en/artwork/image/KAS701" target="_blank" rel="noopener">Head of the Farnese Hercules</a> (plaster cast, KAS 701), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'girl-kittens',
    title: 'A Little Girl with Kittens',
    artist: 'Jens Adolf Jerichau',
    thumbZoom: 1.4,
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-a-little-girl-with-kittens-105328" target="_blank" rel="noopener">A Little Girl with Kittens</a> by Jens Adolf Jerichau (1856, marble, KMS 5471), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'nymph',
    title: 'Nymph Preparing for the Bath',
    artist: 'John Gibson',
    thumbZoom: 1.45,
    credit:
      '<a href="https://threedscans.com/lincoln/nymph/" target="_blank" rel="noopener">Nymph Preparing for the Bath</a> ' +
      'by John Gibson, The Usher Gallery, Lincoln. Scan: Three D Scans',
  },
  {
    id: 'pseudo-seneca',
    title: 'Pseudo-Seneca',
    artist: 'Roman, after a Hellenistic original',
    credit:
      '<a href="https://open.smk.dk/en/artwork/image/KAS94" target="_blank" rel="noopener">Pseudo-Seneca</a> (plaster cast, KAS 94), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'leeds-brotherton',
    title: 'Lord Brotherton',
    artist: 'Ivan Meštrović',
    credit:
      '<a href="https://prototype1.library.leeds.ac.uk/cr7qr8xv" target="_blank" rel="noopener">Bust of Lord Brotherton</a> by Ivan Meštrović (bronze), University of Leeds Art Collection. Scan: Scan the World',
  },
  {
    id: 'farnese-hercules',
    title: 'Farnese Hercules',
    artist: 'After Lysippos',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-farnese-hercules-70132" target="_blank" rel="noopener">Farnese Hercules</a> (small plaster cast), Anatomical Museum, University of Edinburgh. Scan: Anatomical Museum',
  },
  {
    id: 'eurydice',
    title: 'Eurydice Dying',
    artist: 'Charles-François Lebœuf',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-eurydice-dying-at-the-louvre-paris-6535" target="_blank" rel="noopener">Eurydice Dying</a> by Charles-François Lebœuf (1822, marble), Louvre, Paris. Scan: Scan the World',
  },
  {
    id: 'hermaphroditus',
    title: 'Sleeping Hermaphroditus',
    artist: 'Roman, mattress by Gian Lorenzo Bernini',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-hermaphrodite-sleeping-at-the-louvre-paris-france-7286" target="_blank" rel="noopener">Sleeping Hermaphroditus</a>, Louvre, Paris. Scan: Scan the World',
  },
  {
    id: 'slave-girl',
    title: 'The Slave Girl',
    artist: 'Jens Adolf Jerichau',
    credit:
      '<a href="https://open.smk.dk/en/artwork/image/KMS5025" target="_blank" rel="noopener">The Slave Girl</a> by Jens Adolf Jerichau (1852, marble, KMS 5025), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'venus-apple',
    title: 'Venus with the Apple',
    artist: 'Bertel Thorvaldsen',
    credit:
      '<a href="https://open.smk.dk/en/artwork/image/KMS6004" target="_blank" rel="noopener">Venus with the Apple</a> by Bertel Thorvaldsen (KMS 6004), SMK, Copenhagen. Scan: SMK. <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank" rel="noopener">Public Domain Mark</a>',
  },
  {
    id: 'the-mist',
    title: 'The Mist',
    artist: 'Gusten Lindberg',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-the-mist-98661" target="_blank" rel="noopener">The Mist</a> by Gusten Lindberg (1904, marble, NMSk 955), Nationalmuseum, Stockholm. Scan: Nationalmuseum',
  },
  {
    id: 'venus-victrix',
    title: 'Venus Victrix',
    artist: 'Antonio Canova',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-56796" target="_blank" rel="noopener">Pauline Bonaparte as Venus Victrix</a> by Antonio Canova (1805–1808). Scan: Scan the World',
  },
  {
    id: 'perseus-medusa',
    title: 'Perseus Slaying Medusa',
    artist: 'Laurent Marqueste',
    credit:
      '<a href="https://www.myminifactory.com/object/3d-print-perseus-slaying-medusa-268334" target="_blank" rel="noopener">Perseus Slaying Medusa</a> by Laurent Marqueste (marble, MIN 588), Ny Carlsberg Glyptotek, Copenhagen. Scan: Ny Carlsberg Glyptotek',
  },
];

export const modelById = (id) => MODELS.find((m) => m.id === id);
