export type Locale = "fr" | "en" | "es" | "ar" | "ja";
export type Direction = "ltr" | "rtl";

export type TranslationKey =
  | "language"
  | "languageAria"
  | "sampleBank"
  | "viewLibrary"
  | "soundLibrary"
  | "librarySummary"
  | "storageDistribution"
  | "seededContent"
  | "userSpace"
  | "searchSample"
  | "importSound"
  | "importing"
  | "sortAZ"
  | "alphabeticalLibrary"
  | "audioPackPending"
  | "readyToPlay"
  | "noSampleAvailable"
  | "noSampleHint"
  | "webLoopStation"
  | "heroTitle"
  | "activeTracks"
  | "globalIndicativeBpm"
  | "audioEngine"
  | "audioEngineArmed"
  | "audioEngineStandby"
  | "importedCategory"
  | "trackStage"
  | "sampleReady"
  | "sampleSourcePending"
  | "emptySlot"
  | "chooseTrackColor"
  | "loop"
  | "oneShot"
  | "stop"
  | "play"
  | "toggleLoop"
  | "trackVolume"
  | "decreaseTrackBpm"
  | "increaseTrackBpm"
  | "openEffects"
  | "removeTrackSample"
  | "trackFocus"
  | "trackLabel"
  | "effectsChainReady"
  | "effectsChainEmpty"
  | "effectsModalTitle"
  | "effectsModalDescription"
  | "effectsAmount"
  | "dry"
  | "wet"
  | "loginToImport"
  | "importSuccess"
  | "importFailed"
  | "unsupportedFormat"
  | "fileTooLarge"
  | "importPreparationFailed"
  | "sampleLoadedOnTrack"
  | "trackCleared"
  | "loadSampleFirst"
  | "missingAudioSource"
  | "audioEngineStartFailed"
  | "filter"
  | "filterDescription"
  | "reverb"
  | "reverbDescription"
  | "delay"
  | "delayDescription"
  | "feedback"
  | "feedbackDescription"
  | "drive"
  | "driveDescription"
  | "chorus"
  | "chorusDescription"
  | "comp"
  | "compDescription";

type TranslationValue = string | ((params: Record<string, string | number>) => string);

type TranslationCatalog = Record<TranslationKey, TranslationValue>;

export const localeMeta: Record<Locale, { label: string; nativeLabel: string; dir: Direction }> = {
  fr: { label: "French", nativeLabel: "Français", dir: "ltr" },
  en: { label: "English", nativeLabel: "English", dir: "ltr" },
  es: { label: "Spanish", nativeLabel: "Español", dir: "ltr" },
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  ja: { label: "Japanese", nativeLabel: "日本語", dir: "ltr" },
};

export const defaultLocale: Locale = "fr";
export const supportedLocales = Object.keys(localeMeta) as Locale[];

const interpolate = (template: string, params: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));

const translations: Record<Locale, TranslationCatalog> = {
  fr: {
    language: "Langue",
    languageAria: "Changer la langue de l’interface",
    sampleBank: "Sample bank",
    viewLibrary: "Voir la bibliothèque",
    soundLibrary: "Bibliothèque sonore",
    librarySummary: "les sons sont classés par ordre alphabétique",
    storageDistribution: "Répartition du stockage sonore",
    seededContent: "Libre de droits intégré",
    userSpace: "Espace pour ajouts",
    searchSample: "chercher un sample",
    importSound: "Importer un son",
    importing: "Import...",
    sortAZ: "A–Z",
    alphabeticalLibrary: "Bibliothèque alphabétique des samples",
    audioPackPending: "pack audio à raccorder",
    readyToPlay: "prêt à jouer",
    noSampleAvailable: "Aucun sample disponible",
    noSampleHint: "Soit tous les sons sont déjà placés sur des pistes, soit la recherche est trop restrictive.",
    webLoopStation: "Samploop",
    heroTitle: "9 pistes, bibliothèque éphémère, ajoutez vos sons et créez vos ambiances.",
    activeTracks: "Pistes actives",
    globalIndicativeBpm: "BPM global indicatif",
    audioEngine: "Moteur audio",
    audioEngineArmed: "ACTIF",
    audioEngineStandby: "VEILLE",
    importedCategory: "Importé",
    trackStage: "Zone principale des pistes",
    sampleReady: "Sample prêt à jouer",
    sampleSourcePending: "Sample assigné — source audio à finaliser",
    emptySlot: "Emplacement vide",
    chooseTrackColor: ({ trackId }) => `Choisir la couleur de la piste ${trackId}`,
    loop: "Loop",
    oneShot: "One shot",
    stop: "Stop",
    play: "Play",
    toggleLoop: "Activer ou désactiver la boucle",
    trackVolume: ({ trackId }) => `Volume de la piste ${trackId}`,
    decreaseTrackBpm: ({ trackId }) => `Réduire le BPM de la piste ${trackId}`,
    increaseTrackBpm: ({ trackId }) => `Augmenter le BPM de la piste ${trackId}`,
    openEffects: "Ouvrir les effets",
    removeTrackSample: "Supprimer le sample de la piste",
    trackFocus: "Track focus",
    trackLabel: ({ trackId }) => `Piste ${trackId}`,
    effectsChainReady: "Chaîne studio active : dynamique, espace et modulation disponibles piste par piste.",
    effectsChainEmpty: "Sélectionnez une piste puis chargez un sample pour ouvrir sa chaîne d’effets.",
    effectsModalTitle: ({ trackId }) => `Effets studio — piste ${trackId}`,
    effectsModalDescription: "Ajustez la couleur sonore, la profondeur et la dynamique de chaque container sans quitter la console principale.",
    effectsAmount: ({ effect }) => `${effect} amount`,
    dry: "Dry",
    wet: "Wet",
    loginToImport: "Connectez-vous pour importer vos propres samples.",
    importSuccess: "Le sample a été importé dans la bibliothèque.",
    importFailed: "L’import du sample a échoué.",
    unsupportedFormat: "Format non pris en charge. Utilisez wav, mp3, ogg ou webm.",
    fileTooLarge: "Le fichier dépasse la limite actuelle de 24 Mo.",
    importPreparationFailed: "Impossible de préparer le fichier audio pour l’import.",
    sampleLoadedOnTrack: ({ sampleName, trackId }) => `“${sampleName}” chargé sur la piste ${trackId}.`,
    trackCleared: ({ trackId }) => `La piste ${trackId} a été vidée et le sample redevient disponible.`,
    loadSampleFirst: "Chargez d’abord un sample dans cette piste.",
    missingAudioSource: "Ce sample n’a pas encore de fichier audio attaché. Nous brancherons la bibliothèque intégrée ensuite.",
    audioEngineStartFailed: "Le moteur audio n’a pas pu être démarré sur ce navigateur.",
    filter: "Filter",
    filterDescription: "Passe-bas animé pour arrondir ou assombrir la boucle.",
    reverb: "Reverb",
    reverbDescription: "Espace, queue et densité de la salle.",
    delay: "Delay",
    delayDescription: "Répétitions synchronisées pour élargir la boucle.",
    feedback: "Feedback",
    feedbackDescription: "Durée de vie des répétitions du delay.",
    drive: "Drive",
    driveDescription: "Saturation plus ou moins rugueuse du signal.",
    chorus: "Chorus",
    chorusDescription: "Largeur, mouvement et sensation stéréo.",
    comp: "Comp",
    compDescription: "Cohésion et contrôle de dynamique type bus.",
  },
  en: {
    language: "Language",
    languageAria: "Change the interface language",
    sampleBank: "Sample bank",
    viewLibrary: "View library",
    soundLibrary: "Sound library",
    librarySummary: "sounds are listed in alphabetical order",
    storageDistribution: "Sound storage distribution",
    seededContent: "Built-in royalty-free",
    userSpace: "Space for additions",
    searchSample: "look for a sample",
    importSound: "Import a sound",
    importing: "Importing...",
    sortAZ: "A–Z",
    alphabeticalLibrary: "Alphabetical sample library",
    audioPackPending: "audio pack pending",
    readyToPlay: "ready to play",
    noSampleAvailable: "No sample available",
    noSampleHint: "Either all sounds are already placed on tracks, or the search is too restrictive.",
    webLoopStation: "Samploop",
    heroTitle: "9 tracks, ephemeral library, add your sounds and create your moods.",
    activeTracks: "Active tracks",
    globalIndicativeBpm: "Indicative global BPM",
    audioEngine: "Audio engine",
    audioEngineArmed: "ARMED",
    audioEngineStandby: "STBY",
    importedCategory: "Imported",
    trackStage: "Main track area",
    sampleReady: "Sample ready to play",
    sampleSourcePending: "Sample assigned — audio source still to finalize",
    emptySlot: "Empty slot",
    chooseTrackColor: ({ trackId }) => `Choose track ${trackId} color`,
    loop: "Loop",
    oneShot: "One shot",
    stop: "Stop",
    play: "Play",
    toggleLoop: "Enable or disable looping",
    trackVolume: ({ trackId }) => `Track ${trackId} volume`,
    decreaseTrackBpm: ({ trackId }) => `Decrease track ${trackId} BPM`,
    increaseTrackBpm: ({ trackId }) => `Increase track ${trackId} BPM`,
    openEffects: "Open effects",
    removeTrackSample: "Remove track sample",
    trackFocus: "Track focus",
    trackLabel: ({ trackId }) => `Track ${trackId}`,
    effectsChainReady: "Studio chain active: dynamics, space, and modulation are available for each track.",
    effectsChainEmpty: "Select a track, then load a sample to open its effects chain.",
    effectsModalTitle: ({ trackId }) => `Studio effects — track ${trackId}`,
    effectsModalDescription: "Adjust tone, depth, and dynamics for each container without leaving the main console.",
    effectsAmount: ({ effect }) => `${effect} amount`,
    dry: "Dry",
    wet: "Wet",
    loginToImport: "Log in to import your own samples.",
    importSuccess: "The sample was imported into the library.",
    importFailed: "Sample import failed.",
    unsupportedFormat: "Unsupported format. Use wav, mp3, ogg, or webm.",
    fileTooLarge: "The file exceeds the current 24 MB limit.",
    importPreparationFailed: "Unable to prepare the audio file for import.",
    sampleLoadedOnTrack: ({ sampleName, trackId }) => `“${sampleName}” loaded on track ${trackId}.`,
    trackCleared: ({ trackId }) => `Track ${trackId} was cleared and the sample is available again.`,
    loadSampleFirst: "Load a sample into this track first.",
    missingAudioSource: "This sample does not have an attached audio file yet. We will connect the built-in library next.",
    audioEngineStartFailed: "The audio engine could not be started in this browser.",
    filter: "Filter",
    filterDescription: "Animated low-pass tone shaping to round off or darken the loop.",
    reverb: "Reverb",
    reverbDescription: "Space, tail, and room density.",
    delay: "Delay",
    delayDescription: "Synced repeats to widen the loop.",
    feedback: "Feedback",
    feedbackDescription: "How long the delay repeats survive.",
    drive: "Drive",
    driveDescription: "Gentle to rough signal saturation.",
    chorus: "Chorus",
    chorusDescription: "Width, movement, and stereo feel.",
    comp: "Comp",
    compDescription: "Bus-style glue and dynamic control.",
  },
  es: {
    language: "Idioma",
    languageAria: "Cambiar el idioma de la interfaz",
    sampleBank: "Banco de samples",
    viewLibrary: "Ver la biblioteca",
    soundLibrary: "Biblioteca sonora",
    librarySummary: "los sonidos están ordenados alfabéticamente",
    storageDistribution: "Distribución del almacenamiento sonoro",
    seededContent: "Contenido integrado libre",
    userSpace: "Espacio para añadidos",
    searchSample: "buscar un sample",
    importSound: "Importar un sonido",
    importing: "Importando...",
    sortAZ: "A–Z",
    alphabeticalLibrary: "Biblioteca alfabética de samples",
    audioPackPending: "paquete de audio por conectar",
    readyToPlay: "listo para reproducir",
    noSampleAvailable: "No hay samples disponibles",
    noSampleHint: "O bien todos los sonidos ya están colocados en pistas, o la búsqueda es demasiado restrictiva.",
    webLoopStation: "Samploop",
    heroTitle: "9 pistas, biblioteca efímera, añade tus sonidos y crea tus ambientes.",
    activeTracks: "Pistas activas",
    globalIndicativeBpm: "BPM global orientativo",
    audioEngine: "Motor de audio",
    audioEngineArmed: "ACTIVO",
    audioEngineStandby: "ESPERA",
    importedCategory: "Importado",
    trackStage: "Zona principal de pistas",
    sampleReady: "Sample listo para reproducir",
    sampleSourcePending: "Sample asignado — la fuente de audio aún debe completarse",
    emptySlot: "Ranura vacía",
    chooseTrackColor: ({ trackId }) => `Elegir el color de la pista ${trackId}`,
    loop: "Loop",
    oneShot: "One shot",
    stop: "Stop",
    play: "Play",
    toggleLoop: "Activar o desactivar el loop",
    trackVolume: ({ trackId }) => `Volumen de la pista ${trackId}`,
    decreaseTrackBpm: ({ trackId }) => `Reducir el BPM de la pista ${trackId}`,
    increaseTrackBpm: ({ trackId }) => `Aumentar el BPM de la pista ${trackId}`,
    openEffects: "Abrir efectos",
    removeTrackSample: "Eliminar el sample de la pista",
    trackFocus: "Enfoque de pista",
    trackLabel: ({ trackId }) => `Pista ${trackId}`,
    effectsChainReady: "Cadena de estudio activa: dinámica, espacio y modulación disponibles para cada pista.",
    effectsChainEmpty: "Selecciona una pista y carga un sample para abrir su cadena de efectos.",
    effectsModalTitle: ({ trackId }) => `Efectos de estudio — pista ${trackId}`,
    effectsModalDescription: "Ajusta el color sonoro, la profundidad y la dinámica de cada contenedor sin salir de la consola principal.",
    effectsAmount: ({ effect }) => `cantidad de ${effect}`,
    dry: "Seco",
    wet: "Húmedo",
    loginToImport: "Inicia sesión para importar tus propios samples.",
    importSuccess: "El sample se ha importado a la biblioteca.",
    importFailed: "La importación del sample ha fallado.",
    unsupportedFormat: "Formato no compatible. Usa wav, mp3, ogg o webm.",
    fileTooLarge: "El archivo supera el límite actual de 24 MB.",
    importPreparationFailed: "No se pudo preparar el archivo de audio para la importación.",
    sampleLoadedOnTrack: ({ sampleName, trackId }) => `“${sampleName}” cargado en la pista ${trackId}.`,
    trackCleared: ({ trackId }) => `La pista ${trackId} se ha vaciado y el sample vuelve a estar disponible.`,
    loadSampleFirst: "Primero carga un sample en esta pista.",
    missingAudioSource: "Este sample aún no tiene un archivo de audio adjunto. Conectaremos la biblioteca integrada después.",
    audioEngineStartFailed: "No se pudo iniciar el motor de audio en este navegador.",
    filter: "Filter",
    filterDescription: "Filtro paso bajo animado para redondear u oscurecer el loop.",
    reverb: "Reverb",
    reverbDescription: "Espacio, cola y densidad de la sala.",
    delay: "Delay",
    delayDescription: "Repeticiones sincronizadas para ensanchar el loop.",
    feedback: "Feedback",
    feedbackDescription: "Duración de las repeticiones del delay.",
    drive: "Drive",
    driveDescription: "Saturación de la señal, de suave a áspera.",
    chorus: "Chorus",
    chorusDescription: "Anchura, movimiento y sensación estéreo.",
    comp: "Comp",
    compDescription: "Pegada de bus y control de dinámica.",
  },
  ar: {
    language: "اللغة",
    languageAria: "تغيير لغة الواجهة",
    sampleBank: "بنك العينات",
    viewLibrary: "عرض المكتبة",
    soundLibrary: "المكتبة الصوتية",
    librarySummary: "الأصوات مرتبة أبجدياً",
    storageDistribution: "توزيع مساحة التخزين الصوتي",
    seededContent: "محتوى مدمج حر الاستخدام",
    userSpace: "مساحة للإضافات",
    searchSample: "ابحث عن عينة",
    importSound: "استيراد صوت",
    importing: "جارٍ الاستيراد...",
    sortAZ: "A–Z",
    alphabeticalLibrary: "مكتبة العينات الأبجدية",
    audioPackPending: "حزمة الصوت بانتظار الربط",
    readyToPlay: "جاهز للتشغيل",
    noSampleAvailable: "لا توجد عينة متاحة",
    noSampleHint: "إما أن جميع الأصوات موضوعة بالفعل على المسارات، أو أن البحث مقيّد أكثر من اللازم.",
    webLoopStation: "محطة لوب على الويب",
    heroTitle: "٩ مسارات،المكتبة المؤقتة، أضف أصواتك وأنشئ أجواءك.",
    activeTracks: "المسارات النشطة",
    globalIndicativeBpm: "السرعة الإيقاعية العامة التقريبية",
    audioEngine: "محرك الصوت",
    audioEngineArmed: "نشط",
    audioEngineStandby: "استعداد",
    importedCategory: "مستورَد",
    trackStage: "منطقة المسارات الرئيسية",
    sampleReady: "العينة جاهزة للتشغيل",
    sampleSourcePending: "تم إسناد العينة — ما زال مصدر الصوت بحاجة إلى الإكمال",
    emptySlot: "خانة فارغة",
    chooseTrackColor: ({ trackId }) => `اختر لون المسار ${trackId}`,
    loop: "حلقة",
    oneShot: "مرة واحدة",
    stop: "إيقاف",
    play: "تشغيل",
    toggleLoop: "تفعيل أو إيقاف الحلقة",
    trackVolume: ({ trackId }) => `مستوى صوت المسار ${trackId}`,
    decreaseTrackBpm: ({ trackId }) => `خفض BPM للمسار ${trackId}`,
    increaseTrackBpm: ({ trackId }) => `رفع BPM للمسار ${trackId}`,
    openEffects: "فتح المؤثرات",
    removeTrackSample: "حذف عينة المسار",
    trackFocus: "تركيز المسار",
    trackLabel: ({ trackId }) => `المسار ${trackId}`,
    effectsChainReady: "سلسلة الاستوديو نشطة: الديناميكيات، والحيز، والمودوليشن متاحة لكل مسار.",
    effectsChainEmpty: "اختر مساراً ثم حمّل عينة لفتح سلسلة المؤثرات الخاصة به.",
    effectsModalTitle: ({ trackId }) => `مؤثرات الاستوديو — المسار ${trackId}`,
    effectsModalDescription: "اضبط اللون الصوتي والعمق والديناميكية لكل حاوية من دون مغادرة وحدة التحكم الرئيسية.",
    effectsAmount: ({ effect }) => `مقدار ${effect}`,
    dry: "جاف",
    wet: "مبلل",
    loginToImport: "سجّل الدخول لاستيراد عيناتك الخاصة.",
    importSuccess: "تم استيراد العينة إلى المكتبة.",
    importFailed: "فشل استيراد العينة.",
    unsupportedFormat: "تنسيق غير مدعوم. استخدم wav أو mp3 أو ogg أو webm.",
    fileTooLarge: "الملف يتجاوز الحد الحالي البالغ 24 ميغابايت.",
    importPreparationFailed: "تعذّر تجهيز ملف الصوت للاستيراد.",
    sampleLoadedOnTrack: ({ sampleName, trackId }) => `تم تحميل “${sampleName}” على المسار ${trackId}.`,
    trackCleared: ({ trackId }) => `تم تفريغ المسار ${trackId} وأصبحت العينة متاحة من جديد.`,
    loadSampleFirst: "حمّل عينة في هذا المسار أولاً.",
    missingAudioSource: "لا تحتوي هذه العينة بعد على ملف صوتي مرفق. سنربط المكتبة المدمجة لاحقاً.",
    audioEngineStartFailed: "تعذّر تشغيل محرك الصوت في هذا المتصفح.",
    filter: "فلتر",
    filterDescription: "فلتر منخفض متحرك لتدوير الحلقة أو تغميقها.",
    reverb: "ريفيرب",
    reverbDescription: "المساحة والذيل وكثافة الغرفة.",
    delay: "ديلاي",
    delayDescription: "تكرارات متزامنة لتوسيع الحلقة.",
    feedback: "فيدباك",
    feedbackDescription: "مدة بقاء تكرارات الديلاي.",
    drive: "درايف",
    driveDescription: "تشبع الإشارة من ناعم إلى خشن.",
    chorus: "كورس",
    chorusDescription: "العرض والحركة والإحساس الستيريو.",
    comp: "كمب",
    compDescription: "تماسك على نمط الحافلة وتحكم في الديناميكية.",
  },
  ja: {
    language: "言語",
    languageAria: "インターフェースの言語を変更する",
    sampleBank: "サンプルバンク",
    viewLibrary: "ライブラリを表示",
    soundLibrary: "サウンドライブラリ",
    librarySummary: "サウンドはアルファベット順に表示されます",
    storageDistribution: "サウンド保存領域の配分",
    seededContent: "内蔵のロイヤリティフリー素材",
    userSpace: "追加用スペース",
    searchSample: "サンプルを検索",
    importSound: "サウンドをインポート",
    importing: "インポート中...",
    sortAZ: "A–Z",
    alphabeticalLibrary: "サンプルのアルファベット順ライブラリ",
    audioPackPending: "接続待ちのオーディオパック",
    readyToPlay: "再生準備完了",
    noSampleAvailable: "利用可能なサンプルがありません",
    noSampleHint: "すべての音がすでにトラックに配置されているか、検索条件が厳しすぎます。",
    webLoopStation: "Webループステーション",
    heroTitle: "9トラック、仮設図書館,サウンドを追加してムードを作ろう。",
    activeTracks: "アクティブなトラック",
    globalIndicativeBpm: "全体の目安BPM",
    audioEngine: "オーディオエンジン",
    audioEngineArmed: "作動中",
    audioEngineStandby: "待機",
    importedCategory: "インポート済み",
    trackStage: "メイントラックエリア",
    sampleReady: "サンプルは再生可能です",
    sampleSourcePending: "サンプル割り当て済み — 音源の仕上げが必要です",
    emptySlot: "空きスロット",
    chooseTrackColor: ({ trackId }) => `トラック ${trackId} の色を選択`,
    loop: "ループ",
    oneShot: "ワンショット",
    stop: "停止",
    play: "再生",
    toggleLoop: "ループを有効または無効にする",
    trackVolume: ({ trackId }) => `トラック ${trackId} の音量`,
    decreaseTrackBpm: ({ trackId }) => `トラック ${trackId} の BPM を下げる`,
    increaseTrackBpm: ({ trackId }) => `トラック ${trackId} の BPM を上げる`,
    openEffects: "エフェクトを開く",
    removeTrackSample: "トラックのサンプルを削除",
    trackFocus: "トラックフォーカス",
    trackLabel: ({ trackId }) => `トラック ${trackId}`,
    effectsChainReady: "スタジオチェーンが有効です。各トラックでダイナミクス、空間、モジュレーションを調整できます。",
    effectsChainEmpty: "トラックを選択し、サンプルを読み込むとエフェクトチェーンを開けます。",
    effectsModalTitle: ({ trackId }) => `スタジオエフェクト — トラック ${trackId}`,
    effectsModalDescription: "メインコンソールを離れずに、各コンテナの音色、奥行き、ダイナミクスを調整します。",
    effectsAmount: ({ effect }) => `${effect} amount`,
    dry: "Dry",
    wet: "Wet",
    loginToImport: "自分のサンプルをインポートするにはログインしてください。",
    importSuccess: "サンプルをライブラリにインポートしました。",
    importFailed: "サンプルのインポートに失敗しました。",
    unsupportedFormat: "未対応の形式です。wav、mp3、ogg、webm を使用してください。",
    fileTooLarge: "ファイルが現在の 24 MB 制限を超えています。",
    importPreparationFailed: "インポート用に音声ファイルを準備できませんでした。",
    sampleLoadedOnTrack: ({ sampleName, trackId }) => `「${sampleName}」をトラック ${trackId} に読み込みました。`,
    trackCleared: ({ trackId }) => `トラック ${trackId} をクリアし、サンプルを再び利用可能にしました。`,
    loadSampleFirst: "まずこのトラックにサンプルを読み込んでください。",
    missingAudioSource: "このサンプルにはまだ音声ファイルが関連付けられていません。内蔵ライブラリの接続は後で行います。",
    audioEngineStartFailed: "このブラウザではオーディオエンジンを起動できませんでした。",
    filter: "フィルター",
    filterDescription: "ループを丸くしたり暗くしたりするアニメーション付きローパスです。",
    reverb: "リバーブ",
    reverbDescription: "空間、残響、部屋の密度を調整します。",
    delay: "ディレイ",
    delayDescription: "同期した反復でループを広げます。",
    feedback: "フィードバック",
    feedbackDescription: "ディレイの反復が残る長さです。",
    drive: "ドライブ",
    driveDescription: "信号の歪み量をやわらかくから荒々しくまで調整します。",
    chorus: "コーラス",
    chorusDescription: "広がり、動き、ステレオ感を与えます。",
    comp: "コンプ",
    compDescription: "バス的なまとまりとダイナミクス制御です。",
  },
};

export function getLocaleDirection(locale: Locale): Direction {
  return localeMeta[locale]?.dir ?? "ltr";
}

export function isLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function resolveInitialLocale(value: string | null | undefined): Locale {
  return value && isLocale(value) ? value : defaultLocale;
}

export function t(locale: Locale, key: TranslationKey, params: Record<string, string | number> = {}): string {
  const entry = translations[locale]?.[key] ?? translations[defaultLocale][key];
  return typeof entry === "function" ? entry(params) : interpolate(entry, params);
}

export function getTranslationCatalog(locale: Locale) {
  return translations[locale];
}

export const effectDefinitions = [
  { key: "filter", labelKey: "filter", descriptionKey: "filterDescription" },
  { key: "reverb", labelKey: "reverb", descriptionKey: "reverbDescription" },
  { key: "delay", labelKey: "delay", descriptionKey: "delayDescription" },
  { key: "delayFeedback", labelKey: "feedback", descriptionKey: "feedbackDescription" },
  { key: "distortion", labelKey: "drive", descriptionKey: "driveDescription" },
  { key: "chorus", labelKey: "chorus", descriptionKey: "chorusDescription" },
  { key: "compressor", labelKey: "comp", descriptionKey: "compDescription" },
] as const;
