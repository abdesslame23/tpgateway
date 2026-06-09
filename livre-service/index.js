const express = require('express')
const { MongoClient } = require('mongodb')

const app = express()
app.use(express.json())

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const DB_NAME = 'bibliotheque_livres'

let db

async function connectDB() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  db = client.db(DB_NAME)
  console.log('Connecté à MongoDB - bibliotheque_livres')
}

// Fonction pour auto-incrementer l'id
async function getNextId() {
  const livres = db.collection('livres')
  const dernier = await livres.find().sort({ id: -1 }).limit(1).toArray()
  if (dernier.length === 0) return 1
  return dernier[0].id + 1
}

// GET /livres - tous les livres
app.get('/livres', async (req, res) => {
  try {
    const livres = await db.collection('livres').find().toArray()
    res.status(200).json(livres)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /livres/disponibles - livres disponibles
// IMPORTANT : cette route doit être AVANT /livres/:id sinon "disponibles" sera capturé comme un id
app.get('/livres/disponibles', async (req, res) => {
  try {
    const livres = await db.collection('livres').find({ disponible: true }).toArray()
    res.status(200).json(livres)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /livres/:id - un livre par id
app.get('/livres/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const livre = await db.collection('livres').findOne({ id: id })
    if (!livre) return res.status(404).json({ message: 'Livre non trouvé' })
    res.status(200).json(livre)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /livres - ajouter un livre
app.post('/livres', async (req, res) => {
  try {
    const { titre, auteur, isbn } = req.body
    const id = await getNextId()
    const nouveauLivre = {
      id: id,
      titre: titre,
      auteur: auteur,
      isbn: isbn,
      disponible: true
    }
    await db.collection('livres').insertOne(nouveauLivre)
    res.status(201).json(nouveauLivre)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /livres/:id - remplacer complètement un livre
app.put('/livres/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { titre, auteur, isbn, disponible } = req.body
    const result = await db.collection('livres').findOneAndUpdate(
      { id: id },
      { $set: { titre, auteur, isbn, disponible } },
      { returnDocument: 'after' }
    )
    if (!result) return res.status(404).json({ message: 'Livre non trouvé' })
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /livres/:id/disponibilite - mettre à jour uniquement disponible
app.patch('/livres/:id/disponibilite', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { disponible } = req.body
    const result = await db.collection('livres').findOneAndUpdate(
      { id: id },
      { $set: { disponible: disponible } },
      { returnDocument: 'after' }
    )
    if (!result) return res.status(404).json({ message: 'Livre non trouvé' })
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /livres/:id - supprimer un livre
app.delete('/livres/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const result = await db.collection('livres').findOneAndDelete({ id: id })
    if (!result) return res.status(404).json({ message: 'Livre non trouvé' })
    res.status(200).json({ message: 'Livre supprimé' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

connectDB().then(() => {
  app.listen(3001, () => {
    console.log('Livre service démarré sur le port 3001')
  })
}).catch(err => {
  console.error('Erreur connexion MongoDB :', err)
})
