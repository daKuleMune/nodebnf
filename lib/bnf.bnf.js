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
i.AddRule( "orlist" );
i.AddRule( "term" );
i.AddRule( "include" );
i.AddRule( "literal" );
i.AddRule( "ruleName" );
i.AddRule( "text" );
i.AddRule( "char" );
i.AddRule( "varRule" );
i.AddRule( "anyNoQuotes" );
i.AddRule( "textSingleQuotes" );
i.AddRule( "textDoubleQuotes" );
i.AddRule( "anyWithSingleQuotes" );
i.AddRule( "anyWithDoubleQuotes" );
i.AddRule( "anyWithQuotes" );
i.IndexTokenIdList();

/**
 * Define grammar of all the rules
 */
i.WriteRule( "syntax", i.Or( r.rule, i.And( r.rule, r.lineEnd, r.syntax ) )  );
i.WriteRule( "lineEnd", i.Or( i.And( "\r", "\n" ), "\n" ) );
i.WriteRule( "rule", i.And( r.optWhitespace, "<", r.ruleName, ">", r.optWhitespace, "::=", r.optWhitespace, r.expression ) );
i.WriteRule( "optWhitespace", i.Or( i.Blank(), i.And( r.whitespace, r.optWhitespace ) ) );
i.WriteRule( "whitespace", i.Or( " ", "\t" ) );
i.WriteRule( "ruleName", r.text );
i.WriteRule( "expression", i.Or( r.list, i.And( r.list, r.optWhitespace, r.orlist, r.optWhitespace, r.expression ) ) );
i.WriteRule( "orlist", "|" );
i.WriteRule( "list", i.Or( r.term, i.And( r.term, r.optWhitespace, r.list ) ) );
i.WriteRule( "term", i.Or( r.literal, r.varRule, r.include ) );
i.WriteRule( "include", i.And( "#", r.text ) );
i.WriteRule( "varRule", i.And( "<", r.text, ">" ) );
i.WriteRule( "literal", i.Or( i.And( "'", r.textSingleQuotes, "'" ), i.And( '"', r.textDoubleQuotes, '"' ) ) );
i.WriteRule( "text", i.Or( r.char, i.And( r.char, r.text ) ) );
i.WriteRule( "char", i.Or( i.CharGroup( "A", "Z" ), i.CharGroup( "a", "z" ), "_" ) );
i.WriteRule( "textSingleQuotes", i.Or( i.Blank(), r.anyWithSingleQuotes, i.And( r.anyWithSingleQuotes, r.textSingleQuotes ) ) );
i.WriteRule( "textDoubleQuotes", i.Or( i.Blank(), r.anyWithDoubleQuotes, i.And( r.anyWithDoubleQuotes, r.textDoubleQuotes ) ) );
i.WriteRule( "anyWithSingleQuotes", i.Or( r.anyNoQuotes, "\\'", '"' ) );
i.WriteRule( "anyWithDoubleQuotes", i.Or( r.anyNoQuotes, '\\"', "'" ) );
i.WriteRule( "anyNoQuotes", i.Or( i.CharGroup( " ", "!" ), i.CharGroup( "#", "&" ), i.CharGroup( "(", "[" ), i.CharGroup( "]", "~" ) ) );

exports.interpreter = i;