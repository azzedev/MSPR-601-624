# API

## Description



Pour cette partie l'objectif est de faire un MVP de l'application pour l'OMS nous avont donc utilisé flask, l'api récupère les modeles entrainé dans la partie ML (scaler feature target et best_model.keras).
l'api expose ensuite les endpoints REST pour faire des prédiction sur les indicateurs épidémiologique

## Installation et Démarrage

### Prérequis
- Python 3.8+
- Les fichiers du modèle (`best_model.keras`, `scaler_features.pkl`, `scaler_targets.pkl`)
- Les dépendances Python (Flask, TensorFlow, etc.)

### Installation
```bash
pip install flask flask-cors tensorflow numpy pandas joblib
```

### Démarrage
```bash
python api.py
```

L'API sera accessible sur `http://localhost:5000`

## Endpoints Disponibles

### 1. **GET /** - Page d'accueil
Retourne les informations sur l'API et les endpoints disponibles.

### 2. **GET /health** - Vérification de l'état
Vérifie que l'API fonctionne correctement et que les modèles sont chargés.

### 3. **POST /predict** - Prédiction unique
Fait une prédiction pour une maladie et une localisation données.

**Format de requête :**
```json
{
    "disease": "COVID-19",
    "location": "France",
    "history": [
        {
            "log_weekly_cases": 3.2,
            "log_weekly_deaths": 1.5,
            "avg_reproduction_rate": 1.2,
            // ... autres features (29 au total)
        },
        // ... 12 semaines d'historique
    ]
}
```

**Format de réponse :**
```json
{
    "status": "success",
    "disease": "COVID-19",
    "location": "France",
    "predictions": {
        "mortality_rate": {
            "value": 0.0146,
            "unit": "percentage",
            "description": "Taux de mortalité prédit"
        },
        "transmission_rate": {
            "value": 1.2,
            "unit": "R0",
            "description": "Taux de transmission prédit"
        },
        "spatial_spread": {
            "value": 0.0165,
            "unit": "correlation",
            "description": "Propagation spatiale (peu fiable)"
        }
    },
    "metadata": {
        "model_version": "1.0",
        "prediction_horizon": "4 weeks",
        "confidence": "high",
        "warning": null
    }
}
```

## Limitations et Solutions Implémentées

### Problème Identifié
Le modèle LSTM a été entraîné exclusivement sur des données COVID-19 (2020-2024), ce qui a donné d'excellents résultats pour cette maladie (MAE de 0.0135). Cependant, lors des tests avec d'autres maladies (MonkeyPox, Influenza), le modèle produisait des prédictions quasi-identiques car il n'avait jamais vu ces pathogènes durant l'entraînement.


### Solution Temporaire Implémentée
Pour permettre au système de fonctionner avec plusieurs maladies malgré cette limitation, nous avons :

1. **Ajouté des facteurs de correction dans l'API** basés sur des informations récupéré sur internet :
   - MonkeyPox : mortalité ×0.1, transmission ×0.6 (moins dangereux que COVID)
   - Influenza H5N1 : mortalité ×10, transmission ×0.3 (très mortel, peu transmissible)
   - Influenza standard : mortalité ×0.2, transmission ×0.5

2. **Ajouté des avertissements transparents** dans l'interface pour indiquer quand le modèle fonctionne hors de son domaine d'entraînement

3. **Adapté les visualisations** pour refléter les différences entre maladies malgré les limitations du modèle

### Résultats
-  **COVID-19** : Prédictions précises (modèle entraîné sur ces données)
-  **Autres maladies** : Approximations basées sur des corrections épidémiologiques

### Amélioration Future Recommandée
Réentraîner le modèle avec un dataset multi-pathogènes incluant des données historiques de différentes maladies pour obtenir des prédictions natives précises sans facteurs de correction.

## Transparence

Le système indique clairement à l'utilisateur quand les prédictions sont basées sur le modèle COVID-19 avec des corrections appliquées, garantissant ainsi une utilisation éthique et transparente de l'IA.

Cette approche démontre :
- La capacité à identifier et diagnostiquer les limitations d'un modèle
- L'implémentation de solutions pragmatiques dans des contraintes de temps
- La transparence envers les utilisateurs sur les capacités réelles du système
- Une compréhension des améliorations nécessaires pour une version production

## Architecture Technique

### Gestion des Erreurs
- Validation des données d'entrée
- Messages d'erreur explicites
- Codes HTTP appropriés (200, 400, 404, 500)

### Sécurité
- CORS activé pour permettre les requêtes cross-origin (pour le dev uniquement)
- Validation des types de données
- Logging des erreurs pour le debugging

### Performance
- Chargement unique des modèles au démarrage
- Prédictions rapides (<100ms par requête)
- Support des prédictions batch pour l'efficacité

## Exemple d'Utilisation

```python
import requests
import json

# Préparer les données
data = {
    "disease": "COVID-19",
    "location": "France",
    "history": [
        # 12 semaines de données historiques
        {feature: value for feature in FEATURE_ORDER}
        for _ in range(12)
    ]
}

# Faire la requête
response = requests.post(
    "http://localhost:5000/predict",
    json=data,
    headers={"Content-Type": "application/json"}
)

# Analyser la réponse
if response.status_code == 200:
    result = response.json()
    print(f"Mortality Rate: {result['predictions']['mortality_rate']['value']}")
    print(f"Transmission Rate: {result['predictions']['transmission_rate']['value']}")
else:
    print(f"Erreur: {response.json()['error']}")
```