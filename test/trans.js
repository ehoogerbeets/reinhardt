var fs = require("fs");
var assert = require("assert");
var {Context} = require('../lib/context');
var {Environment} = require('../lib/environment');
var {Template} = require("../lib/template");
var {TemplateSyntaxError} = require('../lib/errors');

var mockResourceStrings = {
	"de-DE": {
		"{{page.name}} - Base": "{{page.name}} - Basis",
		"Source string.": "Ausgangssatz.",
		"This is a trans tag with a source string and a translators comment": "Dies ist eine trans-Tag mit einem Ausgangssatz und einem Übersetzer Kommentar",
		"unique_key": "Dies ist eine trans-Tag mit einem eindeutigen Schlüssel",
		"unique_key_2": "Dies ist eine trans-Tag mit einem eindeutigen Schlüssel und Kommentar",
		"This is a trans tag with a {{ variable }} thrown into the middle of it.": "Dies ist eine trans-Tag mit einem {{variable}} in die Mitte davon gesetzt.",
		" This is text inside of a block trans tag. It is very long and treacherous and it spans multiple lines in the source. ": " Dies ist Text innerhalb eines trans-Blocks. Es ist sehr lang und tückisch und es spannt mehrere Zeilen in der Quelle über. ",
		" This is the second block trans with multiple lines in the source and a renamed variable in it. Here is the page name: {{ foo }} ": " Dies ist der zweite trans-Block mit mehreren Linien in der Quelle und einem umbenannten Variable darin. Hier ist der Name der Seite: {{foo}} ",
		" This is the third block trans with multiple lines in the source and a renamed variable in it and a translator's comment which should not appear here in the output. Here is the page name: {{ foo }} ": " Dies ist der dritte trans-Block mit mehreren Zeilen in der Quelle und eine umbenannte Variable drin und Kommentar des Übersetzers, die in der Ausgabe nicht hier erscheinen soll. Hier ist der Name der Seite: {{foo}} ",
		" This is the fourth block trans with multiple lines in the source and a translator's comment which should not appear here in the output. ": " Dies ist der vierte trans-Block mit mehreren Zeilen in der Quelle und dem Kommentar des Übersetzers, die in der Ausgabe nicht erscheinen soll. ",
		"unique_key_block": " Dies ist eine blocktrans Block mit einem eindeutigen Schlüssel. "
	}	
};

var MockResources = function(locale) {
	this.rb = mockResourceStrings[locale] || {};
};
MockResources.prototype.translate = function(source, key) {
	var realkey = key || source;
	return this.rb[realkey] || source;
};

var FsLoader = require('../lib/loaders/filesystem').Loader;
var fsLoader = new FsLoader(module.resolve('./templatedir/trans/templates'));
var env = new Environment({
	loader: fsLoader,
	i18n: {
		resBundleFactory: function(locale) {
    		if (!this.cache) {
    			this.cache = {};
    		}
    		if (!this.cache[locale]) {
    			this.cache[locale] = new MockResources(locale);
    		}
    		// resources are immutable, so we don't have to worry about sharing them 
    		// amongst sessions and threads
    		return this.cache[locale];
    	}
	}
});

var c = {
   page: {
      name: "Test page"
   },
   variable: "Interpolated Variable",
   // The locale may be different for each request, but in this 
   // test, we'll just stick to German all the time.
   locale: "de-DE",
   rb: new MockResources("de-DE")
};

exports.testBlockTrans = function() {
   var expected = fs.read('./templatedir/trans/expected/page1.html');
   assert.equal(env.getTemplate('page1.html').render(c), expected);
};

exports.testBlockTransWithVariableSubstitution = function() {
   var expected = fs.read('./templatedir/trans/expected/page2.html');
   assert.equal(env.getTemplate('page2.html').render(c), expected);
};

exports.testBlockTransWithVariableSubstitutionAndTranslatorsComment = function() {
   var expected = fs.read('./templatedir/trans/expected/page3.html');
   assert.equal(env.getTemplate('page3.html').render(c), expected);
};

exports.testBlockTransWithTranslatorsComment = function() {
   var expected = fs.read('./templatedir/trans/expected/page4.html');
   assert.equal(env.getTemplate('page4.html').render(c), expected);
};

exports.testTransWithTranslationSavedInTheContext = function() {
   var expected = fs.read('./templatedir/trans/expected/page5.html');
   assert.equal(env.getTemplate('page5.html').render(c), expected);
};

exports.testTransWithTranslatorsComment = function() {
   var expected = fs.read('./templatedir/trans/expected/page6.html');
   assert.equal(env.getTemplate('page6.html').render(c), expected);
};

exports.testTransWithUniqueKey = function() {
   var expected = fs.read('./templatedir/trans/expected/page7.html');
   assert.equal(env.getTemplate('page7.html').render(c), expected);
};

exports.testBlockTransWithUniqueKey = function() {
   var expected = fs.read('./templatedir/trans/expected/page8.html');
   assert.equal(env.getTemplate('page8.html').render(c), expected);
};

exports.testTransWithUniqueKeyAndTranslatorsComment = function() {
   var expected = fs.read('./templatedir/trans/expected/page9.html');
   assert.equal(env.getTemplate('page9.html').render(c), expected);
};

exports.testTransWithVariable = function() {
   var expected = fs.read('./templatedir/trans/expected/page10.html');
   assert.equal(env.getTemplate('page10.html').render(c), expected);
};

exports.testTransMissingQuotes = function() {
   assert.throws(function () { env.getTemplate('page11.html').render(c) }, TemplateSyntaxError);
};

exports.testTransMismatchedQuotes = function() {
   assert.throws(function () { env.getTemplate('page12.html').render(c) }, TemplateSyntaxError);
};

exports.testTransMissingKey = function() {
   assert.throws(function () { env.getTemplate('page13.html').render(c) }, TemplateSyntaxError);
};

exports.testTransMissingComment = function() {
   assert.throws(function () { env.getTemplate('page14.html').render(c); }, TemplateSyntaxError);
};

exports.testTransKeyIsMissingQuotes = function() {
   assert.throws(function () { env.getTemplate('page15.html').render(c); }, TemplateSyntaxError);
};

exports.testTransMissingSourceString = function() {
   assert.throws(function () { env.getTemplate('page16.html').render(c); }, TemplateSyntaxError);
};

exports.testBlockTransNoEndBlockTrans = function() {
   assert.throws(function () { env.getTemplate('page17.html').render(c); }, TemplateSyntaxError);
};

exports.testBlockTransMissingComment = function() {
   assert.throws(function () { env.getTemplate('page18.html').render(c); }, TemplateSyntaxError);
};

exports.testBlockTransMissingKey = function() {
   assert.throws(function () { env.getTemplate('page19.html').render(c); }, TemplateSyntaxError);
};

exports.testBlockTransMissingQuotesOnKey = function() {
   assert.throws(function () { env.getTemplate('page20.html').render(c); }, TemplateSyntaxError);
};

exports.testBlockTransSubtagsNotAllowed = function() {
   assert.throws(function () { env.getTemplate('page21.html').render(c); }, TemplateSyntaxError);
};

//start the test runner if we're called directly from command line
if (require.main == module.id) {
	require('system').exit(require('test').run(exports, arguments[1]));
}
