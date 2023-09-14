require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const { errorHandler } = require('./utils/middleware')
const Person = require('./models/person')

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
  const { name, number } = req.body

  if (!name) return res.status(400).send({ error: 'name is required' })
  if (!number) return res.status(400).send({ error: 'number is required' })

  // const nameExists = phonebook.some( entry => entry.name === body.name )
  // if (nameExists) return res.status(400).send({ error: 'name must be unique'})

  const newEntry = new Person({
    name: name,
    number: number
  })

  newEntry.save()
    .then( savedEntry => {
      res.status(200).json(savedEntry)
    })
    .catch( error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  const { name, number } = req.body
  console.log(`ID: ${id}`)
  Person.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then( updated => {
      console.log(updated)
      res.status(200).json({ id, ...{ name, number } })
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  Person.findByIdAndRemove(id)
    .then( () => {
      res.status(204).end()
    })
    .catch( error => next(error))
})

app.get('/info', (req, res, next) => {
  const reqDate = new Date()
  Person.find({})
    .then( people => {
      const htmlContent = `
        <p>Phonebook has info for ${people.length} people</p>
        <p>${reqDate}</p>
      `
      res.status(200).send(htmlContent)
    })
    .catch( error => next(error))
})

// Middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})