
console.log( "This is a simple calculator language that looks at a file for basic math, and computes each line.")

var i = require( "./calculator.bnf.js" ).interpreter;
i.AddTokenEventByName( "expression", function( token ){
	var left = i.SeekTokenByName( token, "number" ).text;
	var type = i.SeekTokenByName( token, "type" ).text;
	var right = i.SeekTokenByName( token, "number" ).text;
	
	//Equate
	var equate = -1;
	eval( "equate = " + left + type + right + ";" );
	console.log( "File found syntax " + equate );
} );

var parserObject = require( "../../lib/parser.js" ).parser;
var parser = new parserObject( i );

parser.ParseScript( "calc.calc" );

//var interpreter = new require( "./parser.js" ).languageScript( "calc.bnf" );
