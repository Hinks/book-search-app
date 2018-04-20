const fs = require('fs')
const xml2js = require('xml2js')
const Rx = require('rxjs')

const loadXML = parser => path => {
  
  return Rx.Observable.create(observer$ => {

    const subject$ = new Rx.AsyncSubject()

    const readFile$ = Rx.Observable.bindNodeCallback(fs.readFile)
    const fileSource$ = readFile$(path)

    const parseXML$ = Rx.Observable.bindNodeCallback(parser.parseString)
    const xmlSource$ = fileSource$.map(file => parseXML$(file))

    xmlSource$
      .concatAll()
      .subscribe(subject$)

    return subject$.subscribe(observer$)
  })

}

const parser = new xml2js.Parser({
  explicitArray : false, 
  valueProcessors: [ xml2js.processors.parseNumbers ]
});

module.exports = {
  loadBooks: loadXML(parser)
}