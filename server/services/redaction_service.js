const nlp = require('compromise');

// testing as a script first
// original text, need edge cases of weird spellings are weird names
let text = 'Jocelynne was on her phone during class again and kept bothering Sarah'
// this pass just finds obvious people, this gets Sarah but misses Jocelynne
let names = nlp(text).people()
// need some heuristic methods to catch stragglers
let potentialNames = doc.match('#TitleCase')
                          .not('#Beginning') // Ignore start of sentence
                          .not('#Date')      // Ignore "January"
                          .not('#Place')     // Ignore "Utah"
                          .not(people);      // Don't double count
// front end will need a final human failsafe
// must be fast and frictionless or this whole thing is pointless
// put found names in array
printList = function(doc) {
    return doc.out('array');
}
const name_array = printList(names)

// very basic name replacement
// need consistent aliasing in real life
const redacted_text = text.replace(name_array[0],'(Name 1)')


console.log(name_array[0])

console.log(redacted_text)