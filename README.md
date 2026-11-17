# bbr-web-front

Front du service de remédiation BBR — **vanilla HTML/CSS/JS, zéro build**.
Dropzone multi-PDF (clic + clavier + glisser-déposer), polling 3 s, badges
de statut (ambre en cours, orange Réussi, noir erreurs, zéro rouge),
téléchargement du `-AA`, bandeau santé (version moteur).

Déploiement : les fichiers de ce dossier sont servis par le backend
(`FRONT_DIST`, same-origin, zéro CORS). Aucune étape de build ; copier le
contenu du dossier tel quel.
