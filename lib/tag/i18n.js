var {Node,TextNode,VariableNode} = require('../nodes');
var {tokenKwargs} = require('../token');
var {TemplateSyntaxError} = require('../errors');
var {Template} = require("../template");

var TransNode = function(source, variableName, key, factory) {
   this.source = source;
   this.variable = variableName;
   this.key = key;
   this.bundleFactory = factory;
};

TransNode.prototype.getByType = Node.prototype.getByType;
TransNode.prototype.render = function(context) {
   var output = "";

   var rb = this.bundleFactory && this.bundleFactory(context.get("locale"));
   var translation =  rb ? rb.translate(this.source, this.key) : this.source;
   // console.log("source is: " + this.source + " with key " + this.key);
   // console.log("translation is: " + translation);

   // reparse the translation so we can render the variable values into it
   var template = new Template(translation);
   var rendered = template.render(context);

   if (this.variable) {
      context.set(this.variable, rendered);
   } else {
      output = rendered;
   }

   return output;
};

/**
   Translates a string to the language of the to the current locale.

   To translate a single string, use::

      {% trans "This is the source string." %}

   You can also assign the string to a variable name
   instead of rendering it into the template::

      {% trans "This is the source string." as translated_string %}

      This is translated: {{translated_string}}

   If you have two trans tags with the same source string, but which
   should be treated differently in translation, you can give them
   unique keys using the 'key' argument::

      {% trans "Free" key "unique_key_name" %}

   A translator's comment can be added as well. This
   comment gets ignored in the rendered output and is intended to be
   be extracted automatically by a localization tool and included
   with the source text to pass hints to the translators about what
   the source string means and about the context in which it is used.
   Example::

      {% trans "Cancel" comment "Cancel button label for the new user dialog box." %}
*/
exports.trans = function(parser, token) {
   // split_contents() knows not to split quoted strings.
   var key, bits = token.splitContents();
   var tagName = bits[0];
   if (bits.length < 2) {
      throw new TemplateSyntaxError(tagName + " tag requires at least one source string argument");
   }
   var sourceString = bits[1];
   var variableName;

   if (bits.length > 2) {
      // skip the translator's comment. That is to be extracted by the localization tool,
      // and should not appear in the rendered output.
      var arg = bits.indexOf("comment");
      if (arg > -1) {
         if (arg + 1 >= bits.length) {
            throw new TemplateSyntaxError(tagName + " tag argument 'comment' is missing its comment string");
         }
         bits.splice(arg, 2);
      }

      arg = bits.indexOf("key");
      if (arg > -1) {
         if (arg + 1 >= bits.length) {
            throw new TemplateSyntaxError(tagName + " tag argument 'key' is missing its unique name");
         }
         key = bits[arg+1];
         first = key.charAt(0);
         if (first !== key.slice(-1) || (first !== '"' && first !== "'")) {
            throw new TemplateSyntaxError(tagName + " tag argument for 'key' parameter should be in quotes");
         }
         key = key.slice(1, -1);
         bits.splice(arg, 2);
      }

      if (bits[2] === "as") {
         variableName = bits[3];
      }
   }
   var first = sourceString.charAt(0);
   if (first !== sourceString.slice(-1) || (first !== '"' && first !== "'")) {
      throw new TemplateSyntaxError(tagName + " tag argument should be quoted");
   }

   sourceString = sourceString.slice(1, -1);

   var bundleFactory = parser.environment && parser.environment.config && parser.environment.config.i18n && parser.environment.config.i18n.resBundleFactory;
   return new TransNode(sourceString, variableName, key, bundleFactory);
};

var BlockTransNode = function(source, key, extraContext, factory) {
   this.source = source
   this.extraContext = extraContext;
   this.key = key;
   this.bundleFactory = factory;
};

BlockTransNode.prototype.getByType = Node.prototype.getByType;
BlockTransNode.prototype.render = function(context) {
   var output = "";

   // identity translation for now

   if (this.extraContext) {
      var values = {};
      for (var key in this.extraContext) {
        values[key] = this.extraContext[key].resolve(context);
      }
      context.update(values);
   }

   var rb = this.bundleFactory && this.bundleFactory(context.get("locale"));
   var translation = rb ? rb.translate(this.source, this.key) : this.source;
   //console.log("source is: " + this.source + " with key " + this.key);
   //console.log("translation is: " + translation);

   // reparse the translation so we can render the variable values into it
   var template = new Template(translation);
   output = template.render(context);

   if (this.extraContext) {
      context.pop();
   }

   return output;
};

/**
   Translates a block to the language of the current locale.

   Example of regular usage::

      {% blocktrans %}
      This is source text spanning
      multiple lines that needs to be
      translated.
      {% endblocktrans %}

   You can also do variable substitution inside of the block::

      {% blocktrans with foo=page.name %}
      <h2>{{foo}}</h2>
      This block uses a variable for the header.
      {% endblocktrans %}

   If you have two blocks with the same source string, but which
   should be treated differently in translation, you can give them
   unique keys using the 'key' argument::

      {% blocktrans key "unique_key_name" %}
      Free
      {% endblocktrans %}

   A translator's comment can be added as well. This
   comment gets ignored in the rendered output and is intended to be
   be extracted automatically by a localization tool and included
   with the source text to pass hints to the translators about what
   the source string means and about the context in which it is used.
   Example::

      {% blocktrans comment "This text used in the first page of the new user wizard." %}
      Enter information about the new user. When done, click 'Next' to
      enter information about the user's role.
      {% endblocktrans %}

   Blocktrans tags cannot contain other tags inside of them except
   for variable tags. If any are found, the parser will throw an exception.

*/
exports.blocktrans = function(parser, token) {
   // split_contents() knows not to split quoted strings.
   var bits = token.splitContents();
   var tagName = bits[0];
   var extraContext;
   var key, first;
   if (bits.length > 1) {
      // skip the translator's comment. That is to be extracted by the localization tool,
      // and should not appear in the rendered output.
      var arg = bits.indexOf("comment");
      if (arg > -1) {
         if (arg + 1 >= bits.length) {
            throw new TemplateSyntaxError(tagName + " tag argument 'comment' is missing its comment string");
         }
         bits.splice(arg, 2);
      }

      arg = bits.indexOf("key");
      if (arg > -1) {
         if (arg + 1 >= bits.length) {
            throw new TemplateSyntaxError(tagName + " tag argument 'key' is missing its unique name");
         }
         key = bits[arg+1];
         first = key.charAt(0);
         if (first !== key.slice(-1) || (first !== '"' && first !== "'")) {
            throw new TemplateSyntaxError(tagName + " tag argument for 'key' parameter should be in quotes");
         }
         key = key.slice(1, -1);
         bits.splice(arg, 2);
      }

      // bits[1] is "with" -> ignore
      var remainingBits = bits.slice(2);
      extraContext = tokenKwargs(remainingBits, parser);
   }
   var nodelist = parser.parse(['endblocktrans']);
   parser.deleteFirstToken();

   var source = "";
   nodelist.contents.forEach(function (node) {
      if (node instanceof TextNode) {
         source += node.s;
      } else if (node instanceof VariableNode) {
         source += "{{ " + node.filterExpression.token + " }}";
      } else {
         throw new TemplateSyntaxError("Blocktrans at line " + token.lineNo + " contains a subtag, which is not allowed.");
      }
   });
   // compress white spaces and remove new lines
   source = source.replace(/\s+/g, " ");
   var bundleFactory = parser.environment && parser.environment.config && parser.environment.config.i18n && parser.environment.config.i18n.resBundleFactory;
   return new BlockTransNode(source, key, extraContext, bundleFactory);
};
