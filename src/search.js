const removeEmptyStrings = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((prop) => {
    if (obj[prop] !== '') { newObj[prop] = obj[prop]; }
  });
  return newObj;
};

const includesText = (text , bookField) => 
  bookField.toLowerCase().includes(text.toLowerCase())

const matchingRules = {
  id:     inputID     => book => book["$"]["id"] === inputID,
  title:  inputTitle  => book => includesText(inputTitle, book.title),
  author: inputAuthor => book => includesText(inputAuthor, book.author),
  genre:  inputGenre  => book => includesText(inputGenre, book.genre),
  price:  inputPrice  => book => book.price < parseFloat(inputPrice)
}

const bookIsMatchingQuery = (query, rules) => book => {
      
  const queryFields = Object.entries(query)

  const predicateList = queryFields.reduce((acc, [key, val]) => {
    const test = rules[key](val)(book)
    acc.push(test)
    return acc
  }, [])

  return predicateList.every(x => Boolean(x))
}


const searchByQuery = rules => (books, query) => {
  
  const preparedQuery = removeEmptyStrings(query)
  const matchQuery = bookIsMatchingQuery(preparedQuery, rules)

  return books.filter(book => matchQuery(book))
}

module.exports = {
  searchByQuery: searchByQuery(matchingRules)
}
