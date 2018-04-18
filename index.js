const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const xml2js = require('xml2js')

const app = express()

//View engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//body parser as middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

//static path
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/api/book/:id', (req, res) => {
  const bookId = req.params.id
  const book = BOOKS.filter(book => book["$"]["id"] === bookId)
  console.log(` the founded book: ${JSON.stringify(book[0])}`)

  res.render('book', {book: book[0]})
})

app.get('/api/books', (req, res) => {
  const title = req.query.title
  const filteredTitles = BOOKS
    .filter(book => book.title.includes(title))
    .map(book => {
      return {
        title: book.title, 
        link: `/api/book/${book["$"]["id"]}`
      }
    })

  res.render('search-result', {books: filteredTitles})
})

fs.readFile(__dirname + '/public/books.xml', (err, data) => {

  const parserOptions = {
    explicitArray : false, 
    valueProcessors: [ xml2js.processors.parseNumbers ]
  }
  const parser = new xml2js.Parser(parserOptions);
  
  parser.parseString(data, (err, result) => {
      BOOKS = result.catalog.book
      app.listen(3000, () => console.log('Example app listening on port 3000!'))
  });
});

