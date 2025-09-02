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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  // Données par défaut
  const defaultData = {
    labels: [
      t("monday"),
      t("tuesday"),
      t("wednesday"),
      t("thursday"),
      t("friday"),
    ],
    datasets: [
      {
        label: t("deaths"),
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

  // Données dynamiques si prédictions
  const dynamicData =
    predictions && predictions.status === "success"
      ? {
          labels: [
            t("week_1"),
            t("week_2"),
            t("week_3"),
            t("week_4"),
            t("week_5"),
          ],
          datasets: [
            {
              label: `${t("predicted_deaths")} - ${predictions.disease}`,
              data: [
                Math.round(1000 * predictions.predictions.mortality_rate.value),
                Math.round(2500 * predictions.predictions.mortality_rate.value),
                Math.round(5000 * predictions.predictions.mortality_rate.value),
                Math.round(4500 * predictions.predictions.mortality_rate.value),
                Math.round(3000 * predictions.predictions.mortality_rate.value),
              ],
              borderColor:
                predictions.predictions.mortality_rate.value > 0.01
                  ? "rgba(230, 159, 0, 0.8)"
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
          ? `${t("projection_of_deaths")} - ${predictions.disease} (${predictions.location})`
          : t("number_of_deaths_per_day"),
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10000,
        title: {
          display: true,
          text: t("estimated_deaths_per_100k"),
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
          {t("predicted_mortality_rate")}:{" "}
          {predictions.predictions.mortality_rate.value.toFixed(2)}%
        </div>
      )}
    </div>
  );
};

export default LineChartNumberOfDeathAndHealByDay;
