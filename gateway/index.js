const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json())

const LIVRE_SERVICE = process.env.LIVRE_SERVICE || 'http://localhost:3001'
const MEMBRE_SERVICE = process.env.MEMBRE_SERVICE || 'http://localhost:3002'
const EMPRUNT_SERVICE = process.env.EMPRUNT_SERVICE || 'http://localhost:3003'

app.get('/livres', async (req, res) => {
  try {
    const r = await axios.get(`${LIVRE_SERVICE}/livres`)
    res.status(200).json(r.data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/livres/disponibles', async (req, res) => {
  try {
    const r = await axios.get(`${LIVRE_SERVICE}/livres/disponibles`)
    res.status(200).json(r.data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/livres/:id', async (req, res) => {
  try {
    const r = await axios.get(`${LIVRE_SERVICE}/livres/${req.params.id}`)
    res.status(200).json(r.data)
  } catch (err) {
    if (err.response && err.response.status === 404) return res.status(404).json({ message: 'Livre non trouvé' })
    res.status(500).json({ message: err.message })
  }
})

app.post('/livres', async (req, res) => {
  try {
    const r = await axios.post(`${LIVRE_SERVICE}/livres`, req.body)
    res.status(201).json(r.data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.put('/livres/:id', async (req, res) => {
  try {
    const r = await axios.put(`${LIVRE_SERVICE}/livres/${req.params.id}`, req.body)
    res.status(200).json(r.data)
  } catch (err) {
    if (err.response && err.response.status === 404) return res.status(404).json({ message: 'Livre non trouvé' })
    res.status(500).json({ message: err.message })
  }
})

app.delete('/livres/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${LIVRE_SERVICE}/livres/${req.params.id}`)
    res.status(200).json(r.data)
  } catch (err) {
    if (err.response && err.response.status === 404) return res.status(404).json({ message: 'Livre non trouvé' })
    res.status(500).json({ message: err.message })
  }
})

app.get('/membres', async (req, res) => {
  try {
    const r = await axios.get(`${MEMBRE_SERVICE}/membres`)
    res.status(200).json(r.data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/membres/:id', async (req, res) => {
  try {
    const r = await axios.get(`${MEMBRE_SERVICE}/membres/${req.params.id}`)
    res.status(200).json(r.data)
  } catch (err) {
    if (err.response && err.response.status === 404) return res.status(404).json({ message: 'Membre non trouvé' })
    res.status(500).json({ message: err.message })
  }
})

app.post('/membres', async (req, res) => {
  try {
    const r = await axios.post(`${MEMBRE_SERVICE}/membres`, req.body)
    res.status(201).json(r.data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.put('/membres/:id', async (req, res) => {
  try {
    const r = await axios.put(`${MEMBRE_SERVICE}/membres/${req.params.id}`, req.body)
    res.status(200).json(r.data)
  } catch (err) {
    if (err.response && err.response.status === 404) return res.status(404).json({ message: 'Membre non trouvé' })
    res.status(500).json({ message: err.message })
  }
})

app.delete('/membres/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${MEMBRE_SERVICE}/membres/${req.params.id}`)
    res.status(200).json(r.data)
  } catch (err) {
    if (err.response && err.response.status === 404) return res.status(404).json({ message: 'Membre non trouvé' })
    res.status(500).json({ message: err.message })
  }
})

app.get('/emprunts', async (req, res) => {
  try {
    const r = await axios.get(`${EMPRUNT_SERVICE}/emprunts`)
    res.status(200).json(r.data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/emprunts/en-cours', async (req, res) => {
  try {
    const r = await axios.get(`${EMPRUNT_SERVICE}/emprunts/en-cours`)
    res.status(200).json(r.data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/emprunts/membre/:id', async (req, res) => {
  try {
    const r = await axios.get(`${EMPRUNT_SERVICE}/emprunts/membre/${req.params.id}`)
    res.status(200).json(r.data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/emprunts', async (req, res) => {
  try {
    const r = await axios.post(`${EMPRUNT_SERVICE}/emprunts`, req.body)
    res.status(201).json(r.data)
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data)
    res.status(500).json({ message: err.message })
  }
})

app.patch('/emprunts/:id/retour', async (req, res) => {
  try {
    const r = await axios.patch(`${EMPRUNT_SERVICE}/emprunts/${req.params.id}/retour`)
    res.status(200).json(r.data)
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data)
    res.status(500).json({ message: err.message })
  }
})

app.delete('/emprunts/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${EMPRUNT_SERVICE}/emprunts/${req.params.id}`)
    res.status(200).json(r.data)
  } catch (err) {
    if (err.response && err.response.status === 404) return res.status(404).json({ message: 'Emprunt non trouvé' })
    res.status(500).json({ message: err.message })
  }
})

app.listen(3000, () => console.log('Gateway démarré sur le port 3000'))
