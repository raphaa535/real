/**
 * Real Madrid Roses - Script de prédiction avionique
 * Version optimisée pour Android
 */

// ===== CONSTANTES =====
const STORAGE_KEY = 'real_madrid_roses_historique';

// ===== ÉTAT DE L'APPLICATION =====
let historique = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ===== FONCTIONS DE GESTION DE L'HISTORIQUE =====

/**
 * Sauvegarde l'historique dans localStorage et met à jour l'affichage
 */
function sauvegarderHistorique() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historique));
    afficherHistorique();
}

/**
 * Ajoute un calcul à l'historique
 * @param {Object} entree - Les données du calcul
 */
function ajouterHistorique(entree) {
    historique.unshift({
        ...entree,
        id: Date.now()
    });
    
    // Limiter à 20 entrées pour les performances mobiles
    if (historique.length > 20) {
        historique = historique.slice(0, 20);
    }
    
    sauvegarderHistorique();
}

/**
 * Supprime une entrée de l'historique
 * @param {number} id - L'identifiant de l'entrée à supprimer
 */
function supprimerHistorique(id) {
    historique = historique.filter(entry => entry.id !== id);
    sauvegarderHistorique();
}

/**
 * Efface tout l'historique
 */
function clearHistory() {
    if (confirm('Effacer tout l\'historique ?')) {
        historique = [];
        sauvegarderHistorique();
    }
}

/**
 * Affiche l'historique dans le DOM
 */
function afficherHistorique() {
    const historyList = document.getElementById('historyList');
    
    if (!historyList) return;
    
    if (historique.length === 0) {
        historyList.innerHTML = '<div class="empty-history">Aucun calcul</div>';
        return;
    }
    
    historyList.innerHTML = historique.map(entry => `
        <div class="history-item" onclick="chargerDepuisHistorique(${entry.id})">
            <span class="history-result">${entry.resultat}</span>
            <div class="delete-history" onclick="event.stopPropagation(); supprimerHistorique(${entry.id})">
                <i class="fas fa-times-circle"></i>
            </div>
        </div>
    `).join('');
}

/**
 * Charge une entrée de l'historique dans le formulaire
 * @param {number} id - L'identifiant de l'entrée à charger
 */
function chargerDepuisHistorique(id) {
    const entry = historique.find(e => e.id === id);
    if (entry) {
        document.getElementById('heureDepart').value = entry.heureDepart;
        document.getElementById('champ1').value = entry.champ1;
        document.getElementById('champ2').value = entry.champ2;
        
        document.getElementById('heureFinale').textContent = entry.resultat;
        document.getElementById('roses-result').style.display = 'block';
    }
}

// ===== FONCTIONS DE VALIDATION =====

/**
 * Valide le format d'une valeur
 * @param {string} valeur - La valeur à valider
 * @param {string} type - Le type de format ('hex', 'dec', 'heure')
 * @returns {boolean} - True si le format est valide
 */
function validerFormat(valeur, type) {
    if (type === 'hex') {
        return /^[0-9A-Fa-f]{4}$/.test(valeur);
    } else if (type === 'dec') {
        return /^[0-9]{4}$/.test(valeur);
    } else if (type === 'heure') {
        return /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(valeur);
    }
    return false;
}

// ===== FONCTIONS DE CALCUL =====

/**
 * Extrait les chiffres des champs pour le calcul
 * @param {string} champ1 - Champ hexadécimal
 * @param {string} champ2 - Champ décimal
 * @returns {Object} - Les valeurs extraites
 */
function extraireChiffres(champ1, champ2) {
    return {
        hex1: parseInt(champ1[0], 10),
        dec4: parseInt(champ2[3], 10),
        hex34: parseInt(champ1.substring(2, 4), 10),
        dec12: parseInt(champ2.substring(0, 2), 10)
    };
}

/**
 * Calcule l'heure finale
 */
function calculerTemps() {
    // Récupération des valeurs
    const heureDepart = document.getElementById('heureDepart').value.trim();
    const champ1 = document.getElementById('champ1').value.trim().toUpperCase();
    const champ2 = document.getElementById('champ2').value.trim();
    
    // Validations
    if (!validerFormat(heureDepart, 'heure')) {
        alert('❌ Format heure invalide (HH:MM:SS)');
        return;
    }
    
    if (!validerFormat(champ1, 'hex')) {
        alert('❌ Champ 1: 4 caractères hexadécimaux (0-9, A-F)');
        return;
    }
    
    if (!validerFormat(champ2, 'dec')) {
        alert('❌ Champ 2: 4 chiffres décimaux (0-9)');
        return;
    }
    
    // Extraction des chiffres
    const c = extraireChiffres(champ1, champ2);
    
    // Calcul des différences
    const minutes = Math.abs(c.hex1 - c.dec4);
    const secondes = Math.abs(c.hex34 - c.dec12);
    
    // Traitement de l'heure
    let [heures, mins, secs] = heureDepart.split(':').map(Number);
    
    mins += minutes;
    secs += secondes;
    
    // Gestion des dépassements
    if (secs >= 60) {
        mins += Math.floor(secs / 60);
        secs = secs % 60;
    }
    
    if (mins >= 60) {
        heures += Math.floor(mins / 60);
        mins = mins % 60;
    }
    
    heures = heures % 24;
    
    // Formatage du résultat
    const resultat = `${heures.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    // Affichage
    document.getElementById('heureFinale').textContent = resultat;
    document.getElementById('roses-result').style.display = 'block';
    
    // Sauvegarde dans l'historique
    ajouterHistorique({ heureDepart, champ1, champ2, resultat });
}

/**
 * Réinitialise le formulaire
 */
function resetForm() {
    document.getElementById('heureDepart').value = '20:30:00';
    document.getElementById('champ1').value = '5363';
    document.getElementById('champ2').value = '3562';
    document.getElementById('roses-result').style.display = 'none';
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Récupération des éléments du DOM
    const calculateBtn = document.getElementById('roses-calculate');
    const resetBtn = document.getElementById('reset-btn');
    const clearHistoryBtn = document.getElementById('clear-history');
    const champ1Input = document.getElementById('champ1');
    const champ2Input = document.getElementById('champ2');
    const heureDepartInput = document.getElementById('heureDepart');
    
    // Attachement des événements
    if (calculateBtn) calculateBtn.addEventListener('click', calculerTemps);
    if (resetBtn) resetBtn.addEventListener('click', resetForm);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Validation des inputs
    if (champ1Input) {
        champ1Input.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().substring(0, 4);
        });
    }
    
    if (champ2Input) {
        champ2Input.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').substring(0, 4);
        });
    }
    
    if (heureDepartInput) {
        heureDepartInput.addEventListener('input', function(e) {
            let val = this.value.replace(/[^0-9:]/g, '');
            if (val.length === 2 && !val.includes(':')) val = val + ':';
            if (val.length === 5 && val.indexOf(':') === 2) val = val + ':';
            this.value = val.substring(0, 8);
        });
    }
    
    // Touche Entrée pour calculer
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculerTemps();
    });
    
    // Empêcher le zoom sur double-tap
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    
    // Affichage initial de l'historique
    afficherHistorique();
    
    // Rendre les fonctions globales pour les appels depuis l'HTML
    window.chargerDepuisHistorique = chargerDepuisHistorique;
    window.supprimerHistorique = supprimerHistorique;
});
