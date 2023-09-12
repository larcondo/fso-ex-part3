require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

let phonebook = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  },
  { 
    "id": 5,
    "name": "John Miller", 
    "number": "39-22-1424178"
  }
]

app.use(express.json())
app.use(cors())

app.use(express.static('dist'))

morgan.token('body', function(req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then( persons => {
      res.status(200).json(persons)
    })
    .catch( error => {
      console.log(error)
      res.status(500).end()
    })
})

app.get('/api/persons/:id', (req, res) => {
  const { id } = req.params
  const person = phonebook.find( entry => entry.id === Number(id))

  person === undefined
  // ? res.status(404).send(`<h1>404</h1><p>Person not found</p>`)
  // ? res.status(404).send({ error: 'Person not found'})
    ? res.status(404).end()
    : res.status(200).json(person)
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.hasOwnProperty('name')) return res.status(400).send({ error: 'name is required'})
  if (body.name === null || body.name === '') return res.status(400).send({ error: 'name field cannot be empty'})

  if (!body.hasOwnProperty('number')) return res.status(400).send({ error: 'number is required'})
  if (body.number === null || body.number === '') return res.status(400).send({ error: 'number field cannot be empty'})

  const nameExists = phonebook.some( entry => entry.name === body.name )

  if (nameExists) return res.status(400).send({ error: 'name must be unique'})

  const newEntry = { 
    id: Math.floor(Math.random() * 10000), 
    name: body.name,
    number: body.number
  }

  phonebook = phonebook.concat(newEntry)
  res.status(200).send(newEntry)
})

app.delete('/api/persons/:id', (req, res) => {
  const { id } = req.params
  phonebook = phonebook.filter( person => person.id !== Number(id))

  res.status(204).end()
})

app.get('/info', (req, res) => {
  const reqDate = new Date()
  const htmlContent = `
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${reqDate}</p>
  `
  res.send(htmlContent)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})