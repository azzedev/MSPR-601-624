import React from "react";
import { useTranslation } from "react-i18next";

const translateTest: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <button onClick={() => i18n.changeLanguage("fr")}>🇫🇷 Français</button>
      <button onClick={() => i18n.changeLanguage("de")}>🇩🇪 Deutsch</button>
      <button onClick={() => i18n.changeLanguage("it")}>🇮🇹 Italiano</button>
      <h1>{t("welcome")}</h1>
    </div>
  );
}
export default translateTest;