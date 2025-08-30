# MSPR502 Front-End

Ce README est pour le front-end de l'application de prédiction de la propagation de maladies. Il permet d'afficher des statistiques, des graphiques interactifs et d'obtenir des prédictions via une API.

## Fonctionnalités principales

- Sélection de maladies et affichage des prédictions (pour les taux de mortalité, transmission et propagation spatiale)
- Visualisation graphique des données
- Interface responsive

## Accessibilité et couleurs

Les couleurs du projet ont été choisies pour garantir une bonne lisibilité, y compris pour les personnes atteintes de troubles de la vision :

- Contraste élevé entre le texte et le fond
- Utilisation de couleurs différenciées par la luminosité et la saturation, pas uniquement par la teinte
- Les graphiques utilisent des palettes adaptées aux daltoniens (bleu, orange, violet)
- Les éléments importants sont signalés par des couleurs vives et des icônes

## Installation

1. Cloner le dépôt :

   ```bash
   git clone https://github.com/azzedev/GIJFDHJ.git
   cd Front-end/mspr502-front
   ```

2. Installer les dépendances :

   ```bash
   npm install
   ```

3. Lancer l’application :

   ```bash
   npm run dev
   ```

## Structure du projet

- `src/components/` : comprend composants React
- `src/services/` : contien appels à l’API
- `src/assets/` : est utiliser pour les données statiques de test
