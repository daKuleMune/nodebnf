
console.log( "This is a simple calculator language that looks at a file for basic math, and computes each line.");

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

compiler.CompileScript( __dirname + "/calc.bnf", "calc", function( interpreter ){
	var parser = compiler.CreateParser( interpreter, events );
	parser.ParseScript( __dirname + "/calc.calc" );
} );