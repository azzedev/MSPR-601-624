import { useState, useEffect } from "react";
import "./App.css";
import TransmissionRateBarChart from "./components/TransmissionRateBarChart";
import ButtonList from "./components/ButtonList";
import GeoPropagationBar from "./components/GeoPropagationBar";
import LineChartNumberOfDeathAndHealByDay from "./components/LineChartNumberOfDeathByDay";
import { Chart, Filler } from "chart.js";
import { apiService, type PredictionResponse } from "./services/apiService";
import TranslateTest from "./components/langageButton";
import { useTranslation } from "react-i18next";

Chart.register(Filler);

function App() {
  const { t } = useTranslation();
  const [predictions, setPredictions] = useState<PredictionResponse | null>(
    null
  );
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );

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
          {t("api_status")}:{" "}
          {apiStatus === "checking" ? t("checking") : apiStatus}
        </div>

        {/* Prédictions */}
        {predictions && predictions.status === "success" && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold mb-2 text-black">
              {t("predictions_for")} {predictions.disease} - {predictions.location}
            </h2>

            {predictions.metadata.warning && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mb-3">
                <p className="font-bold">{t("model_limitation")}</p>
                <p className="text-sm">{predictions.metadata.warning}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded shadow">
                <h3 className="font-semibold text-gray-700">{t("mortality_rate")}</h3>
                <p className="text-2xl font-bold text-red-600">
                  {predictions.predictions.mortality_rate.value.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <h3 className="font-semibold text-gray-700">{t("transmission_rate")}</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {predictions.predictions.transmission_rate.value.toFixed(3)}
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <h3 className="font-semibold text-gray-700">{t("spatial_spread")}</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {predictions.predictions.spatial_spread.value.toFixed(3)}
                </p>
                <p className="text-xs text-gray-500">*({t("unreliable")})</p>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              {t("confidence")}: {predictions.metadata.confidence} | {t("horizon")}:{" "}
              {predictions.metadata.prediction_horizon}
            </div>
          </div>
        )}

        {/* Boutons de langue */}
        <TranslateTest />

        {/* Liste de prédictions */}
        <ButtonList onPredictionReceived={handlePredictionReceived} />

        {/* Graphiques */}
        <TransmissionRateBarChart predictions={predictions} />
        <LineChartNumberOfDeathAndHealByDay predictions={predictions} />
        <GeoPropagationBar />
      </div>
    </div>
  );
}

export default App;
