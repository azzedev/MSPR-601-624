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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const propagationData = {
  labels: ['France', 'Espagne', 'Italie', 'Allemagne', 'Brésil', 'Inde'],
  datasets: [
    {
      label: 'Nombre de cas confirmés',
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
      text: 'Propagation géographique par pays',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Nombre de cas',
      },
    },
  },
};

const GeoPropagationBar: React.FC = () => {
  return (
    <div className="bg-gray-50 shadow-2xl border-2 border-black rounded-3xl p-4 min-w-180 min-h-100">
      <Bar data={propagationData} options={propagationOptions} />
    </div>
  );
};

export default GeoPropagationBar;
