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
i.AddTokenEventByName( "ruleName", function( token ){
	console.log( token.text );
} );
i.AddTokenEventByName( "list", function( token ){
	//var left = i.SeekTokenByName( token, "number" ).text;
	var term = null;
	while( ( term = i.SeekTokenByName( token, "term" ) ) != null ){
		console.log( term.text );
	}
} );

//parser.ParseScript( "test.bnf" );

exports.Compiler = function( ){
	
};