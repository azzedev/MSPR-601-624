import React from "react";
import { useTranslation } from "react-i18next";

const translateTest: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <div className="flex flex-wrap gap-2 mb-4 max-w-full justify-center">
        <button onClick={() => i18n.changeLanguage("fr")}>🇫🇷 Français</ button>
        <button onClick={() => i18n.changeLanguage("de")}>🇩🇪 Deutsch</button>
        <button onClick={() => i18n.changeLanguage("it")}>🇮🇹 Italiano</ button>
      </div>
    </div>
  );
}
export default translateTest;