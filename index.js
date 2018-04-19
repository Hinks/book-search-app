const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const xml2js = require('xml2js')
const Rx = require('rxjs')
const bookSearch = require('./src/search.js')

const app = express()

const parser = new xml2js.Parser({
  explicitArray : false, 
  valueProcessors: [ xml2js.processors.parseNumbers ]
});


const subject$ = new Rx.AsyncSubject()

const readFile$ = Rx.Observable.bindNodeCallback(fs.readFile)
const fileSource$ = readFile$(__dirname + '/public/books.xml')

const parseXML$ = Rx.Observable.bindNodeCallback(parser.parseString)
const xmlSource$ = fileSource$.map(file => parseXML$(file))

// The parsed xml-file will be cached after it has been loaded and parsed in the subject.
// Subsequent subscribes will recieve the data immediately.
xmlSource$
  .concatAll()
  .subscribe(subject$)


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

  const bookId = req.params.id

  subject$.subscribe(
    parsedXML => {
        
      queryById = {id: bookId}
      const matchingBooks = bookSearch.searchByQuery(parsedXML.catalog.book, queryById)
      const theBook = matchingBooks[0]

      res.render('book', {book: theBook}, (err, html) => {
        (err) ? res.send("error") : res.send(html)
      })
    },
    err => console.log("error"))
  
})

app.get('/api/books', (req, res) => {
  const title = req.query.title

  subject$.subscribe(
    parsedXML => {

      const matchingBooks = bookSearch.searchByQuery(parsedXML.catalog.book, req.query)
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

