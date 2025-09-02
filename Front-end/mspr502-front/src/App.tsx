import { useState, useEffect } from "react";
import "./App.css";
import TransmissionRateBarChart from "./components/TransmissionRateBarChart";
import ButtonList from "./components/ButtonList";
import GeoPropagationBar from "./components/GeoPropagationBar";
import LineChartNumberOfDeathAndHealByDay from "./components/LineChartNumberOfDeathByDay";
import { Chart, Filler } from "chart.js";
import { apiService, type PredictionResponse } from "./services/apiService";
import TranslateTest from "./components/langageButton";

Chart.register(Filler);

function App() {
  const [predictions, setPredictions] = useState<PredictionResponse | null>(
    null
  );
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );

  // état de l'API au démarrage
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const health = await apiService.checkHealth();
        console.log("API Health:", health);
        setApiStatus("online");
      } catch (error) {
        console.error("API is offline:", error);
        setApiStatus("offline");
      }
    };

    checkAPI();
  }, []);

  const handlePredictionReceived = (prediction: PredictionResponse) => {
    console.log("Nouvelle prédiction reçue dans App:", prediction);
    setPredictions(prediction);
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-col gap-6 p-4">
        {/* Statut de l'API */}
        <div
          className={`text-sm font-semibold ${
            apiStatus === "online"
              ? "text-green-600"
              : apiStatus === "offline"
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          API Status: {apiStatus === "checking" ? "Vérification..." : apiStatus}
        </div>

        {/* Si il y a des prédictions de disponible ils seron afficher ici */}
        {predictions && predictions.status === "success" && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold mb-2 text-black">
              Prédictions pour {predictions.disease} - {predictions.location}
            </h2>
            {/* Si se n'est pas le covid ça affichera un warning */}
            {predictions.metadata.warning && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mb-3">
                <p className="font-bold"> Limitation du modèle</p>
                <p className="text-sm">{predictions.metadata.warning}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded shadow">
                <h3 className="font-semibold text-gray-700">
                  Taux de mortalité
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  {predictions.predictions.mortality_rate.value.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <h3 className="font-semibold text-gray-700">
                  Taux de transmission (R0)
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {predictions.predictions.transmission_rate.value.toFixed(3)}
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <h3 className="font-semibold text-gray-700">
                  Propagation spatiale
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {predictions.predictions.spatial_spread.value.toFixed(3)}
                </p>
                <p className="text-xs text-gray-500">*(peu fiable)</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Confiance: {predictions.metadata.confidence} | Horizon:{" "}
              {predictions.metadata.prediction_horizon}
            </div>
          </div>
        )}

        <TranslateTest />

        <ButtonList onPredictionReceived={handlePredictionReceived} />

        {/* Passer les prédictions aux graphiques */}
        <TransmissionRateBarChart predictions={predictions} />
        <LineChartNumberOfDeathAndHealByDay predictions={predictions} />
        <GeoPropagationBar /*predictions={predictions}*/ />
      </div>
    </div>
  );
}

export default App;
