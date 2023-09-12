// node mongo.js yourpassword Anna 040-1234556
// Result: added Anna number 040-1234556 to phonebook
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit()
}

const password = process.argv[2]
const nombre = process.argv[3]
const numero = process.argv[4]
const MONGODB_IRI = `mongodb://lucas:${password}@127.0.0.1:27017/phonebook?authSource=admin`

mongoose.set('strictQuery', false)
mongoose.connect(MONGODB_IRI)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', phonebookSchema)

if (process.argv.length === 3) {
  Person.find({}).sort({ name: 1 })
    .then( results => {
      console.log('phonebook:')
      results.forEach( person => console.log(`${person.name} ${person.number}`))
      mongoose.connection.close()
    }) 
} else {

  if (!nombre) {
    console.log('REQUIRED: name')
    process.exit()
  }
  
  if (!numero) {
    console.log('REQUIRED: number')
    process.exit()
  }

  const entry = new Person({
    name: nombre,
    number: numero
  })
  
  entry.save()
    .then( result => {
      console.log(`added ${result.name} number ${result.number} to phonebook`)
      mongoose.connection.close()
    })
    .catch( error => {
      console.error(error)
      mongoose.connection.close()
    })
}

