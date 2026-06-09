const express = require('express')
const { MongoClient } = require('mongodb')

const app = express()
app.use(express.json())

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const DB_NAME = 'bibliotheque_membres'

let db

async function connectDB() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  db = client.db(DB_NAME)
  console.log('Connecté à MongoDB - bibliotheque_membres')
}

// Fonction pour auto-incrementer l'id
async function getNextId() {
  const membres = db.collection('membres')
  const dernier = await membres.find().sort({ id: -1 }).limit(1).toArray()
  if (dernier.length === 0) return 1
  return dernier[0].id + 1
}

// GET /membres - tous les membres
app.get('/membres', async (req, res) => {
  try {
    const membres = await db.collection('membres').find().toArray()
    res.status(200).json(membres)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /membres/:id - un membre par id
app.get('/membres/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const membre = await db.collection('membres').findOne({ id: id })
    if (!membre) return res.status(404).json({ message: 'Membre non trouvé' })
    res.status(200).json(membre)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /membres - ajouter un membre
app.post('/membres', async (req, res) => {
  try {
    const { nom, email } = req.body

    // Vérifier si l'email existe déjà
    const emailExistant = await db.collection('membres').findOne({ email: email })
    if (emailExistant) return res.status(400).json({ message: 'Email déjà utilisé' })

    const id = await getNextId()
    const nouveauMembre = {
      id: id,
      nom: nom,
      email: email,
      actif: true
    }
    await db.collection('membres').insertOne(nouveauMembre)
    res.status(201).json(nouveauMembre)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /membres/:id - remplacer complètement un membre
app.put('/membres/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { nom, email, actif } = req.body
    const result = await db.collection('membres').findOneAndUpdate(
      { id: id },
      { $set: { nom, email, actif } },
      { returnDocument: 'after' }
    )
    if (!result) return res.status(404).json({ message: 'Membre non trouvé' })
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /membres/:id/statut - mettre à jour uniquement actif
app.patch('/membres/:id/statut', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { actif } = req.body
    const result = await db.collection('membres').findOneAndUpdate(
      { id: id },
      { $set: { actif: actif } },
      { returnDocument: 'after' }
    )
    if (!result) return res.status(404).json({ message: 'Membre non trouvé' })
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /membres/:id - supprimer un membre
app.delete('/membres/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const result = await db.collection('membres').findOneAndDelete({ id: id })
    if (!result) return res.status(404).json({ message: 'Membre non trouvé' })
    res.status(200).json({ message: 'Membre supprimé' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

connectDB().then(() => {
  app.listen(3002, () => {
    console.log('Membre service démarré sur le port 3002')
  })
}).catch(err => {
  console.error('Erreur connexion MongoDB :', err)
})
