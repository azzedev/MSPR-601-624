import { useState } from "react";
import diseases from "../assets/disease.json";
import { apiService, type PredictionResponse } from "../services/apiService";
import "../components/ButtonList.css";

console.log("Imported diseases:", diseases);

interface ButtonListProps {
  onPredictionReceived?: (prediction: PredictionResponse) => void;
}

const ButtonList: React.FC<ButtonListProps> = ({ onPredictionReceived }) => {
  const [loading, setLoading] = useState(false);
  const [activeDisease, setActiveDisease] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const diseaseList = Array.isArray(diseases) ? diseases : [diseases];

  if (!diseaseList || !diseaseList.length || !diseaseList[0]?.disease) {
    return (
      <div className="mb-4 text-red-500">
        No diseases found or data is invalid.
      </div>
    );
  }

  const diseaseMap: {
    [disease: string]: {
      [location: string]: any[];
    };
  } = {};

  diseaseList.forEach((d) => {
    if (!diseaseMap[d.disease]) diseaseMap[d.disease] = {};
    if (!diseaseMap[d.disease][d.location])
      diseaseMap[d.disease][d.location] = [];
    diseaseMap[d.disease][d.location] = d.history;
  });

  const handleDiseaseClick = async (disease: string) => {
    setLoading(true);
    setError(null);
    setActiveDisease(disease);

    try {
      // Prendre la première location disponible pour cette maladie
      const locations = Object.keys(diseaseMap[disease]);
      const firstLocation = locations[0];
      const history = diseaseMap[disease][firstLocation];

      // Vérifier qu'on a assez d'historique
      if (history.length < 12) {
        throw new Error(
          `Pas assez de données historiques. Minimum requis: 12 semaines, disponible: ${history.length}`
        );
      }

      // Faire l'appel API
      const predictionData = {
        disease,
        location: firstLocation,
        history: history,
      };

      console.log("Envoi de la prédiction:", predictionData);
      const response = await apiService.predict(predictionData);
      console.log("Prédiction reçue:", response);

      // Notifier le composant parent si callback fourni
      if (onPredictionReceived) {
        onPredictionReceived(response);
      }

    } catch (error: any) {
      console.error("Erreur lors de la prédiction:", error);
      setError(error.message || "Erreur lors de la prédiction");
      alert(`Erreur: ${error.message}`);
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
        {Object.entries(diseaseMap).map(([disease, locations]) => (
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
            {loading && activeDisease === disease ? "Chargement..." : disease}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500 mt-2">Erreur: {error}</div>}
    </div>
  );
};

export default ButtonList;
