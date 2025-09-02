import { useState } from "react";
import diseases from "../assets/disease.json";
import { apiService, type PredictionResponse } from "../services/apiService";
import "../components/ButtonList.css";
import { useTranslation } from "react-i18next";

interface ButtonListProps {
  onPredictionReceived?: (prediction: PredictionResponse) => void;
}

const ButtonList: React.FC<ButtonListProps> = ({ onPredictionReceived }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeDisease, setActiveDisease] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const diseaseList = Array.isArray(diseases) ? diseases : [diseases];

  console.log(t("imported_diseases"), diseases);

  if (!diseaseList || !diseaseList.length || !diseaseList[0]?.disease) {
    return <div className="mb-4 text-red-500">{t("no_diseases_found")}</div>;
  }

  const diseaseMap: {
    [disease: string]: {
      [location: string]: any[];
    };
  } = {};

  diseaseList.forEach((d) => {
    if (!diseaseMap[d.disease]) diseaseMap[d.disease] = {};
    if (!diseaseMap[d.disease][d.location]) diseaseMap[d.disease][d.location] = [];
    diseaseMap[d.disease][d.location] = d.history;
  });

  const handleDiseaseClick = async (disease: string) => {
    setLoading(true);
    setError(null);
    setActiveDisease(disease);

    try {
      const locations = Object.keys(diseaseMap[disease]);
      const firstLocation = locations[0];
      const history = diseaseMap[disease][firstLocation];

      if (history.length < 12) {
        throw new Error(
          t("not_enough_history", { min: 12, available: history.length })
        );
      }

      const predictionData = { disease, location: firstLocation, history };

      console.log(t("sending_prediction"), predictionData);
      const response = await apiService.predict(predictionData);
      console.log(t("prediction_received"), response);

      if (onPredictionReceived) {
        onPredictionReceived(response);
      }
    } catch (error: any) {
      console.error(t("prediction_error_console"), error);
      const message = error.message || t("prediction_error");
      setError(message);
      alert(`${t("error_label")}: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 mb-4 max-w-full"
        style={{ maxWidth: "700px" }}
      >
        {Object.entries(diseaseMap).map(([disease]) => (
          <button
            key={disease}
            className={`px-4 py-2 text-white rounded hover:bg-blue-700 whitespace-nowrap ${
              activeDisease === disease
                ? "buttonListComponentActive"
                : "buttonListComponent"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => handleDiseaseClick(disease)}
            disabled={loading}
          >
            {loading && activeDisease === disease ? t("loading") : disease}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500 mt-2">{t("error_label")}: {error}</div>}
    </div>
  );
};

export default ButtonList;
