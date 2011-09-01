/*!
 * Used to created generated language files from real BNF
 */

/*!
* Module dependencies.
*/
var languageObject = require( "./parser.js" ).LanguageObject;

/**
 * Interpreter used by the parser to be exported after grammar rules are written.
 */
var i = new languageObject( "bnf" );

/**
 * Short names for faster processing of the script
 */
var r = i.syntaxObject;

/**
 * Add all the rules and there id's
 */
i.AddRule( "rule" );
i.AddRule( "whitespace" );
i.AddRule( "optWhitespace" );
i.AddRule( "expression" );
i.AddRule( "lineEnd" );
i.AddRule( "list" );
i.AddRule( "term" );
i.AddRule( "literal" );
i.AddRule( "ruleName" );
i.AddRule( "text" );
i.AddRule( "char" );
i.AddRule( "varRule" );
i.IndexTokenIdList();

/**
 * Define grammar of all the rules
 */
i.WriteRule( "syntax", i.Or( r.rule, i.And( r.rule, r.lineEnd, r.syntax ) )  );
i.WriteRule( "lineEnd", i.Or( i.And( "\r", "\n" ), "\n" ) );
i.WriteRule( "rule", i.And( r.optWhitespace, "<", r.ruleName, ">", r.optWhitespace, "::=",
		r.optWhitespace, r.expression ) );
i.WriteRule( "optWhitespace", i.Or( i.Blank(), i.And( r.whitespace, r.optWhitespace ) ) );
i.WriteRule( "whitespace", i.Or( i.Or( " ", "\t", "\n" ) ) );
i.WriteRule( "ruleName", r.text );
i.WriteRule( "expression", i.Or( r.list, i.And( r.list, r.optWhitespace, "|", r.optWhitespace, r.expression ) ) );
i.WriteRule( "list", i.Or( r.term, i.And( r.term, r.optWhitespace, r.list ) ) );
i.WriteRule( "term", i.Or( r.literal, r.varRule ) );
i.WriteRule( "varRule", i.And( "<", r.text, ">" ) );
i.WriteRule( "literal", i.Or( i.And( "'", r.text, "'" ), i.And( '"', r.text, '"') ) );
i.WriteRule( "text", i.Or( r.char, i.And( r.char, r.text ) ) );
i.WriteRule( "char", i.Or( i.CharGroup( "A", "Z" ), i.CharGroup( "a", "z" ) ) );
/*
i.WriteRule( "list", or( r.term, and( r.term, r.optWhitespace, r.list ) ) );
i.WriteRule( "term", or( r.literal, and( "<", r.ruleName, ">" ), r.regEx ) );

i.WriteRule( "regEx", and( "/", /^([A-Za-z\\ \-\_\!\&\{\}\]\[\(\)\+\#\@\*\%\~\`\,\.\<\>\?\:\;\"\'\|]|\\\/){1,}$/, "/" ) );
*/

exports.interpreter = i;