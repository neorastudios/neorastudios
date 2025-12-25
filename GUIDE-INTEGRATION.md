# Guide d'intégration - NEORA Tracker

## Fichiers créés

1. **profil.html** - Page de profil utilisateur
2. **historique.html** - Page d'historique des générations
3. **neora-tracker.js** - Script pour sauvegarder les générations

## Structure des fichiers sur GitHub

```
📁 ton-repo/
├── index.html          ← Landing page + sélecteur
├── profil.html         ← Page profil (NOUVEAU)
├── historique.html     ← Page historique (NOUVEAU)
├── neora-tracker.js    ← Script tracker (NOUVEAU)
├── logo.jpg
├── NEORA.html
├── NEORAPRODUITS.html
└── NEORAPRO.html
```

---

## Intégration dans tes 3 apps

### Étape 1 : Ajouter les scripts Firebase

Dans chaque fichier (NEORA.html, NEORAPRODUITS.html, NEORAPRO.html), ajoute ces lignes dans le `<head>` :

```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="neora-tracker.js"></script>
```

### Étape 2 : Initialiser le tracker

Au début de ton `<script>`, ajoute :

```javascript
// Pour NEORA.html
initNeoraTracker('NEORA');

// Pour NEORAPRODUITS.html
initNeoraTracker('NEORAPRODUITS');

// Pour NEORAPRO.html
initNeoraTracker('NEORAPRO');
```

### Étape 3 : Sauvegarder les générations

Trouve l'endroit où la génération est réussie (généralement après `if(r.status === "done" && r.image)`), et ajoute :

```javascript
if(r.status === "done" && r.image){
  // ... ton code existant ...
  
  // AJOUTE CECI pour sauvegarder dans l'historique
  saveGeneration({
    imageUrl: r.image,
    prompt: prompt,           // le prompt utilisé
    aspectRatio: aspectRatio, // le ratio choisi
    mode: 'text-to-image'     // ou 'image-to-image' si une image était uploadée
  });
}
```

---

## Exemple complet pour NEORA.html

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>NEORA</title>
  
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
  <script src="neora-tracker.js"></script>
  
  <!-- ... ton CSS ... -->
</head>
<body>
  <!-- ... ton HTML ... -->
  
  <script>
    // Initialise le tracker au début
    initNeoraTracker('NEORA');
    
    // ... ton code existant ...
    
    // Dans ta fonction de génération, après le succès :
    if(r.status === "done" && r.image){
      setOverlay(false);
      setStatus("Done ✅");
      showImage(r.image, { final: true });
      
      // Sauvegarde dans l'historique
      saveGeneration({
        imageUrl: r.image,
        prompt: promptEl.value,
        aspectRatio: aspectEl.value,
        mode: image_url ? 'image-to-image' : 'text-to-image'
      });
    }
  </script>
</body>
</html>
```

---

## Configuration Firestore (règles de sécurité)

Va dans Firebase Console → Firestore → Rules et remplace par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Generations collection
    match /generations/{generationId} {
      allow read, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

Clique sur **Publish** pour sauvegarder.

---

## Configuration Firebase Storage (pour les avatars)

Va dans Firebase Console → Storage → Rules et remplace par :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Clique sur **Publish** pour sauvegarder.

---

## Test

1. Connecte-toi sur ton site
2. Génère une image avec une des apps
3. Va sur `historique.html` → tu devrais voir ton image !
4. Va sur `profil.html` → tu devrais voir tes stats !

---

## Besoin d'aide ?

Si tu as des questions ou des problèmes, n'hésite pas ! 🚀
