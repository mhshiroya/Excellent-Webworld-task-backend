import i18n from "i18n";
import path from "path";

i18n.configure({
  locales: ["en", "ar"], // Add more languages if needed
  defaultLocale: "en",
  directory: path.join(__dirname, "../src/locales"),
  objectNotation: true,
  autoReload: true,
  updateFiles: false,
  syncFiles: false,
});

export default i18n;
