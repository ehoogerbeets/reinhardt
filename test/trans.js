var fs = require("fs");
var assert = require("assert");
var {Context} = require('../lib/context');
var {Environment} = require('../lib/environment');
var {Template} = require("../lib/template");
var {TemplateSyntaxError} = require('../lib/errors');
var ilib = require("../../ilib");
var ResBundle = require("../../ilib/lib/ResBundle.js");

var FsLoader = require('../lib/loaders/filesystem').Loader;
var fsLoader = new FsLoader(module.resolve('./templatedir/trans/templates'));
var env = new Environment({loader: fsLoader});

// console.log("environment: resourcesDir is " + env.resourcesDir);
// if the environment is debug, use the psuedo-translation locale for testing
var rb = new ResBundle({
   locale: "de-DE",
   type: "html",
   loadParams: {
      base: env.resourcesDir
   }
});

var c = {
   page: {
      name: "Test page"
   },
   variable: "Interpolated Variable",
   resBundle: rb
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
   system.exit(require('test').run(exports, arguments[1]));
}
