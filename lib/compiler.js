/*!
 * JavaScript BNF Compiler
 *
 * Compiler that can compile BNF syntax into bnf.js scripts.
 */

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
	/**
	 * Events to compile BNF scripts into a parser of there own.
	 * @type AssoArray
	 */
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
			else if( token.tokens[0].name == "include" ){
				tokenStore.type = "include";
				tokenStore.text = token.tokens[0].text.substring( 1 );
			}
			else{
				console.log( "Unknown token name '" + token.tokens[0].name + "' please add a parse event for it." );
				process.exit();
			}
			this.currentRuleContainer[ this.currentRuleContainer.length - 1 ].push( tokenStore );
		},
		"orlist":function( token ){
			this.currentRuleContainer.push( [] );
		}

	};
	/**
	 * The language interpreter for this compiler.
	 * @type {bnf.LanguageObject}
	 */
	var _interpreter = null;
	/**
	 * The BNF language parser for this compiler.
	 * @type {bnf.parser}
	 */
	var _parser = null;
	/**
	 * Standard BNF rules that are written into each language script.
	 * @type AssoArray
	 */
	var _standardRules = {
		"_char":'i.Or( i.CharGroup( "A", "Z" ), i.CharGroup( "a", "z" ), "_" )',
		"_text":'i.Or( r._char, i.And( r._char, r._text ) )',
		"_digit":'i.Or( i.CharGroup( "0", "9" ) )', //This should work outside of a i.Or but dosn't, fix it//
		"_cr":'"\\r"',
		"_lf":'"\\n"',
		"_crlf":'i.Or( i.And( r._cr, r._lf ), i.Or( r._cr, r._lf ) )',
		"_htab":'"\\t"',
		"_sp":'" "',
		"_wsp":'i.Or( r._wspchar, i.And( r._wspchar, r._wsp ) )',
		"_wspchar":'i.Or( r._htab, r._sp )',
		"_owsp":'i.Or( i.Blank(), r._wsp )',
		"_digits":'i.Or( r._digit, i.And( r._digit, r._digits ) )',
		"_number":'i.Or( r.digits, i.And( r.digits, ".", r.digits ) )',
		"_literal":'i.Or( i.And( "\'", r._literalSingleQuotes, "\'" ), i.And( \'"\', r._literalDoubleQuotes, \'"\' ) )',
		"_literalSingleQuotes":'i.Or( i.Blank(), r._literalCharSingleQuotes, i.And( r._literalCharSingleQuotes, r._literalSingleQuotes ) )',
		"_literalDoubleQuotes":'i.Or( i.Blank(), r._literalCharDoubleQuotes, i.And( r._literalCharDoubleQuotes, r._literalDoubleQuotes ) )',
		"_literalCharSingleQuotes":'i.Or( r._anyLiteralChar, \'"\', "\\\\\'" )',
		"_literalCharDoubleQuotes":'i.Or( r._anyLiteralChar, \'\\\\"\', "\'" )',
		"_anyLiteralChar":'i.Or( i.CharGroup( " ", "!" ), i.CharGroup( "#", "&" ), i.CharGroup( "(", "[" ), i.CharGroup( "]", "~" ) )'
	};

	///////////////////
//////PRIVATE METHODS//
	///////////////////
	/**
	 * Checks if the file in cache is the same as the file we want to compile.
	 * TODO
	 * @param id - The id that was used to cache the script.
	 * @returns {Boolean}
	 */
	function _CheckIdCache( id ){
		return false;
	}
	/**
	 * Connects a cached script and returns it.
	 * @param id - The id that was used to cache the script.
	 * @returns {bnf.LanguageObject} - The interpreter of the cached BNF script.
	 */
	function _ConnectScript( id ){
		return require( __dirname + "/cache/" + id + ".bnf.js" ).interpreter;
	}
	/**
	 * Compiles a BNF language script into a interpreter for interpret other scripts.
	 * @param script bnf.Script - The script after the parser ran the tokens.
	 * @param id string - The id used for cache of the script.
	 * @param callback function - Method to call after the script is compiled.
	 */
	function _CompileObjectScript( script, id, callback ){
		var cacheScript = 'var languageObject = require( "../parser.js" ).LanguageObject;\n';
		cacheScript += 'var i = new languageObject( "'+id+'" );\n';
		cacheScript += 'var r = i.syntaxObject;\n';
		//Rule Names
		for( var i in script.ruleContainer ){
			if( i != "syntax" ){
				cacheScript += 'i.AddRule( "'+i+'" );\n';
			}
		}
		for( var i in _standardRules ){
			cacheScript += 'i.AddRule( "'+i+'" );\n';
		}
		cacheScript += 'i.IndexTokenIdList();\n';
		//Rule Writes
		for( var i in script.ruleContainer ){
			cacheScript += 'i.WriteRule( "'+i+'", '+_GenerateWriteRule.call( this, script.ruleContainer[i] )+' );\n';
		}

		for( var i in _standardRules ){
			cacheScript += 'i.WriteRule( "'+i+'", '+_standardRules[i]+' );\n';
		}
		cacheScript += 'exports.interpreter = i;';

		fs.writeFile( __dirname + "/cache/" + id + ".bnf.js", cacheScript, 'utf8', function(){
			callback( _ConnectScript.call( this, id ) );
		} );

		fs.writeFile( __dirname + "/cache/" + id + ".bnf", script.rawScript, 'utf8', function(){ } );
	}
	/**
	 * Writes a rule from BNF language into JavaScript.
	 * @param syntax {Object} - Rule in BNF language syntax.
	 * @returns string - The text representation of the JavaScript rule.
	 */
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
		else if( syntax.type == "include" ){
			return "i.Include( '"+syntax.text+"' )";
		}
		else{
			console.log( "Unknown syntax type, '" + syntax.type + "' please add a rule generator for it." );
			process.exit();
		}
	}
	/**
	 * Generates a rule and trees into a rule output.
	 * @param ruleSyntax {Object} - Rule in BNF language syntax.
	 * @returns string - The text representation of the JavaScript rule.
	 */
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
	/**
	 * Generates a write rule into a rule output.
	 * @param ruleSyntax {Object} - Rule in BNF language syntax.
	 * @returns string - The text representation of the JavaScript rule.
	 */
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

	//////////////////
//////PUBLIC METHODS//
	//////////////////
	/**
	 * Creates a parser for the compiler.
	 * @param interpreter {bnf.LanguageObject} - The parsers language object.
	 * @param eventTree AssoArray - The event tree to bind the interpreter to.
	 * @returns {bnf.parser} - A parser with bound interpreter.
	 */
	this.CreateParser = function( interpreter, eventTree ){
		var parser = new parserObject( interpreter );
		for( var i in eventTree ){
			interpreter.AddTokenEventByName( i, eventTree[i] );
		}
		return parser;
	};
	/**
	 * Compiles a BNF language script file.
	 * @param scriptName string - Name of the script file
	 * @param id string - Id used for caching the script file
	 * @param callback function - Method to call when the script is compiled into an interpreter.
	 */
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
	/**
	 * Compiles a BNF language script string.
	 * @param string string - The raw string of the BNF language script
	 * @param id string - Id used for caching the script file
	 * @param callback function - Method to call when the script is compiled into an interpreter.
	 */
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
