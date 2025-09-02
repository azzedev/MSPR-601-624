import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GeoPropagationBar: React.FC = () => {
  const { t } = useTranslation();

  const propagationData = {
    labels: ['France', 'Espagne', 'Italie', 'Allemagne', 'Brésil', 'Inde'],
    datasets: [
      {
        label: t('confirmed_cases'),
        data: [100000, 85000, 92000, 76000, 120000, 150000],
        backgroundColor: 'rgba(148, 103, 189, 1)',
        borderRadius: 6,
        barThickness: 14,
      },
    ],
  };

  const propagationOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('geographic_propagation_by_country'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('number_of_cases'),
        },
      },
    },
  };

  return (
    <div className="bg-gray-50 shadow-2xl border-2 border-black rounded-3xl p-4 min-w-180 min-h-100">
      <Bar data={propagationData} options={propagationOptions} />
    </div>
  );
};

export default GeoPropagationBar;