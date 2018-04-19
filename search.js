const removeEmptyStrings = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((prop) => {
    if (obj[prop] !== '') { newObj[prop] = obj[prop]; }
  });
  return newObj;
};

const includesText = (text , bookField) => 
  bookField.toLowerCase().includes(text.toLowerCase())

const fieldMatches = {
  title: queryField => book => includesText(queryField, book.title),
  author: queryField => book => includesText(queryField, book.author),
  genre: queryField => book => includesText(queryField, book.genre),
  price: queryField => book => book.price < parseFloat(queryField)
}

const matchBook = 
  cleanQuery =>
    book => {
      
      queryFields = Object.entries(cleanQuery)

      const pred = queryFields.reduce((acc, [key, val]) => {
        const test = fieldMatches[key](val)(book)
        acc.push(test)
        return acc
      }, [])

      const identity = x => Boolean(x)
      return pred.every(identity)

    }


const search = (books, query) => {
  
  const cleanedQuery = removeEmptyStrings(query)
  const matchQuery = matchBook(cleanedQuery)

  return books.filter(book => matchQuery(book))

}

/*testing*/
const testBooks = [
  {
    title: "lol",
    author: "joe",
    genre: "fun",
    price: 5,
    publish_date: "2000-10-10",
    description: "something"
  },
  {
    title: "happy",
    author: "lisa",
    genre: "boring",
    price: 10,
    publish_date: "2000-10-10",
    description: "something"
  },
  {
    title: "Bad",
    author: "james",
    genre: "action",
    price: 7,
    publish_date: "2000-10-10",
    description: "something"
  }
]

const testQuery = {
  title: "bad",
  author: "",
  genre: "",
  price: ""
}
const filteredBooks = search(testBooks, testQuery)

console.log(filteredBooks)