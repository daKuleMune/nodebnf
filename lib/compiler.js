/*!
 * JavaScript BNF Compiler
 * 
 * Compiler that can compile BNF syntax into bnf.js scripts to load faster for the first pass or obfuscate the BNF.
 * 
 * @version 0.0.1
 */

var interpreter = require( "./bnf.bnf.js" ).interpreter;
var parser = require( "./parser.js" ).parser;

