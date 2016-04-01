'use strict'
var path = require('path');
var fs = require('fs');

var chai = require('chai');
var chaiThings = require('chai-things');
chai.use(chaiThings) // expect that all things in array/obj are...

var WordNetJs = require("../index")

var expect = chai.expect
var assert = chai.assert
var should = chai.should()

var allPos = ["noun", "adjective", "verb", "adverb"]

describe('build', function () {
    this.slow(3000)

    it('should have api key', function () {
        var WordNetBuild = require("../build/build")
        expect(WordNetBuild).to.exist
    });

    allPos.forEach(function (pos) {
        describe('build.do_pos(' + pos + ')', function () {

            var data

            before((done) => {
                var max = 100
                var WordNetBuild = require("../build/build")
                WordNetBuild.do_pos(pos, function (output) {
                    data = output
                    done()
                }, max, './test/temp')
            });

            it('should return word data', function () {
                expect(data).to.be.an('array').with.length(100)
                expect(data[0]).to.have.keys(['id', 'lexname', 'syntactic_category', 'words', 'description'])
            });

            it('should output readable json', function () {
                var txtData = fs.readFileSync('./test/temp/'+pos + '.json')
                var jsonData = JSON.parse(txtData)
                expect(jsonData).to.have.length(100)
            });
        })
    })
})

// describe('wordnetjs.load', function () {
//     it('description', function () {
//         return new WordNetJs()
//             .load()
//             .then(wn => {
//                 expect(wn).to.have.property('data')
//             })
//     });
// })

describe('wordnetjs', function () {
    var wn


    before(function mockLoadData() {
        // mock the fetch loading
        wn = new WordNetJs()
        wn.data={
            noun: require('../data/noun.json'),
            verb: require('../data/verb.json'),
            adjective: require('../data/adjective.json'),
            adverb: require('../data/adverb.json'),
        }
    });

    it('should lookup by id', function () {
        var res = wn.lookup('homosexual.adjective.01')
        res.forEach(function (r) {
            expect(r).to.have.property('syntactic_category').that.equals('Adjective')
            expect(r).have.property('words').that.include('homosexual')
        })
    });

    var word = 'bitter'
    describe('word=' + word, function () {
        it('should lookup by word', function () {
            expect(wn.lookup(word)).to.have.length(12)
        });
        it('should find adjective', function () {
            var res = wn.adjective(word)
            expect(res).to.have.length(7)
            expect(res.map(w => w.syntactic_category)).to.all.equal('Adjective')
        });
        it('should find verb', function () {
            var res = wn.verb(word)
            expect(res).to.have.length(1)
            expect(res.map(w => w.syntactic_category)).to.all.equal('Verb')
        });
        it('should find noun', function () {
            var res = wn.noun(word)
            expect(res).to.have.length(3)
            expect(res.map(w => w.syntactic_category)).to.all.equal('Noun')
        });
        it('should find adverb', function () {
            var res = wn.adverb(word)
            expect(res).to.have.length(1)
            expect(res.map(w => w.syntactic_category)).to.all.equal('Adverb')
        });
        it('should find synonyms', function () {
            var res = wn.synonyms(word)
            expect(res).to.have.length(12)
        });
        it('should find antonyms', function () {
            var res = wn.antonyms(word)
            expect(res).to.have.length(0)
        });
        it('should find words', function (done) {
            wn.words(function (res) {
                expect(res).to.have.length(148721)
                done()
            })
        });
        it('should get unique categories', function () {
            expect(wn.pos(word)).to.include.members(["Adverb", "Noun", "Adjective"])
        });
    })

    describe('null results', function () {
        // find samples words with populated properties
        var testWords = [
            "respectful.adjective.02",
            "per annum.adverb.01",
            "teaberry.noun.01",
        ]
        testWords.forEach(function (w) {
            describe('word=' + w, function () {
                var word
                before(function lookUpWord() {
                    word = wn.lookup(w)[0].words[0]
                });
                it('should find adjective', function () {
                    var res = wn.adjective(word)
                    if (res)
                        expect(res.map(w => w.syntactic_category)).to.all.equal('Adjective')
                });
                it('should find verb', function () {
                    var res = wn.verb(word)
                    if (res)
                        expect(res.map(w => w.syntactic_category)).to.all.equal('Verb')
                });
                it('should find noun', function () {
                    var res = wn.noun(word)
                    if (res)
                        expect(res.map(w => w.syntactic_category)).to.all.equal('Noun')
                });
                it('should find adverb', function () {
                    var res = wn.adverb(word)
                    if (res)
                        expect(res.map(w => w.syntactic_category)).to.all.equal('Adverb')
                });

                it('should get two unique categories', function () {
                    expect(wn.pos(word)).to.be.an('array').that.has.length(1)
                });

            })
        })

    })

})
