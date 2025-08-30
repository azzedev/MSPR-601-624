import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { PredictionResponse } from "../services/apiService";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  predictions?: PredictionResponse | null;
}

const LineChartNumberOfDeathAndHealByDay: React.FC<Props> = ({
  predictions,
}) => {
  // Données par défaut
  const defaultData = {
    labels: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
    datasets: [
      {
        label: "nombre de décès",
        data: [2, 14, 18, 22, 19],
        borderColor: "rgba(230, 159, 0, 0.2)",
        backgroundColor: "rgba(0, 114, 178, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointStyle: "circle",
      },
    ],
  };

  // Si prédictions, créer une simulation basée sur le taux de mortalité
  const dynamicData =
    predictions && predictions.status === "success"
      ? {
          labels: [
            "Semaine 1",
            "Semaine 2",
            "Semaine 3",
            "Semaine 4",
            "Semaine 5",
          ],
          datasets: [
            {
              label: `Décès prédits - ${predictions.disease}`,
              data: [
                Math.round(1000 * predictions.predictions.mortality_rate.value),
                Math.round(2500 * predictions.predictions.mortality_rate.value),
                Math.round(5000 * predictions.predictions.mortality_rate.value),
                Math.round(4500 * predictions.predictions.mortality_rate.value),
                Math.round(3000 * predictions.predictions.mortality_rate.value),
              ],
              borderColor:
                predictions.predictions.mortality_rate.value > 0.01
                  ? "rgba(230, 159, 0, 0.8)" // orange si mortalité > 1%
                  : "rgba(0, 114, 178, 0.8)",
              backgroundColor:
                predictions.predictions.mortality_rate.value > 0.01
                  ? "rgba(230, 159, 0, 0.2)"
                  : "rgba(0, 114, 178, 0.2)",
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointStyle: "circle",
            },
          ],
        }
      : defaultData;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: predictions
          ? `Projection des décès - ${predictions.disease} (${predictions.location})`
          : "Nombre de décès par jour",
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10000,
        title: {
          display: true,
          text: "Nombre de décès estimés (pour 100k cas)",
        },
        ticks: {
          stepSize: 1000,
        },
      },
    },
  };

  return (
    <div className="bg-gray-50 shadow-2xl border-2 border-black rounded-3xl p-4 min-w-180 min-h-100">
      <Line data={dynamicData} options={options} />
      {predictions && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          Taux de mortalité prédit :{" "}
          {predictions.predictions.mortality_rate.value.toFixed(2)}%
        </div>
      )}
    </div>
  );
};

export default LineChartNumberOfDeathAndHealByDay;
