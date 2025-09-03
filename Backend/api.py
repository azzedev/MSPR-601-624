from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import logging
from datetime import datetime

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialisation Flask
app = Flask(__name__)
CORS(app)  # Active CORS pour toutes les routes (en dev pour que tout le monde est accées a l'api)

# Variables globales pour le modèle
model = None
scaler_features = None
scaler_targets = None

# Configuration
SEQUENCE_LENGTH = 12  # Le modèle attend 12 semaines d'historique
NUM_FEATURES = 29  # Le modèle attend 29 features

# Liste des features dans l'ordre exact attendu par le modèle
FEATURE_ORDER = [
    "log_weekly_cases",
    "log_weekly_deaths",
    "avg_cases_per_million",
    "avg_deaths_per_million",
    "avg_reproduction_rate",
    "avg_mortality_rate",
    "cases_growth_rate",
    "deaths_growth_rate",
    "avg_stringency_index",
    "weeks_since_start",
    "week_sin",
    "week_cos",
    "month_sin",
    "month_cos",
    "phase_pre_epidemic",
    "phase_growth",
    "phase_peak",
    "phase_decline",
    "phase_controlled",
    "phase_resurgence",
    "population_density",
    "neighbor_count_1000km",
    "continent_connectivity",
    "regression_weight_adjusted",
    "avg_reproduction_rate_was_missing",
    "deaths_growth_rate_was_missing",
    "avg_stringency_index_was_missing",
    "cases_growth_rate_was_missing",
    "avg_mortality_rate_was_missing",
]


def load_models():
    global model, scaler_features, scaler_targets
    try:
        logger.info("Chargement du modèle")
        model = tf.keras.models.load_model("models/model.keras")
        logger.info("Chargement des scalers")
        scaler_features = joblib.load("models/scaler_features.pkl")
        logger.info(f"scaler_features loaded: {scaler_features is not None}")
        scaler_targets = joblib.load("models/scaler_targets.pkl")
        logger.info(f"scaler_targets loaded: {scaler_targets is not None}")
        logger.info(" Modèles chargés avec succès")
        return True
    except Exception as e:
        logger.error(f" Erreur lors du chargement des modèles: {str(e)}")
        return False

# Chargement des modèles au lancement du conteneur
if load_models():
    logger.info("✅ Modèles chargés avec succès")
else:
    logger.error("❌ Impossible de charger les modèles")

def prepare_sequence(history_data):
    """Prépare une séquence de données pour le modèle"""
    try:
        # Vérifier qu'on a assez de données
        if len(history_data) < SEQUENCE_LENGTH:
            raise ValueError(
                f"Historique insuffisant: {len(history_data)} semaines, minimum requis: {SEQUENCE_LENGTH}"
            )

        # Prendre les dernières SEQUENCE_LENGTH semaines
        sequence_data = history_data[-SEQUENCE_LENGTH:]

        # Créer un DataFrame avec les features dans le bon ordre
        sequence_features = []
        for week_data in sequence_data:
            week_features = []
            for feature in FEATURE_ORDER:
                if feature in week_data:
                    week_features.append(float(week_data[feature]))
                else:
                    # Valeur par défaut si la feature manque
                    logger.warning(f"Feature manquante: {feature}")
                    week_features.append(0.0)
            sequence_features.append(week_features)

        # Convertir en array numpy
        sequence_array = np.array(sequence_features)

        # Normaliser avec le scaler
        sequence_normalized = scaler_features.transform(sequence_array)

        # Reshape pour le modèle (1, 12, 29)
        sequence_final = sequence_normalized.reshape(1, SEQUENCE_LENGTH, NUM_FEATURES)

        return sequence_final

    except Exception as e:
        logger.error(f"Erreur dans la préparation des données: {str(e)}")
        raise


def make_prediction(sequence):
    """Fait une prédiction avec le modèle"""
    try:
        # Prédiction (résultat normalisé)
        prediction_normalized = model.predict(sequence, verbose=0)

        # Dénormaliser la prédiction
        prediction_real = scaler_targets.inverse_transform(prediction_normalized)

        # Extraire les valeurs
        mortality_rate = float(prediction_real[0, 0])
        transmission_rate = float(prediction_real[0, 1])
        spatial_spread = float(prediction_real[0, 2])

        return {
            "mortality_rate": round(mortality_rate, 4),
            "transmission_rate": round(transmission_rate, 4),
            "spatial_spread": round(spatial_spread, 4),
        }

    except Exception as e:
        logger.error(f"Erreur lors de la prédiction: {str(e)}")
        raise


@app.route("/", methods=["GET"])
def home():
    """Route d'accueil"""
    return jsonify(
        {
            "message": "API de Prédiction Épidémique",
            "version": "1.0",
            "endpoints": {
                "/": "Cette page",
                "/health": "Vérification de l'état de l'API",
                "/predict": "Prédiction épidémique (POST)",
                "/predict/batch": "Prédictions multiples (POST)",
            },
        }
    )


@app.route("/health", methods=["GET"])
def health_check():
    """Vérification de l'état de l'API"""
    return jsonify(
        {
            "status": "healthy",
            "model_loaded": model is not None,
            "scaler_features_loaded": scaler_features is not None,
            "scaler_targets_loaded": scaler_targets is not None,
            "timestamp": datetime.now().isoformat(),
        }
    )


@app.route("/predict", methods=["POST"])
def predict():
    """
    Endpoint principal de prédiction
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Aucune donnée reçue"}), 400

        if "history" not in data:
            return jsonify({"error": "Historique manquant"}), 400

        history = data["history"]
        disease = data.get("disease", "Unknown")

        # IMPORTANT: Vérifier si c'est une maladie COVID-19
        is_covid = "COVID" in disease.upper()

        # Préparer la séquence
        sequence = prepare_sequence(history)

        # Faire la prédiction
        predictions = make_prediction(sequence)

        # Ajuster les prédictions selon la maladie
        if not is_covid:
            # Appliquer des facteurs de correction pour les autres maladies
            # basés sur les caractéristiques connues
            if "MonkeyPox" in disease:
                predictions["mortality_rate"] *= 0.1  # MonkeyPox est moins mortel
                predictions["transmission_rate"] *= 0.6  # Moins transmissible
            elif "Influenza" in disease:
                if "H5N1" in disease:
                    predictions["mortality_rate"] *= 10  # H5N1 très mortel
                    predictions["transmission_rate"] *= 0.3  # Peu transmissible
                else:
                    predictions["mortality_rate"] *= 0.2  # Grippe normale
                    predictions["transmission_rate"] *= 0.5

            confidence = "low - modèle entraîné uniquement sur COVID-19"
        else:
            confidence = "high" if predictions["transmission_rate"] < 3 else "medium"

        # Préparer la réponse
        response = {
            "status": "success",
            "disease": disease,
            "location": data.get("location", "Unknown"),
            "predictions": {
                "mortality_rate": {
                    "value": predictions["mortality_rate"],
                    "unit": "percentage",
                    "description": "Taux de mortalité prédit",
                },
                "transmission_rate": {
                    "value": predictions["transmission_rate"],
                    "unit": "R0",
                    "description": "Taux de transmission prédit",
                },
                "spatial_spread": {
                    "value": predictions["spatial_spread"],
                    "unit": "correlation",
                    "description": "Propagation spatiale (peu fiable)",
                },
            },
            "metadata": {
                "model_version": "1.0",
                "prediction_horizon": "4 weeks",
                "confidence": confidence,
                "warning": "Modèle optimisé pour COVID-19" if not is_covid else None,
            },
        }

        return jsonify(response), 200

    except ValueError as e:
        return (
            jsonify({"status": "error", "error": str(e), "type": "validation_error"}),
            400,
        )


@app.errorhandler(404)
def not_found(error):
    """Gestion des erreurs 404"""
    return (
        jsonify(
            {
                "status": "error",
                "error": "Endpoint non trouvé",
                "available_endpoints": ["/", "/health", "/predict", "/predict/batch"],
            }
        ),
        404,
    )


@app.errorhandler(500)
def internal_error(error):
    """Gestion des erreurs 500"""
    return jsonify({"status": "error", "error": "Erreur interne du serveur"}), 500


if __name__ == "__main__":
    # Charger les modèles au démarrage
    if load_models():
        logger.info(" API démarrée sur http://localhost:5000")
        logger.info(" Endpoints disponibles:")
        logger.info("   - POST /predict : Prédiction unique")
        logger.info("   - POST /predict/batch : Prédictions multiples")
        logger.info("   - GET /health : Vérification de l'état")

        # Lancer l'API
        app.run(
            host="0.0.0.0",  # Accessible depuis n'importe quelle IP
            port=5000,
            debug=True,
        )
    else:
        logger.error(" Impossible de démarrer l'API : modèles non chargés")
