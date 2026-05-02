-- Migration : ajout du sample seeded "Birds"
-- Le fichier birds.wav doit être uploadé sur S3/R2 et son URL mise à jour ici.
-- La valeur de fileUrl est un placeholder à remplacer après l'upload du fichier.
-- fileKey doit être unique ; on utilise un identifiant stable préfixé "seeded/".

INSERT INTO `audioSamples` (
  `ownerUserId`,
  `sourceKind`,
  `libraryStatus`,
  `name`,
  `sortName`,
  `category`,
  `mimeType`,
  `fileKey`,
  `fileUrl`,
  `waveformPreview`,
  `dominantColor`,
  `bpm`,
  `durationMs`,
  `byteSize`,
  `isLoop`,
  `originalFileName`
) VALUES (
  NULL,
  'seeded',
  'ready',
  'Birds',
  'birds',
  'Nature',
  'audio/wav',
  'seeded/birds',
  'PLACEHOLDER_BIRDS_URL',
  '[0.18,0.22,0.35,0.48,0.62,0.55,0.44,0.38,0.52,0.66,0.58,0.42,0.30,0.24,0.40,0.54,0.68,0.60,0.46,0.32,0.26,0.20,0.34,0.28]',
  '#4ade80',
  NULL,
  12000,
  0,
  1,
  'birds.wav'
);
