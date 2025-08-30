import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import math

class DiseaseDataGenerator:
    """Génère des données épidémiques complètes pour le modèle LSTM"""
    
    def __init__(self):
        # Configuration des maladies UNIQUEMENT celles dans l'API
        self.disease_profiles = {
            # COVID-19 Variantes
            "COVID-19-Alpha": {
                "base_r0": 3.5,
                "base_mortality": 0.025,
                "spread_speed": 1.5,
                "stringency_response": 0.7
            },
            "COVID-19-Delta": {
                "base_r0": 5.0,
                "base_mortality": 0.018,
                "spread_speed": 2.0,
                "stringency_response": 0.6
            },
            "COVID-19-Omicron": {
                "base_r0": 8.0,
                "base_mortality": 0.005,
                "spread_speed": 3.0,
                "stringency_response": 0.4
            },
            "COVID-19-Mild": {
                "base_r0": 1.8,
                "base_mortality": 0.008,
                "spread_speed": 0.8,
                "stringency_response": 0.9
            },
            "COVID-19-Severe": {
                "base_r0": 2.2,
                "base_mortality": 0.045,
                "spread_speed": 1.0,
                "stringency_response": 0.85
            },
            
            # MonkeyPox Variantes
            "MonkeyPox-Classic": {
                "base_r0": 1.8,
                "base_mortality": 0.001,
                "spread_speed": 0.8,
                "stringency_response": 0.4
            },
            "MonkeyPox-Virulent": {
                "base_r0": 2.5,
                "base_mortality": 0.015,
                "spread_speed": 1.2,
                "stringency_response": 0.6
            },
            "MonkeyPox-Resistant": {
                "base_r0": 3.2,
                "base_mortality": 0.008,
                "spread_speed": 1.5,
                "stringency_response": 0.3
            },
            "MonkeyPox-Benign": {
                "base_r0": 1.2,
                "base_mortality": 0.0003,
                "spread_speed": 0.5,
                "stringency_response": 0.7
            },
            "MonkeyPox-Mutant": {
                "base_r0": 4.0,
                "base_mortality": 0.002,
                "spread_speed": 2.2,
                "stringency_response": 0.5
            },
            
            # Influenza Variantes
            "Influenza-H1N1": {
                "base_r0": 1.5,
                "base_mortality": 0.001,
                "spread_speed": 1.5,
                "stringency_response": 0.3
            },
            "Influenza-H5N1": {
                "base_r0": 1.2,
                "base_mortality": 0.06,  # Très mortel
                "spread_speed": 0.7,
                "stringency_response": 0.8
            },
            "Influenza-Pandemic": {
                "base_r0": 3.0,
                "base_mortality": 0.025,
                "spread_speed": 2.5,
                "stringency_response": 0.6
            },
            "Influenza-Seasonal": {
                "base_r0": 1.3,
                "base_mortality": 0.0005,
                "spread_speed": 1.8,
                "stringency_response": 0.2
            },
            "Influenza-SuperFlu": {
                "base_r0": 4.5,
                "base_mortality": 0.035,
                "spread_speed": 3.2,
                "stringency_response": 0.7
            }
        }
        
        # Configuration des pays
        self.location_profiles = {
            "France": {
                "population": 67000000,
                "density": 119.0,
                "latitude": 46.2276,
                "longitude": 2.2137,
                "continent": "Europe",
                "neighbor_count": 8,
                "continent_connectivity": 44
            },
            "China": {
                "population": 1400000000,
                "density": 153.0,
                "latitude": 35.8617,
                "longitude": 104.1954,
                "continent": "Asia",
                "neighbor_count": 14,
                "continent_connectivity": 48
            },
            "USA": {
                "population": 330000000,
                "density": 36.0,
                "latitude": 37.0902,
                "longitude": -95.7129,
                "continent": "North America",
                "neighbor_count": 2,
                "continent_connectivity": 23
            },
            "Brazil": {
                "population": 212000000,
                "density": 25.0,
                "latitude": -14.2350,
                "longitude": -51.9253,
                "continent": "South America",
                "neighbor_count": 10,
                "continent_connectivity": 13
            }
        }
        
        # Date de début de référence
        self.pandemic_start = datetime(2020, 1, 1)
        
    def generate_epidemic_curve(self, disease, location, num_weeks=20):
        """Génère une courbe épidémique réaliste"""
        profile = self.disease_profiles[disease]
        loc_profile = self.location_profiles[location]
        
        # Initialisation
        cases = []
        deaths = []
        r0_values = []
        stringency = []
        
        # Conditions initiales
        initial_cases = 100
        cumulative_cases = initial_cases
        current_r0 = profile["base_r0"]
        current_stringency = 0
        
        for week in range(num_weeks):
            # Phase épidémique
            if week < 4:
                phase = "pre_epidemic"
                growth_factor = 1.2
            elif week < 8:
                phase = "growth"
                growth_factor = 1.5
            elif week < 12:
                phase = "peak"
                growth_factor = 1.0
            elif week < 16:
                phase = "decline"
                growth_factor = 0.7
            else:
                phase = "controlled"
                growth_factor = 0.5
            
            # Calcul des cas
            weekly_cases = int(cumulative_cases * current_r0 * growth_factor * profile["spread_speed"])
            weekly_cases = max(10, weekly_cases)  # Minimum 10 cas
            cumulative_cases += weekly_cases
            
            # Calcul des décès (avec délai)
            if week > 2:
                weekly_deaths = int(cases[week-2] * profile["base_mortality"] * np.random.uniform(0.8, 1.2))
            else:
                weekly_deaths = 0
            
            # Ajustement du R0
            if phase == "growth" and current_stringency < 70:
                current_stringency += 10
            elif phase == "decline":
                current_stringency = max(30, current_stringency - 5)
            
            # Impact des mesures sur R0
            stringency_effect = 1 - (current_stringency / 100 * profile["stringency_response"])
            current_r0 = profile["base_r0"] * stringency_effect
            current_r0 = max(0.5, min(10.0, current_r0))
            
            cases.append(weekly_cases)
            deaths.append(weekly_deaths)
            r0_values.append(current_r0)
            stringency.append(current_stringency)
        
        return cases, deaths, r0_values, stringency
    
    def calculate_features(self, disease, location, week_idx, cases, deaths, r0_values, stringency):
        """Calcule toutes les features nécessaires pour une semaine"""
        loc_profile = self.location_profiles[location]
        
        # Features de base
        log_cases  = math.log1p(cases[week_idx])
        log_deaths = math.log1p(deaths[week_idx])
        
        # Calcul de la date
        current_date = self.pandemic_start + timedelta(weeks=week_idx)
        week_of_year = current_date.isocalendar()[1]
        month = current_date.month
        
        # Features temporelles
        weeks_since_start = week_idx
        week_sin = np.sin(2 * np.pi * week_of_year / 52)
        week_cos = np.cos(2 * np.pi * week_of_year / 52)
        month_sin = np.sin(2 * np.pi * month / 12)
        month_cos = np.cos(2 * np.pi * month / 12)
        
        # Taux de croissance
        if week_idx > 0:
            cases_growth = (cases[week_idx] - cases[week_idx-1]) / (cases[week_idx-1] + 1)
            deaths_growth = (deaths[week_idx] - deaths[week_idx-1]) / (deaths[week_idx-1] + 1) if deaths[week_idx-1] > 0 else 0
        else:
            cases_growth = 0
            deaths_growth = 0
        
        # Métriques par million
        cases_per_million = (cases[week_idx] / loc_profile["population"]) * 1000000
        deaths_per_million = (deaths[week_idx] / loc_profile["population"]) * 1000000
        
        # Phase épidémique
        if week_idx < 4:
            phase = "pre_epidemic"
            epidemic_phase = 0
        elif week_idx < 8:
            phase = "growth"
            epidemic_phase = 1
        elif week_idx < 12:
            phase = "peak"
            epidemic_phase = 2
        elif week_idx < 16:
            phase = "decline"
            epidemic_phase = 3
        else:
            phase = "controlled"
            epidemic_phase = 4
        
        # One-hot encoding des phases
        phases_one_hot = {
            "phase_pre_epidemic": 1 if epidemic_phase == 0 else 0,
            "phase_growth": 1 if epidemic_phase == 1 else 0,
            "phase_peak": 1 if epidemic_phase == 2 else 0,
            "phase_decline": 1 if epidemic_phase == 3 else 0,
            "phase_controlled": 1 if epidemic_phase == 4 else 0,
            "phase_resurgence": 0  # Simplification
        }
        
        # Calcul de mortality_rate avec protection
        mortality_rate = deaths[week_idx] / (cases[week_idx] + 1) if cases[week_idx] > 0 else 0
        mortality_rate = min(mortality_rate, 0.2)  # Cap à 20%
        
        # Création du dictionnaire de features
        features = {
            # Features temporelles
            "week": week_idx + 1,
            "weeks_since_start": float(weeks_since_start),
            "week_sin": float(week_sin),
            "week_cos": float(week_cos),
            "month_sin": float(month_sin),
            "month_cos": float(month_cos),
            
            # Features épidémiologiques
            "log_weekly_cases": float(log_cases),
            "log_weekly_deaths": float(log_deaths),
            "avg_cases_per_million": float(cases_per_million),
            "avg_deaths_per_million": float(deaths_per_million),
            "avg_reproduction_rate": float(r0_values[week_idx]),
            "avg_mortality_rate": float(mortality_rate * 100),  # En pourcentage
            "cases_growth_rate": float(np.clip(cases_growth, -10, 10)),
            "deaths_growth_rate": float(np.clip(deaths_growth, -10, 10)),
            
            # Mesures
            "avg_stringency_index": float(stringency[week_idx]),
            
            # Features géographiques
            "population_density": float(loc_profile["density"]),
            "neighbor_count_1000km": float(loc_profile["neighbor_count"]),
            "continent_connectivity": float(loc_profile["continent_connectivity"]),
            
            # Indicateurs de qualité
            "regression_weight_adjusted": 0.8,
            "avg_reproduction_rate_was_missing": 0,
            "deaths_growth_rate_was_missing": 0,
            "avg_stringency_index_was_missing": 0,
            "cases_growth_rate_was_missing": 0,
            "avg_mortality_rate_was_missing": 0,
            
            # Metadata
            "epidemic_phase": phase,
            "epidemic_phase_numeric": epidemic_phase,
            
            # Targets calculés (pour référence)
            "transmission_rate": float(r0_values[week_idx] / 10),  # Normalisé
            "countries_affected_continent": 30 + week_idx  # Simulation
        }
        
        # Ajout des phases one-hot
        features.update(phases_one_hot)
        
        return features
    
    def generate_disease_data(self, disease, location, num_weeks=20):
        """Génère les données complètes pour une maladie/location"""
        # Génération de la courbe épidémique
        cases, deaths, r0_values, stringency = self.generate_epidemic_curve(disease, location, num_weeks)
        
        # Génération des features pour chaque semaine
        history = []
        for week_idx in range(num_weeks):
            week_data = self.calculate_features(
                disease, location, week_idx, 
                cases, deaths, r0_values, stringency
            )
            history.append(week_data)
        
        return {
            "disease": disease,
            "location": location,
            "location_info": self.location_profiles[location],
            "history": history
        }
    
    def generate_dataset(self, diseases=None, locations=None, num_weeks=20):
        """Génère un dataset complet"""
        if diseases is None:
            diseases = list(self.disease_profiles.keys())
        if locations is None:
            locations = list(self.location_profiles.keys())
        
        dataset = []
        for disease in diseases:
            for location in locations:
                data = self.generate_disease_data(disease, location, num_weeks)
                dataset.append(data)
        
        return dataset

# Utilisation du générateur
if __name__ == "__main__":
    # Créer le générateur
    generator = DiseaseDataGenerator()
    
    # Générer les données
    print("Génération des données épidémiques...")
    dataset = generator.generate_dataset(
        diseases=None,  # Utilise toutes les maladies (15 au total)
        locations=["France", "China", "USA", "Brazil"],
        num_weeks=20  # Au moins 12 semaines nécessaires pour le modèle
    )
    
    # Sauvegarder en JSON
    with open('disease.json', 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Fichier généré : disease.json")
    print(f"📊 Contenu : {len(dataset)} scénarios épidémiques")
    print(f"🦠 Nombre de maladies : {len(generator.disease_profiles)}")
    print(f"📈 Features par semaine : {len(dataset[0]['history'][0])} features")
    
    # Afficher un résumé des maladies
    print("\n🔍 Résumé des maladies générées :")
    print("\nCOVID-19 (5 variantes):")
    for disease, profile in generator.disease_profiles.items():
        if "COVID" in disease:
            print(f"  - {disease}: R0={profile['base_r0']}, Mortalité={profile['base_mortality']*100:.2f}%")
    
    print("\nMonkeyPox (5 variantes):")
    for disease, profile in generator.disease_profiles.items():
        if "MonkeyPox" in disease:
            print(f"  - {disease}: R0={profile['base_r0']}, Mortalité={profile['base_mortality']*100:.2f}%")
    
    print("\nInfluenza (5 variantes):")
    for disease, profile in generator.disease_profiles.items():
        if "Influenza" in disease:
            print(f"  - {disease}: R0={profile['base_r0']}, Mortalité={profile['base_mortality']*100:.2f}%")