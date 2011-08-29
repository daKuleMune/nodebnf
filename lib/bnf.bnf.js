/*!
 * Used to created generated language files from real BNF
 */

/*!
* Module dependencies.
*/
var languageObject = require( "./parser.js" ).languageObject;

/**
 * Interpreter used by the parser to be exported after grammar rules are written.
 */
var interpreter = new languageObject( "bnf" );

/**
 * Short names for faster processing of the script
 */
var or = interpreter.Or;
var and = interpreter.And;
var repeat = interpreter.Repeat;
var group = interpreter.Group;
var optional = interpreter.Optional;
var write = interpreter.WriteRule;
var add = interpreter.AddRule;
var r = interpreter.syntaxObject;

/**
 * Add all the rules and there id's
 */
add( "rule" );
add( "optWhitespace" );
add( "expression" );
add( "lineEnd" );
add( "list" );
add( "term" );
add( "literal" );
add( "ruleName" );
add( "text" );
add( "regEx" );
add( "comment" );
add( "optWhitespaceNoComment" );
inerpreter.IndexTokenIdList();

/**
 * Define grammar of all the rules
 */
define( "syntax", repeat( r.rule ) );
define( "rule", and( optional( r.whitespace ), "<", r.ruleName, ">",
		optional( r.whitespace ), "::=", optional( r.whitespace ), r.expression, r.lineEnd ) );
define( "whitespace", repeat( or( " ", "\t", "\n", r.comment ) ) );
define( "whitespaceNoComment", repeat( or( " ", "\t", "\n" ) ) );
define( "expression", or( r.list, and( r.list, "|", r.expression ) ) );
define( "lineEnd", and( r.optWhitespace, "\n" ) );
define( "list", or( r.term, and( r.term, r.optWhitespace, r.list ) ) );
define( "term", or( r.literal, and( "<", r.ruleName, ">" ), r.regEx ) );
define( "literal", or( and( '"', r.text, '"' ), and( "'", r.text, "'" ) ) );
define( "ruleName", r.text );
define( "text", /^[A-Za-z][A-Za-z\d]{0,}$/ );
define( "regEx", and( "/", /^([A-Za-z\\ \-\_\!\&\{\}\]\[\(\)\+\#\@\*\%\~\`\,\.\<\>\?\:\;\"\'\|]|\\\/){1,}$/, "/" ) );
define( "comment", and( "<!--", r.optWhitespaceNoComment, /^.{1,}$/, r.optWhitespaceNoComment, "-->" ) );

exports.interpreter = inerpreter;