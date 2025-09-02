// services/apiService.ts

const API_URL = "http://localhost:5000";

export interface PredictionRequest {
  disease: string;
  location: string;
  history: any[];
}

export interface PredictionResponse {
  status: string;
  disease: string;
  location: string;
  predictions: {
    mortality_rate: {
      value: number;
      unit: string;
      description: string;
    };
    transmission_rate: {
      value: number;
      unit: string;
      description: string;
    };
    spatial_spread: {
      value: number;
      unit: string;
      description: string;
    };
  };
  metadata: {
    warning: any;
    model_version: string;
    prediction_horizon: string;
    confidence: string;
  };
}

export const apiService = {
  // Test de santé de l'API
  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  },

  // Prédiction unique
  async predict(data: PredictionRequest): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Prediction failed:", error);
      throw error;
    }
  },

  // Prédictions multiples
  async predictBatch(predictions: PredictionRequest[]): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/predict/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ predictions }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Batch prediction failed:", error);
      throw error;
    }
  },
};
