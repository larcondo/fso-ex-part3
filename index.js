require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const { errorHandler } = require('./utils/middleware')
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

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then( persons => {
      res.status(200).json(persons)
    })
    .catch( error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  Person.findById(id)
    .then( person => {
      if (person) {
        res.status(200).json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch( error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.hasOwnProperty('name')) return res.status(400).send({ error: 'name is required'})
  if (body.name === null || body.name === '') return res.status(400).send({ error: 'name field cannot be empty'})

  if (!body.hasOwnProperty('number')) return res.status(400).send({ error: 'number is required'})
  if (body.number === null || body.number === '') return res.status(400).send({ error: 'number field cannot be empty'})

  // const nameExists = phonebook.some( entry => entry.name === body.name )
  // if (nameExists) return res.status(400).send({ error: 'name must be unique'})

  const newEntry = new Person({ 
    name: body.name,
    number: body.number
  })

  newEntry.save()
    .then( savedEntry => {
      res.status(200).json(savedEntry)
    })
    .catch( error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  Person.findByIdAndRemove(id)
    .then( result => {
      res.status(204).end()
    })
    .catch( error => next(error))
})

app.get('/info', (req, res) => {
  const reqDate = new Date()
  const htmlContent = `
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${reqDate}</p>
  `
  res.send(htmlContent)
})

// Middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})