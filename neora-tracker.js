/**
 * NEORA - Firebase Generation Tracker
 * 
 * Ce fichier permet de sauvegarder les générations d'images dans Firestore.
 * 
 * INSTALLATION:
 * 1. Ajoute ces scripts dans le <head> de tes fichiers NEORA.html, NEORAPRODUITS.html, NEORAPRO.html :
 *    
 *    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
 *    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
 *    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
 *    <script src="neora-tracker.js"></script>
 * 
 * 2. Appelle initNeoraTracker() au début de ton script
 * 
 * 3. Appelle saveGeneration() après chaque génération réussie
 * 
 * EXEMPLE D'UTILISATION:
 * 
 *    // Au début de ton script
 *    initNeoraTracker('NEORA'); // ou 'NEORAPRODUITS' ou 'NEORAPRO'
 *    
 *    // Après une génération réussie
 *    if (r.status === 'done' && r.image) {
 *      saveGeneration({
 *        imageUrl: r.image,
 *        prompt: prompt,
 *        aspectRatio: aspectRatio.value
 *      });
 *    }
 */

// Firebase config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCKPepYjXiY92hZPEdKxqOow9AACfMTOoc",
  authDomain: "neorastudiosnc.firebaseapp.com",
  projectId: "neorastudiosnc",
  storageBucket: "neorastudiosnc.firebasestorage.app",
  messagingSenderId: "275455765566",
  appId: "1:275455765566:web:c2cf516fcb8f13de7e356f",
  measurementId: "G-2HWXD3297V"
};

let neoraVersion = 'NEORA';
let neoraDb = null;
let neoraAuth = null;

/**
 * Initialise le tracker Neora
 * @param {string} version - La version de l'app ('NEORA', 'NEORAPRODUITS', 'NEORAPRO')
 */
function initNeoraTracker(version = 'NEORA') {
  neoraVersion = version;
  
  // Initialise Firebase si pas déjà fait
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  
  neoraAuth = firebase.auth();
  neoraDb = firebase.firestore();
  
  console.log(`[NEORA Tracker] Initialisé pour ${version}`);
}

/**
 * Sauvegarde une génération dans Firestore
 * @param {Object} data - Les données de la génération
 * @param {string} data.imageUrl - L'URL de l'image générée
 * @param {string} data.prompt - Le prompt utilisé
 * @param {string} data.aspectRatio - Le ratio d'aspect (optionnel)
 * @param {string} data.mode - Le mode utilisé (text-to-image, image-to-image) (optionnel)
 */
async function saveGeneration(data) {
  if (!neoraDb || !neoraAuth) {
    console.warn('[NEORA Tracker] Non initialisé. Appelle initNeoraTracker() d\'abord.');
    return null;
  }
  
  const user = neoraAuth.currentUser;
  if (!user) {
    console.warn('[NEORA Tracker] Aucun utilisateur connecté.');
    return null;
  }
  
  try {
    const generation = {
      userId: user.uid,
      userEmail: user.email,
      imageUrl: data.imageUrl,
      prompt: data.prompt || '',
      aspectRatio: data.aspectRatio || '16:9',
      mode: data.mode || 'text-to-image',
      version: neoraVersion,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await neoraDb.collection('generations').add(generation);
    
    // Met à jour le compteur de l'utilisateur
    await updateUserStats(user.uid);
    
    console.log(`[NEORA Tracker] Génération sauvegardée: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('[NEORA Tracker] Erreur:', error);
    return null;
  }
}

/**
 * Met à jour les statistiques de l'utilisateur
 * @param {string} userId - L'ID de l'utilisateur
 */
async function updateUserStats(userId) {
  try {
    const userRef = neoraDb.collection('users').doc(userId);
    await userRef.update({
      totalGenerations: firebase.firestore.FieldValue.increment(1),
      lastGenerationAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    // L'utilisateur n'existe peut-être pas encore, on l'ignore
    console.log('[NEORA Tracker] User stats non mis à jour (user doc inexistant)');
  }
}

/**
 * Récupère l'utilisateur courant
 * @returns {Object|null} L'utilisateur ou null
 */
function getCurrentUser() {
  return neoraAuth?.currentUser || null;
}

/**
 * Vérifie si l'utilisateur est connecté
 * @returns {boolean}
 */
function isUserLoggedIn() {
  return !!neoraAuth?.currentUser;
}

// Export pour utilisation en module (optionnel)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initNeoraTracker,
    saveGeneration,
    getCurrentUser,
    isUserLoggedIn
  };
}
