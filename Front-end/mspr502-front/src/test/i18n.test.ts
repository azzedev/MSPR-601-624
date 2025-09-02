import frRaw from "../traduction/fr.json";
import deRaw from "../traduction/de.json";
import itRaw from "../traduction/it.json";

const fr = frRaw as Record<string, string>;
const de = deRaw as Record<string, string>;
const it = itRaw as Record<string, string>;

const keys = Object.keys(fr);

describe("Vérification des traductions i18n", () => {
  test("Toutes les langues ont les mêmes clés que FR", () => {
    [de, it].forEach((lang) => {
      keys.forEach((key) => {
        expect(lang[key]).toBeDefined();
      });
    });
  });
});
