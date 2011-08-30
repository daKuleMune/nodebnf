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
i.AddRule( "optWhitespace" );
i.AddRule( "expression" );
i.AddRule( "lineEnd" );
i.AddRule( "list" );
i.AddRule( "term" );
i.AddRule( "literal" );
i.AddRule( "ruleName" );
i.AddRule( "text" );
i.IndexTokenIdList();

/**
 * Define grammar of all the rules
 */
i.WriteRule( "syntax", i.Or( r.rule, i.And( r.rule, r.lineEnd, r.syntax ) ) );
i.WriteRule( "rule", "todo" );
i.WriteRule( "lineEnd", i.Or( i.And( "\r", "\n" ), "\n" ) );
/*i.WriteRule( "rule", and( optional( r.whitespace ), "<", r.ruleName, ">",
		optional( r.whitespace ), "::=", optional( r.whitespace ), r.expression, r.lineEnd ) );
i.WriteRule( "whitespace", repeat( or( " ", "\t", "\n", r.comment ) ) );
i.WriteRule( "whitespaceNoComment", repeat( or( " ", "\t", "\n" ) ) );
i.WriteRule( "expression", or( r.list, and( r.list, "|", r.expression ) ) );
i.WriteRule( "lineEnd", and( r.optWhitespace, "\n" ) );
i.WriteRule( "list", or( r.term, and( r.term, r.optWhitespace, r.list ) ) );
i.WriteRule( "term", or( r.literal, and( "<", r.ruleName, ">" ), r.regEx ) );
i.WriteRule( "literal", or( and( '"', r.text, '"' ), and( "'", r.text, "'" ) ) );
i.WriteRule( "ruleName", r.text );
i.WriteRule( "text", /^[A-Za-z][A-Za-z\d]{0,}$/ );
i.WriteRule( "regEx", and( "/", /^([A-Za-z\\ \-\_\!\&\{\}\]\[\(\)\+\#\@\*\%\~\`\,\.\<\>\?\:\;\"\'\|]|\\\/){1,}$/, "/" ) );
i.WriteRule( "comment", and( "<!--", r.optWhitespaceNoComment, /^.{1,}$/, r.optWhitespaceNoComment, "-->" ) );*/

exports.interpreter = i;