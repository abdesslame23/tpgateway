const express = require('express')
const { MongoClient } = require('mongodb')
const axios = require('axios')

const app = express()
app.use(express.json())

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const DB_NAME = 'bibliotheque_emprunts'

const LIVRE_SERVICE = process.env.LIVRE_SERVICE || 'http://localhost:3001'
const MEMBRE_SERVICE = process.env.MEMBRE_SERVICE || 'http://localhost:3002'

let db

async function connectDB() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  db = client.db(DB_NAME)
  console.log('Connecté à MongoDB - bibliotheque_emprunts')
}

async function getNextId() {
  const emprunts = db.collection('emprunts')
  const dernier = await emprunts.find().sort({ id: -1 }).limit(1).toArray()
  if (dernier.length === 0) return 1
  return dernier[0].id + 1
}

app.get('/emprunts', async (req, res) => {
  try {
    const emprunts = await db.collection('emprunts').find().toArray()
    res.status(200).json(emprunts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/emprunts/en-cours', async (req, res) => {
  try {
    const emprunts = await db.collection('emprunts').find({ retourne: false }).toArray()
    res.status(200).json(emprunts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/emprunts/membre/:idMembre', async (req, res) => {
  try {
    const idMembre = parseInt(req.params.idMembre)
    const emprunts = await db.collection('emprunts').find({ idMembre: idMembre }).toArray()
    res.status(200).json(emprunts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/emprunts', async (req, res) => {
  try {
    const { idMembre, idLivre } = req.body

    let membre
    try {
      const resMembre = await axios.get(`${MEMBRE_SERVICE}/membres/${idMembre}`)
      membre = resMembre.data
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ message: 'Membre non trouvé' })
      }
      return res.status(500).json({ message: 'Erreur lors de la vérification du membre' })
    }

    if (!membre.actif) {
      return res.status(400).json({ message: 'Membre inactif' })
    }

    let livre
    try {
      const resLivre = await axios.get(`${LIVRE_SERVICE}/livres/${idLivre}`)
      livre = resLivre.data
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ message: 'Livre non trouvé' })
      }
      return res.status(500).json({ message: 'Erreur lors de la vérification du livre' })
    }

    if (!livre.disponible) {
      return res.status(400).json({ message: 'Livre non disponible' })
    }

    const id = await getNextId()
    const nouvelEmprunt = {
      id: id,
      idMembre: idMembre,
      idLivre: idLivre,
      nomMembre: membre.nom,
      titreLivre: livre.titre,
      dateEmprunt: new Date().toISOString(),
      dateRetour: null,
      retourne: false
    }
    await db.collection('emprunts').insertOne(nouvelEmprunt)

    await axios.patch(`${LIVRE_SERVICE}/livres/${idLivre}/disponibilite`, { disponible: false })

    res.status(201).json(nouvelEmprunt)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.patch('/emprunts/:id/retour', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const emprunt = await db.collection('emprunts').findOne({ id: id })
    if (!emprunt) return res.status(404).json({ message: 'Emprunt non trouvé' })

    if (emprunt.retourne === true) {
      return res.status(400).json({ message: 'Ce livre a déjà été retourné' })
    }

    const result = await db.collection('emprunts').findOneAndUpdate(
      { id: id },
      { $set: { retourne: true, dateRetour: new Date().toISOString() } },
      { returnDocument: 'after' }
    )

    await axios.patch(`${LIVRE_SERVICE}/livres/${emprunt.idLivre}/disponibilite`, { disponible: true })

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.delete('/emprunts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const result = await db.collection('emprunts').findOneAndDelete({ id: id })
    if (!result) return res.status(404).json({ message: 'Emprunt non trouvé' })
    res.status(200).json({ message: 'Emprunt supprimé' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

connectDB().then(() => {
  app.listen(3003, () => {
    console.log('Emprunt service démarré sur le port 3003')
  })
}).catch(err => {
  console.error('Erreur connexion MongoDB :', err)
})
