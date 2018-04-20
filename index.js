const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const bookSearch = require('./src/search.js')
const xmlToJsLoader = require('./src/xml-loader.js')

const app = express()

const books$ = xmlToJsLoader.loadBooks(__dirname + '/public/books.xml')

// View engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Body parser as middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// Static path
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/api/book/:id', (req, res) => {

  books$.subscribe(
    parsedBooks => {
        
      queryById = {id: req.params.id}
      const matchingBooks = bookSearch.searchByQuery(parsedBooks.catalog.book, queryById)
      const theBook = matchingBooks[0]

      res.render('book', {book: theBook}, (err, html) => {
        (err) ? res.send("error") : res.send(html)
      })
    },
    err => console.log("error"))
  
})

app.get('/api/books', (req, res) => {

  books$.subscribe(
    parsedBooks => {

      const matchingBooks = bookSearch.searchByQuery(parsedBooks.catalog.book, req.query)
      const matchingTitles = matchingBooks.map(book => {
        return {
          title: book.title, 
          link: `/api/book/${book["$"]["id"]}`
        }
      })

        res.render('search-result', {books: matchingTitles})
    },
    err => console.log("error"))
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

