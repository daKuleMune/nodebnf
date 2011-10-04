
console.log( "This is a simple calculator language, but it adds in another language for function output.");

var events = { "expression":function( token ){
	var left = this.SeekNext( "number" ).text;
	var type = this.SeekNext( "type" ).text;
	var right = this.SeekNext( "number" ).text;
	
	//Equate
	var equate = -1;
	eval( "equate = " + left + type + right + ";" );
	console.log( "File found expression: " + equate );
} };

var parser = null;
var Compiler = require('../../lib/compiler.js').Compiler;
var compiler = new Compiler();

compiler.CompileScript( __dirname + "/functions.bnf", "func", function( interpreter ){
	var fparser = compiler.CreateParser( interpreter, { "function":function( token ){ console.log( token.text + " found in function." ); } } );
	compiler.CompileScript( __dirname + "/calc.bnf", "calc", function( interpreter ){
		var parser = compiler.CreateParser( interpreter, events );
		parser.IncludeLanguage( fparser );
		parser.ParseScript( __dirname + "/calc.calc" );
	} );
} );