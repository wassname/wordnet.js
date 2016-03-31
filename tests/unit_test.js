'use strict'

var chai = require('chai');
var chaiThings = require('chai-things');
chai.use(chaiThings)
var expect = chai.expect

var wn = require("../index")
var wordNetUnpack = require("../unpack")



describe('wordnetjs', function () {
    it('should unzip', function (done) {
        wordNetUnpack.load_or_unzip(function (data) {
            expect(data).to.have.keys(["noun", "adjective", "verb", "adverb"])
            expect(data).to.have.property('noun').with.length.above(80000)
            done()
        })
    });

    it('should lookup by id', function () {
        var res = wn.lookup('homosexual.adjective.01')
        res.forEach(function (r) {
            expect(r).to.have.property('syntactic_category').that.equals('Adjective')
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
            expect(res).to.have.length(1)
        });
        it('should find words', function (done) {
            var res = wn.words(function (words) {
                expect(res).to.have.length(148721)
                done()
            })
        });
        it('should get unique categories', function () {
            expect(wn.pos("warrant")).to.deep.equal(["Verb", "Noun"])
            expect(wn.pos("bitter")).to.include.members(["Adverb", "Noun", "Adjective", "Verb"])
        });
    })

    describe('null results', function () {
        // find samples words with populated properties
        var testWords = [
            wn.lookup("respectful.adjective.02")[0],
            wn.lookup("per annum.adverb.01")[0],
            wn.lookup("teaberry.noun.01")[0],
            wn.lookup("dip.verb.10")[0],
        ]
        testWords.forEach(function (obj) {
            var word = obj.words[0]
            describe('word=' + word, function () {
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
                    expect(wn.pos("warrant")).to.be.an('array').that.has.length(2)
                });

            })
        })

    })

})
