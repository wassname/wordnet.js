"use strict"

var _ = require('lodash')

// polyfill
if (!this.Promise) require('es6-promise');
var self=this
var fetch
if (this.window && (!fetch)) fetch=require('fetch-polyfill');
else if (!fetch) fetch=require('node-fetch')


// import json files
var wordNetJS = module.exports = function () {}

/**
 * Fetch data from json, load to this.data and return promise
 * @param  {String} dataDir - Url of data directory
 * @param  {Functional} callback - alternative callback usage
 * @return {Promise}         - Promise of data in form {noun:[],verb:[],adjective:[],adverb:[]}
 */
wordNetJS.prototype.load = function (dataDir, callback) {
    if (this.data) return new new Promise(function(resolve, reject) {
        resolve(this.data)
    });

    var files = ['noun', 'averb', 'adjective', 'adverb']
    return Promise.all(
            files
            .map(s => s.charAt(0).toUpperCase() + s.slice(1)) // capatalize first letter
            .map(file => dataDir + '/' + file + '.json') // add path and ext
            .map(fetch) // fetch and return promise
        )
        .then(allData => {
            return allData
                .map(res => res.json()) // parse json
                // combine into object properties e.g. {noun:[],...}
                .reduce((prev, curr, i) => prev[files[i]] = curr.json(), {})
                .then((data) => {
                    if (callback) callback(data)
                    // assign to this and return
                    this.data=data
                    return this // for chaining
                })
        })
}

//some helper methods

/**
 * Search through only one word type
 * @param  {String}     - str word
 * @param  {Type} k     - type from (adjective|verb|noun|adverb)
 * @return {Array}
 */
wordNetJS.prototype.fast_search = function (str, k) {
    let founds = []
    let l = this.data[k].length;
    for (let i = 0; i < l; i++) {
        for (let o = 0; o < this.data[k][i].words.length; o++) {
            if (this.data[k][i].words[o] === str) {
                founds.push(this.data[k][i])
                break
            }
        }
    }
    return founds
}

wordNetJS.prototype.is_id = function (str) {
    return str.match(/[a-z]\.(adjective|verb|noun|adverb)\.[0-9]/i) !== null
}

/** Lookup by {String}id and {String}k from (adjective|verb|noun|adverb) **/
wordNetJS.prototype.id_lookup = function (id, k) {
    let l = this.data[k].length;
    for (let i = 0; i < l; i++) {
        if (this.data[k][i].id === id) {
            return [this.data[k][i]]
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
wordNetJS.prototype.lookup = function (str, k) {
    //given an id
    if (this.is_id(str)) {
        let type = str.match(/[a-z]\.(adjective|verb|noun|adverb)\.[0-9]/i)[1]
        return this.id_lookup(str, type)
    }
    //given a pos
    if (k) {
        if (str) {
            return this.fast_search(str, k)
        }
        return this.data[k]
    }
    //else, lookup in all types
    let types = ["adverb", "adjective", "verb", "noun"]
    let all = []
    for (let i = 0; i < types.length; i++) {
        all = all.concat(this.fast_search(str, types[i]))
    }
    return all
}




//begin API now

//main methods
wordNetJS.prototype.adverb = function (s) {
    return this.lookup(s, "adverb")
}
wordNetJS.prototype.adjective = function (s) {
    return this.lookup(s, "adjective")
}
wordNetJS.prototype.verb = function (s) {
    return this.lookup(s, "verb")
}
wordNetJS.prototype.noun = function (s) {
    return this.lookup(s, "noun")
}

wordNetJS.prototype.synonyms = function (s, k) {
    var self = this
    return this.lookup(s, k).map(function(syn) {
        let loose
        if (syn.syntactic_category == 'Adjective') {
            loose = syn.similar.map(function(id) {
                return self.lookup(id, k)[0].words
            })
        } else {
            loose = []
        }
        return {
            synset: syn.id,
            close: syn.words.filter(function (w) {
                return w !== s
            }),
            far: _.flatten(loose).filter(function (w) {
                return w !== s
            })
        }
    })
}

wordNetJS.prototype.antonyms = function (s, k) {
    var self = this
    let ants = this.lookup(s, 'adjective')
        .map(function (syn) {
            return syn.antonym
        })
        .filter(function (antonym) {
            return antonym !== undefined
        })
    ants = _.uniq(_.flatten(ants))
    let all = ants.map(function (id) {
        return self.lookup(id, k)[0]
    })
    return all
}

/**
 * Parts of speech categories
 * @param  {String} s - word
 * @return {Array}   - Array with members from ["Adverb", "Noun", "Adjective", "Verb"]
 */
wordNetJS.prototype.pos = function (s) {
    return _.uniq(this.lookup(s).map(function (syn) {
        return syn.syntactic_category
    }))
}

/** Returns all words from data as an array **/
wordNetJS.prototype.words = function (cb) {
    if (!this._words){
        let keys = Object.keys(this.data)
        let words = {}
        for (let i = 0; i < keys.length; i++) {
            for (let o = 0; o < this.data[keys[i]].length; o++) {
                for (let w = 0; w < this.data[keys[i]][o].words.length; w++) {
                    words[this.data[keys[i]][o].words[w]] = true
                }
            }
        }
        this._words=words
    }
    cb(Object.keys(this._words).sort())
}
