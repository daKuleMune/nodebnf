/*!
 * JavaScript BNF Compiler
 * 
 * Compiler that can compile BNF syntax into bnf.js scripts to load faster for the first pass or obfuscate the BNF.
 * 
 * @version 0.0.1
 */

var i = require( "./bnf.bnf.js" ).interpreter;
var parserObject = require( "./parser.js" ).parser;
var parser = new parserObject( i );
parser.ParseScript( "test.bnf" );