import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  getLocaleDirection,
  getTranslationCatalog,
  localeMeta,
  resolveInitialLocale,
  supportedLocales,
  t,
} from "./i18n";

describe("i18n", () => {
  it("expose les mêmes clés de traduction pour toutes les langues prises en charge", () => {
    const baselineKeys = Object.keys(getTranslationCatalog(defaultLocale)).sort();

    for (const locale of supportedLocales) {
      expect(Object.keys(getTranslationCatalog(locale)).sort()).toEqual(baselineKeys);
    }
  });

  it("interpole correctement les paramètres dynamiques", () => {
    expect(t("fr", "trackLabel", { trackId: 4 })).toBe("Piste 4");
    expect(t("en", "sampleLoadedOnTrack", { sampleName: "Kick", trackId: 2 })).toBe("“Kick” loaded on track 2.");
    expect(t("es", "chooseTrackColor", { trackId: 7 })).toBe("Elegir el color de la pista 7");
  });

  it("utilise le français comme langue de repli pour une locale invalide", () => {
    expect(resolveInitialLocale(null)).toBe(defaultLocale);
    expect(resolveInitialLocale("xx")).toBe(defaultLocale);
    expect(t(defaultLocale, "audioEngine")).toBe("Moteur audio");
  });

  it("déclare correctement la direction de l’arabe en RTL", () => {
    expect(localeMeta.ar.nativeLabel).toBe("العربية");
    expect(getLocaleDirection("ar")).toBe("rtl");
    expect(getLocaleDirection("fr")).toBe("ltr");
  });

  it("traduit le libellé de langue pour les cinq locales", () => {
    expect(t("fr", "language")).toBe("Langue");
    expect(t("en", "language")).toBe("Language");
    expect(t("es", "language")).toBe("Idioma");
    expect(t("ar", "language")).toBe("اللغة");
    expect(t("ja", "language")).toBe("言語");
  });
});
