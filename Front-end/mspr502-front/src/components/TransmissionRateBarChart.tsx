import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import type { PredictionResponse } from "../services/apiService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  predictions?: PredictionResponse | null;
}

const TransmissionRateBarChart: React.FC<Props> = ({ predictions }) => {
  const defaultData = {
    labels: ["USA", "France", "Espagne", "Russie", "Chine"],
    datasets: [
      {
        label: "Taux de transmission",
        data: [1.2, 1.1, 1.4, 3, 2.4],
        backgroundColor: "rgba(0, 114, 178, 0.8)",
        borderRadius: 8,
        barThickness: 10,
        categoryPercentage: 0.5,
        barPercentage: 1.0,
      },
    ],
  };

  const dynamicData =
    predictions && predictions.status === "success"
      ? {
          labels: [
            predictions.location,
            "Moyenne mondiale",
            "Seuil épidémique",
          ],
          datasets: [
            {
              label: "Taux de transmission (R0)",
              data: [
                predictions.predictions.transmission_rate.value,
                1.5, // Moyenne mondiale
                1.0,
              ],
              backgroundColor: [
                predictions.predictions.transmission_rate.value > 1
                  ? "rgba(230, 159, 0, 0.8)"
                  : "rgba(0, 114, 178, 0.8)", 
                "rgba(148, 103, 189, 1)",
                "rgba(86, 180, 233, 0.8)",
              ],
              borderRadius: 8,
              barThickness: 40,
              categoryPercentage: 0.5,
              barPercentage: 1.0,
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
          ? `Taux de transmission prédit - ${predictions.disease} (${predictions.location})`
          : "Taux de transmission par pays",
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `R0: ${context.parsed.y.toFixed(3)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "R0 (Taux de reproduction de base)",
        },
        ticks: {
          callback: (value: any) => value.toFixed(1),
        },
      },
    },
  };

  return (
    <div className="bg-gray-50 shadow-2xl border-2 border-black rounded-3xl p-4 min-w-180 min-h-100">
      <div className="w-full overflow-x-auto">
        <Bar data={dynamicData} options={options} />
        {predictions && (
          <div className="mt-2 text-sm text-gray-600 text-center">
            {predictions.predictions.transmission_rate.value > 1
              ? "Risque de propagation élevé (R0 > 1)"
              : "Propagation sous contrôle (R0 ≤ 1)"}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransmissionRateBarChart;
