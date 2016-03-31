"use strict"

let helpers = require("./helpers")
let lodash = require("lodash")

let data ={
  noun: require("./data/Noun").data,
  adjective: require("./data/Adjective").data,
  verb: require("./data/Verb").data,
  adverb: require("./data/Adverb").data,
}



//some helper methods

/**
 * Search through only one word type
 * @param  {String}     - str word
 * @param  {Type} k     - type from (adjective|verb|noun|adverb)
 * @return {Array}
 */
let fast_search = function (str, k) {
    let founds = []
    let l = data[k].length;
    for (let i = 0; i < l; i++) {
        for (let o = 0; o < data[k][i].words.length; o++) {
            if (data[k][i].words[o] === str) {
                founds.push(data[k][i])
                break
            }
        }
    }
    return founds
}

let is_id = function (str) {
    return str.match(/[a-z]\.(adjective|verb|noun|adverb)\.[0-9]/i) !== null
}

/** Lookup by {String}id and {String}k from (adjective|verb|noun|adverb) **/
let id_lookup = function (id, k) {
    let l = data[k].length;
    for (let i = 0; i < l; i++) {
        if (data[k][i].id === id) {
            return [data[k][i]]
        }
    }
    return null
}

/**
 * Lookup data for a word
 * @param  {String} str - word
 * @param  {String} k   - type from (adjective|verb|noun|adverb)
 * @return {Array}      - Objects for each result containing id, description etc
 */
let lookup = function (str, k) {
    //given an id
    if (is_id(str)) {
        let type = str.match(/[a-z]\.(adjective|verb|noun|adverb)\.[0-9]/i)[1]
        return id_lookup(str, type)
    }
    //given a pos
    if (k) {
        if (str) {
            return fast_search(str, k)
        }
        return data[k]
    }
    //else, lookup in all types
    let types = ["adverb", "adjective", "verb", "noun"]
    let all = []
    for (let i = 0; i < types.length; i++) {
        all = all.concat(fast_search(str, types[i]))
    }
    return all
}

//
//begin API now
exports.lookup = lookup
exports.data = data

//main methods
exports.adverb = function (s) {
    return lookup(s, "adverb")
}
exports.adjective = function (s) {
    return lookup(s, "adjective")
}
exports.verb = function (s) {
    return lookup(s, "verb")
}
exports.noun = function (s) {
    return lookup(s, "noun")
}

exports.synonyms = function (s, k) {
    return lookup(s, k).map(function (syn) {
        let loose
        if (syn.syntactic_category=='Adjective'){
            loose = syn.similar.map(function (id) {
                return lookup(id, k)[0].words
            })
        } else {
            loose = []
        }
        return {
            synset: syn.id,
            close: syn.words.filter(function (w) {
                return w !== s
            }),
            far: helpers.flatten(loose).filter(function (w) {
                return w !== s
            })
        }
    })
}

exports.antonyms = function (s, k) {
    let ants = lookup(s, 'adjective').map(function (syn) {
        return syn.antonym
    })
    ants = helpers.unique(helpers.flatten(ants))
    let all = ants.map(function (id) {
        return lookup(id, k)[0]
    })
    return all
}

/** Returns unique categories from ["Adverb", "Noun", "Adjective", "Verb"] **/
exports.pos = function (s) {
    return helpers.unique(lookup(s).map(function (syn) {
        return syn.syntactic_category
    }))
}

/** Returns all words in an array **/
exports.words = function (cb) {
    let keys = Object.keys(data)
    let words = {}
    for (let i = 0; i < keys.length; i++) {
        for (let o = 0; o < data[keys[i]].length; o++) {
            for (let w = 0; w < data[keys[i]][o].words.length; w++) {
                words[data[keys[i]][o].words[w]] = true
            }
        }
    }
    cb(Object.keys(words).sort())
}

// console.log(exports.pos("perverse"))
// console.log(exports.antonyms("perverse"))
// console.log(exports.synonyms("perverse"))
// exports.words((arr)=>{
//   console.log(arr.filter((s)=> s.match(/cool/)))
// })
// exports.words((arr)=>{console.log(arr.slice(110,113))})
