# Bibliothèque Microservices

## Architecture
- **livre-service** → port 3001
- **membre-service** → port 3002
- **emprunt-service** → port 3003
- **gateway** → port 3000 (point d'entrée unique — TP2)

---

## Lancement — TP1 (sans gateway)

Ouvrir **3 terminaux** :

```bash
# Terminal 1
cd livre-service && npm install && npm run dev

# Terminal 2
cd membre-service && npm install && npm run dev

# Terminal 3
cd emprunt-service && npm install && npm run dev
```

---

## Lancement — TP2 (avec gateway)

Ouvrir **4 terminaux** (les 3 mêmes + 1 nouveau) :

```bash
# Terminal 1
cd livre-service && npm run dev

# Terminal 2
cd membre-service && npm run dev

# Terminal 3
cd emprunt-service && npm run dev

# Terminal 4
cd gateway && npm install && node index.js
```

> Avec le gateway, toutes tes requêtes Postman passent par **port 3000** au lieu de 3001/3002/3003.

---

## Tests Postman

### Étape 1 — Ajouter des livres
```
POST http://localhost:3000/livres
Body: { "titre": "Clean Code", "auteur": "Robert Martin", "isbn": "978-0132350884" }

POST http://localhost:3000/livres
Body: { "titre": "The Pragmatic Programmer", "auteur": "Andrew Hunt", "isbn": "978-0135957059" }

GET http://localhost:3000/livres
```

### Étape 2 — Ajouter des membres
```
POST http://localhost:3000/membres
Body: { "nom": "Alice Dupont", "email": "alice@test.com" }

POST http://localhost:3000/membres
Body: { "nom": "Bob Martin", "email": "bob@test.com" }

GET http://localhost:3000/membres
```

### Étape 3 — Créer un emprunt
```
POST http://localhost:3000/emprunts
Body: { "idMembre": 1, "idLivre": 1 }

GET http://localhost:3000/livres/1  → disponible doit être false
```

### Étape 4 — Tester les règles métier
```
POST http://localhost:3000/emprunts
Body: { "idMembre": 2, "idLivre": 1 }
→ Réponse attendue : 400 Livre non disponible

GET http://localhost:3000/emprunts/en-cours
GET http://localhost:3000/emprunts/membre/1
```

### Étape 5 — Retourner un livre
```
PATCH http://localhost:3000/emprunts/1/retour

GET http://localhost:3000/livres/1  → disponible doit être true

POST http://localhost:3000/emprunts
Body: { "idMembre": 2, "idLivre": 1 }
→ Doit fonctionner cette fois
```

---

## Notes importantes

- MongoDB doit tourner sur `localhost:27017`
- Le TP1 et TP2 utilisent les **mêmes 3 microservices** — le TP2 ajoute juste le gateway par-dessus
- Le gateway corrige un bug présent dans le code du TP (gestion d'erreur pour POST/PATCH emprunts)
