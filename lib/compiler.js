/*!
 * JavaScript BNF Compiler
 * 
 * Compiler that can compile BNF syntax into bnf.js scripts to load faster for the first pass or obfuscate the BNF.
 * 
 * @version 0.0.8
 */

exports.version = '0.0.8';
var parserObject = require( "./parser.js" ).parser;
var fs = require('fs');
/**
 * BNF script compiler for language interpretation.
 * @see Compiler.Constructor
 */
exports.Compiler = function( ){
	/**
	 * Constructor of the object
	 */
	function Constructor( ){
		_interpreter = require( "./bnf.bnf.js" ).interpreter;
		_parser = new parserObject( _interpreter );
		for( var i in _eventObject ){
			_interpreter.AddTokenEventByName( i, _eventObject[i] );
		}
	}
	/////////////////////
//////PRIVATE VARIABLES//
	/////////////////////
	var _interpreter = null;
	var _parser = null;
	var _eventObject = {
		"script":function( token ){
			this.ruleContainer = {};
		},
		"ruleName":function( token ){
			this.ruleContainer[token.text] = [ [] ];
			this.currentRuleContainer = this.ruleContainer[token.text];
		},
		"term":function( token ){
			var tokenStore = {};
			if( token.tokens[0].name == "literal" ){
				tokenStore.type = "literal";
				tokenStore.text = token.tokens[0].text.substring( 1, token.tokens[0].text.length - 1 );
			}
			else if( token.tokens[0].name == "varRule" ){
				tokenStore.type = "rule";
				tokenStore.text = token.tokens[0].text.substring( 1, token.tokens[0].text.length - 1 );
			}
			this.currentRuleContainer[ this.currentRuleContainer.length - 1 ].push( tokenStore );
		},
		"orlist":function( token ){
			this.currentRuleContainer.push( [] );
		}
		
	};
	//////////////////
//////PUBLIC METHODS//
	//////////////////
	function _OutputWriteRule( syntax ){
		if( syntax.type == "literal" ){
			if( syntax.text != "" ){
				return "\"" + syntax.text + "\"";
			}
			else{
				return "i.Blank()";
			}
		}
		else if( syntax.type == "rule" ){
			return "r." + syntax.text;
		}
	}
	
	function _GenerateAndTree( ruleSyntax ){
		var Output = [];
		for( var i = 0; i < ruleSyntax.length; i++ ){
			Output.push( _OutputWriteRule.call( this, ruleSyntax[i] ) );
		}
		
		if( Output.length > 1 ){
			return "i.And( " + Output.join( ", " ) + " )";
		}
		else{
			return Output[0];
		}
	}
	
	function _GenerateWriteRule( ruleSyntax ){
		var Output = [];
		for( var i = 0; i < ruleSyntax.length; i++ ){
			Output.push( _GenerateAndTree.call( this, ruleSyntax[i] ) );
		}

		if( Output.length > 1 ){
			return "i.Or( " + Output.join( ", " ) + " )";
		}
		else{
			return Output[0];
		}
	};
	
	/**
	 * TODO check if the file in cache is the same as the file we want to compile.
	 * @param id
	 * @returns {Boolean}
	 */
	function _CheckIdCache( id ){
		return false;
	}
	
	this.CreateParser = function( interpreter, eventTree ){
		var parser = new parserObject( interpreter );
		for( var i in eventTree ){
			interpreter.AddTokenEventByName( i, eventTree[i] );
		}
		return parser;
	};
	
	function _ConnectScript( id ){
		return require( __dirname + "/cache/" + id + ".bnf.js" ).interpreter;
	}
	
	function _CompileObjectScript( script, id, callback ){
		var cacheScript = 'var languageObject = require( "../parser.js" ).LanguageObject;\n';
		cacheScript += 'var i = new languageObject( "bnf" );\n';
		cacheScript += 'var r = i.syntaxObject;\n';
		//Rule Names
		for( var i in script.ruleContainer ){
			cacheScript += 'i.AddRule( "'+i+'" );\n';
		}
		cacheScript += 'i.IndexTokenIdList();\n';
		//Rule Writes
		for( var i in script.ruleContainer ){
			cacheScript += 'i.WriteRule( "'+i+'", '+_GenerateWriteRule.call( this, script.ruleContainer[i] )+' );\n';
		}
		cacheScript += 'exports.interpreter = i;';
		
		fs.writeFile( __dirname + "/cache/" + id + ".bnf.js", cacheScript, 'utf8', function(){
			callback( _ConnectScript.call( this, id ) );
		} );
		
		fs.writeFile( __dirname + "/cache/" + id + ".bnf", script.rawScript, 'utf8' );
	}
	
	this.CompileScript = function( scriptName, id, callback ){
		var compiled = _CheckIdCache.call( this, id );
		if( !compiled ){
			var self = this;
			_parser.ParseScript( scriptName, function( script ){
				_CompileObjectScript.call( self, script, id, function( i ){
					callback( i );
				} );
			} );
		}
		else{
			callback( _ConnectScript.call( this, id ) );
		}
	};
	
	this.CompileString = function( string, id, callback ){
		var compiled = _CheckIdCache.call( this, id );
		if( !compiled ){
			var script = _parser.ParseScriptString( string );
			return _CompileObjectScript.call( this, script, id, function( i ){
				callback( i );
			} );
		}
		else{
			//Run Script
			callback( _ConnectScript.call( this, id ) );
		}
	};
	
	//CALL TO CONSTRUCTOR//
	Constructor.call( this, arguments[0] );
	//CALL TO CONSTRUCTOR//
};