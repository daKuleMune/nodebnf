/*!
 * Javascript BNF Parser
 */

var fs = require('fs');

/**
 * Language object to be interpreted by
 * @see LanguageObject.Constructor
 */
exports.LanguageObject = function( ){
	/**
	 * Constructor of the object
	 * @param name string - The name of the language to be interpreted.
	 */
	var Constructor = function( name ){
		_name = name;
		this.WriteRule( "script", this.Or( this.syntaxObject.syntax, { name:'endOfFile', method:function( token, script ){ return ( token.charPtr + token.length == script.endOfSource ); } }  ) );
	};

	/////////////////////
//////PRIVATE VARIABLES//
	/////////////////////
	/**
	 * The last id that was iterated
	 * @type integer
	 */
	var _lastId = 2;
	/**
	 * The name of the language to be interpreted passed by the constructor.
	 * @type string
	 */
	var _name = "";
	/**
	 * List of tokens by ID for quick access.
	 * @type Associative Array
	 */
	var _tokenIdList = {};

	///////////////////
//////PRIVATE METHODS//
	///////////////////
	/**
	 * Binds an event to a token type.
	 * @param token Object( @see syntaxObject ) - The token type to bind the event to.
	 * @param event Function - The method to bind to the token type.
	 */
	function _AddTokenEvent( token, event ){
		token.binding.push(event);
	};
	/**
	 * Turns method arguments into a array rather then having them as an object.
	 * @param arguments Object - The object containing the arguments to turn into an array
	 * @returns Array - The array of arguments.
	 */
	function _ArgumentArray( arguments ){
		var argumentArray = [];
		for( var i = 0; i < arguments.length; i++ ){
			argumentArray.push( arguments[i] );
		}
		return argumentArray;
	};

	////////////////////
//////PUBLIC VARIABLES//
	////////////////////
	/**
	 * An enumeration of the types of allowed rule types.
	 * @type Associative Array
	 */
	this.ruleList = { and:2, or:1, norule:0, cgroup:3, optional:4, repeat:5, include:6 };
	/**
	 * All the grammar for the language, in an associative array, where the name the rest is an object by type.
	 * @todo make a object for reference of what can go into these objects.
	 * @type Associative Array
	 */
	this.syntaxObject = { script:{ id: 0 }, syntax:{ id:1 } };

	//////////////////
//////PUBLIC METHODS//
	//////////////////
	/**
	 * Initializes a token type so grammar can be added to existing references, into the syntaxObject.
	 * @param rule string - The name of the rule to be added to the grammar list.
	 * @param [id] integer - Optional id for faster referencing.
	 */
	this.AddRule = function( rule, id ){
		id = id || _lastId;
		_lastId = id + 1;
		this.syntaxObject[rule] = { id:id };
	};
	/**
	 * Binds a method or event to a token type. Searching for the token type by id.
	 * @see _AddTokenEvent
	 * @param tokenId integer - The token type ID.
	 * @param event Function - The bound method or event.
	 */
	this.AddTokenEventById = function( tokenId, event ){
		_AddTokenEvent.call( this, _tokenIdList[tokenId], event );
	};
	/**
	 * Binds a method or event to a token type. Searching for the token type by name.
	 * @see _AddTokenEvent
	 * @param tokenName string - The token type name.
	 * @param event Function - The bound method or event.
	 */
	this.AddTokenEventByName = function( tokenName, event ){
		_AddTokenEvent.call( this, this.syntaxObject[tokenName], event );
	};
	/**
	 * Binds a method or event to a token type. Directly atteched to passed token type
	 * @see _AddTokenEvent
	 * @param token Object( @see syntaxObject ) - The token type
	 * @param event Function - The bound method or event.
	 */
	this.AddTokenEventByToken = function( token, event ){
		_AddTokenEvent.call( this, token, event );
	};
	/**
	 * Short cut for creating a "and" rule.
	 * @param [mixed][...] - More rules
	 */
	this.And = function( ){
		return { type:this.ruleList.and, syntax:_ArgumentArray.call( this, arguments) };
	};
	/**
	 * Creates a method in the grammar where the syntax will be correct regardless.
	 */
	this.Blank = function( ){
		return { name:'blank', method:function( token ){ return true; } };
	};
	/**
	 * Way to group characters together for faster processing.
	 * @param low string - The lowest character to start the search
	 * @param high string - The highest character to end the search
	 * @returns syntaxRule
	 */
	this.CharGroup = function( low, high ){
		return { type:this.ruleList.cgroup, low:low.charCodeAt(0), high:high.charCodeAt(0) };
	};
	/**
	 * Executes any methods/events bound to the token.
	 * @param token Token - The token with bound events.
	 */
	this.FireToken = function( token, script ){
		var binding = [];
		if( token.i ){
			binding = token.i.ReturnTokenAtId( token.id ).binding;
		}
		else{
			binding = _tokenIdList[token.id].binding;
		}

		for( var i = 0; i < binding.length; i++ ){
			token.fired = true;
			binding[i].call( script, token );
		}
	};
	/**
	 * Gets the next token from the token requested, could be self or one of children.
	 * @param token Token - The token to use as the point to search.
	 * @returns Token - The token that was next in line for execution.
	 * @todo - be able to transverse(parent) up the list from a token, rather then always needing the root to check for current token.
	 */
	this.GetToken = function( token, script ){
		var firedToken = null;
		if( token.offset == -1 ){
			token.offset = 0;
			firedToken = token;
		}
		else{
			if( token.offset < token.tokens.length ){
				firedToken = this.GetToken( token.tokens[token.offset], script );
				if( firedToken == null && token.offset + 1 < token.tokens.length ){
					token.offset++;
					firedToken = this.GetToken( token.tokens[token.offset], script );
				}
			}
			else{
				firedToken = null;
			}
		}
		if( firedToken != null && firedToken.fired == false ){
			this.FireToken( firedToken, script );
		}
		return firedToken;
	};
	/**
	 * Gets the name of the language and returns it.
	 * @returns string - The name of the language.
	 */
	this.GetName = function(){
		return _name;
	};
	/**
	 * Short cut for creating a "include" rule.
	 * @param [mixed][...] - More rules
	 */
	this.Include = function(){
		return { type:this.ruleList.include, syntax:_ArgumentArray.call( this, arguments ) };
	};
	/**
	 * Index all the token types for quick access into the _tokenIdList, should be called once all the types are added.
	 */
	this.IndexTokenIdList = function( ){
		for( var i in this.syntaxObject ){
			_tokenIdList[this.syntaxObject[i].id] = this.syntaxObject[i];
		}
	};
	/**
	 * Short cut for creating a "optional" rule.
	 */
	this.Optional = function(){
		return { type:this.ruleList.optional, syntax:_ArgumentArray.call( this, arguments ) };
	};
	/**
	 * Short cut for creating a "and" rule.
	 * @param [mixed][...] - More rules
	 */
	this.Or = function( ){
		return { type:this.ruleList.or, syntax:_ArgumentArray.call( this, arguments ) };
	};
	/**
	 * Short cut for creating a "repeat at least once" rule.
	 */
	this.Repeat = function( ){
		return { type:this.ruleList.repeat, syntax:_ArgumentArray.call( this, arguments ) };
	};
	/**
	 * Returns the token at the id, this does not fire or eat the token.
	 * @param id - The id of the token to be returned.
	 * @returns TokenSetting - The token setting object.
	 */
	this.ReturnTokenAtId = function( id ){
		return _tokenIdList[id];
	};

	//@TODO ABNF notations
	/*
	this.Group = function( ){
		return { type:5, syntax:arguments };
	};*/

	/**
	 * Gets the next token by name, moving the execution forward.
	 * @param token Token - Token of children tokens to search.
	 * @param tokenToFind string - The name of the token.
	 * @returns Token - The token found or null.
	 */
	this.SeekTokenByName = function( token, tokenToFind, script ){
		var foundToken = false;
		var reToken = null;
		while( !foundToken && ( reToken = this.GetToken( token, script ) ) != null ){
			if( reToken.name == tokenToFind ){
				foundToken = true;
			};
		}

		return reToken;
	};
	/**
	 * Writes a grammar rule into the syntax.
	 * @param rule string - The name of the syntax to write the rule into
	 * @param syntax mixed - The collection of rules and sub rules @see LanguageObject.And, LanguageObject.Or
	 */
	this.WriteRule = function( rule, syntax ){
		ruleObject = this.syntaxObject[rule];
		ruleObject.name = rule;
		ruleObject.grammar = {};
		ruleObject.binding = [];
		if( syntax.type ){
			ruleObject.grammar.type = syntax.type;
			ruleObject.grammar.syntax = syntax.syntax;
		}
		else{
			ruleObject.grammar.type = this.ruleList.and;
			ruleObject.grammar.syntax = [syntax];
		}
	};

	//CALL TO CONSTRUCTOR//
	Constructor.call( this, arguments[0] );
	//CALL TO CONSTRUCTOR//
};

/**
 * Script object class.
 * @see Script.Constructor
 */
Script = function( ){
	/**
	 * Constructor of the object
	 * @param Token - Script token
	 */
	function Constructor( parser, interpreter, ruleToken, scriptSettings ){
		this.rootToken = ruleToken;
		this.currentToken = this.rootToken;
		_parser = parser;
		_interpreter = interpreter;
		this.settings = scriptSettings;
		this.rawScript = scriptSettings.rawScript;
	};

	/////////////////////
//////PRIVATE VARIABLES//
	/////////////////////
	/**
	 * Reference to the parser object that created the script.
	 * @type {parser}
	 */
	var _parser = null;
	/**
	 * Reference to the interpreter that created the language.
	 * @type {LanguageObject}
	 */
	var _interpreter = null;

	////////////////////
//////PUBLIC VARIABLES//
	////////////////////
	/**
	 * The current token position.
	 * @type {Token}
	 */
	this.currentToken = null;
	/**
	 * The raw output of the script.
	 * @type string
	 */
	this.rawScript = "";
	/**
	 * The root script token.
	 * @type Token
	 */
	this.rootToken = null;
	/**
	 * Settings of the script object.
	 * @type Object
	 */
	this.settings = null;

	//////////////////
//////PUBLIC METHODS//
	//////////////////
	/**
	 * Executes the whole token tree.
	 */
	this.Execute = function( ){
		if( this.rootToken.validated ){
			while( ( this.currentToken = this.GetToken( ) ) != null ){
				/* Token received */
			}
		}
		else{
			_parser.GetErrorOutput( this.rootToken, this.settings );
		}

	};
	/**
	 * Gets the next token and returns it to the callee.
	 * @returns {Token} - The next token in the script.
	 */
	this.GetToken = function( ){
		this.currentToken = _interpreter.GetToken( this.rootToken, this );
		while( this.currentToken != null && this.currentToken.expended ){
			this.GetToken();
		}
		return this.currentToken;
	};

	function _Expend( tokens ){
		for( var i = 0; i < tokens.length; i++ ){
			tokens[i].expended = true;
			_Expend.call( this, tokens[i].tokens );
		}
	}

	this.ExpendToken = function(){
		this.GetToken();
		_Expend.call( this, this.currentToken.tokens );
		return this.currentToken;
	};
	/**
	 * Checks to see if a token has a token by name.
	 * @param tokenName string - Name of token to search for.
	 * @param searchToken {Token} - The token to search from.
	 * @returns boolean - Did the searchToken have tokenName?
	 */
	this.HasToken = function( tokenName, searchToken ){
		searchToken = searchToken || this.currentToken;
		var hasToken = false;
		for( var i = 0; i < searchToken.tokens.length && hasToken == false; i++ ){
			if( searchToken.tokens[i].name == tokenName ){
				return true;
			}
			hasToken = this.HasToken( tokenName, searchToken.tokens[i] );
		}
		return hasToken;
	};
	/**
	 * Seeks to the next token with tokenName in the root token scope.
	 * @param tokenName string - The name of the token to seek to.
	 */
	this.SeekNext = function( tokenName ){
		return _interpreter.SeekTokenByName( this.rootToken, tokenName, this );
	};

	//CALL TO CONSTRUCTOR//
	Constructor.call( this, arguments[0], arguments[1], arguments[2], arguments[3] );
	//CALL TO CONSTRUCTOR//
};

/**
 * Token object class.
 * @see Token.Constructor
 * @todo - Add parent for faster get actions from token searchs.
 */
Token = function(){
	/**
	 * Constructor of the object
	 * @param name string - Name of the token type.
	 * @param id - Id of the token type.
	 * @param charPtr - What point in the raw source to start the token text.
	 */
	function Constructor( tokenName, tokenId, tokenCharPtr ){
		this.name = tokenName;
		this.id = tokenId;
		this.charPtr = tokenCharPtr;
	};

	////////////////////
//////PUBLIC VARIABLES//
	////////////////////
	/**
	 * Point in the raw source where the token starts.
	 * @type integer
	 */
	this.charPtr = 0;
	/**
	 * What types of tokens where expected.
	 * @type Array
	 */
	this.expected = [];
	/**
	 * Did the token fire? Preventing it from firing twice.
	 * @type boolean
	 */
	this.fired = false;
	/**
	 * The id of the type of token.
	 * @type integer
	 */
	this.id = -1;
	/**
	 * An attached interpreter if it differs from the script interpreter.
	 * @type LanguageObject - The interpreter this token should be bound to.
	 */
	this.i = null;
	/**
	 * Length of the text in the token and its children.
	 * @deprecated can do a string check on check for length.
	 * @type integer
	 */
	this.length = 0;
	/**
	 * The current line number in the raw source.
	 * @type integer
	 */
	this.line = 0;
	/**
	 * Name of the type of token.
	 * @type string
	 */
	this.name = "";
	/**
	 * Execution offset, to check which child is next in the execution tree.
	 * @type integer
	 */
	this.offset = -1;
	/**
	 * Full text from the token and its children.
	 * @type string
	 */
	this.text = "";
	/**
	 * Child tokens.
	 * @type Array
	 */
	this.tokens = [];
	this.expended = false;
	this.position = -1;
	this.parent = null;
	/**
	 * Check to see if the token validated.
	 * @type boolean
	 */
	this.validated = false;
	/**
	 * How complex was the validation of the token?
	 * More complex validations have more validations and carry more weight in the OR
	 * @type integer
	 */
	this.validations = 0;

	//CALL TO CONSTRUCTOR//
	Constructor.call( this, arguments[0], arguments[1], arguments[2] );
	//CALL TO CONSTRUCTOR//
};

/**
 * Parsing class which turns scripts into tokens for the interpreter.
 */
exports.parser = function(){
	/**
	 * The constructor of the object
	 * @param interpreter LanguageObject - The interpreter and language object used to parse, and then execute the script.
	 */
	function Constructor( interpreter ){
		_interpreter = interpreter;
		_rl = _interpreter.ruleList;
	};

	/////////////////////
//////PRIVATE VARIABLES//
	/////////////////////
	/**
	 * Parsers attached to the parser for compute multi-language.
	 * @type - AssoArray
	 */
	var _includedParsers = {};
	/**
	 * Interpreter and language object used to parse, and then execute the script.
	 * @type LanguageObject
	 */
	var _interpreter = null;
	/**
	 * Short cut to interpreters rule list enumeration.
	 * @see LanguageObject.ruleList
	 * @type Object
	 */
	var _rl = null;

	///////////////////
//////PRIVATE METHODS//
	///////////////////
	/**
	 * Gathers information on tokens and finds the path to where something was not expected.
	 * @param expected
	 */
	function _ErrorExpactation( expected ){
		var expectedObject = { line:0, charPtr:0, tokenArray:[] };
		for( var i = 0; i < expected.length; i++ ){
			if( expected[i].token != null ){

				if( expectedObject.charPtr < expected[i].token.charPtr ){
					expectedObject.charPtr = expected[i].token.charPtr;
					expectedObject.line = expected[i].token.line;
				}
				if( expected[i].token.name ){
					expectedObject.tokenArray.push( expected[i].token.name );
				}
				var expectedSubSearch = _ErrorExpactation.call( this, expected[i].token.expected );
				expectedObject.tokenArray.push( "[" + expectedSubSearch.tokenArray.join( ",")+"]" );
				if( expectedSubSearch.charPtr > expectedObject.charPtr ){
					expectedObject.charPtr = expectedSubSearch.charPtr;
					expectedObject.line = expectedSubSearch.line;
				}
			}
			else{
				expectedObject.tokenArray.push( expected[i].grammar );
			}
		}

		return expectedObject;
	};
	/**
	 * Generates the trees of possible paths that can be taken to come to a result.
	 * @todo this method is not implemented or test fully
	 */
	/*function _GenerateOrTrees( grammar, complexLayer ){
		var group = { maxDepth:complexLayer, groups:[], complexity:complexLayer, logic:null };
		for( var i = 0; i < grammar.syntax.length; i++ ){
			if( grammar.syntax[i].type ){
				var childGroup = _GenerateOrTrees.call( this, grammar.syntax[i], complexLayer+1 );
				if( group.maxDepth < childGroup.maxDepth ){
					group.maxDepth = childGroup.maxDepth;
				}
				group.groups.push( childGroup );
			}
			else{
				group.logic = grammar.syntax[i];
			}
		}

		return group;
	};*/
	/**
	 * Generates a new token to use in parsing.
	 * @param rulePath Object( @see syntaxObject ) - The rule in the LanguageObject
	 * @param charPtr integer - Point to start reading the raw script for the token text.
	 * @returns Token
	 */
	function _GenerateToken( rulePath, charPtr, scriptSettings ){
		var token = new Token( rulePath.name, rulePath.id, charPtr );
		if( scriptSettings.subScript ){
			token.i = _interpreter;
		}
		return token;
	};
	/**
	 * Gets an error output for a token set
	 * @param Token ruleToken - The top of the token tree to report the error on.
	 */
	this.GetErrorOutput = function( ruleToken, scriptSettings ){
		var failedOutput = _ErrorExpactation.call( this, ruleToken.expected );
		console.log( "Failed @line:" + failedOutput.line + " @charicter:" + failedOutput.charPtr );
		console.log( "Expected tokens [" + failedOutput.tokenArray.join( "," ) + "]" );
		console.log( "Recived " + scriptSettings.rawScript.substr( failedOutput.charPtr, 1 ) );
	};
	/**
	 * Get the name of the language from the interpreter.
	 * @returns string - The name of the language.
	 */
	this.GetLanguageName = function(){
		return _interpreter.GetName();
	};
	/**
	 * Attempts to create a token at the given grammar rule set and add it to the parent token.
	 * @param grammar Object - The grammar rule to parse the raw script with.
	 * @param ruleContainer Token - The parent token which will contain the parsed script token.
	 */
	function _ProcessRuleGrammar( grammar, ruleContainer, scriptSettings ){
		switch( grammar.type ){
			case _rl.and:
				ruleContainer.validated = true;
				for( var i = 0; i < grammar.syntax.length && ruleContainer.validated == true; i++ ){
					if( grammar.syntax[i].id != undefined ){ //Grammar object
						var ruleToken = _GenerateToken.call( this, grammar.syntax[i], ruleContainer.length + ruleContainer.charPtr, scriptSettings );
						_ProcessRuleGrammar.call( this, grammar.syntax[i].grammar, ruleToken, scriptSettings );
						if( ruleToken.validated ){
							ruleToken.parent = ruleContainer;
							ruleToken.position = ruleContainer.tokens.length;
							ruleContainer.tokens.push( ruleToken );
							ruleContainer.length += ruleToken.length;
							ruleContainer.text += ruleToken.text;
							ruleContainer.validations++;
						}
						else{
							ruleContainer.validated = false;
							ruleContainer.expected.push( { grammar:grammar.syntax[i].name, token:ruleToken } );
						}
					}
					else if( grammar.syntax[i].type != undefined ){ //Multi-level grammar
						_ProcessRuleGrammar.call( this, grammar.syntax[i], ruleContainer, scriptSettings );
					}
					else if( grammar.syntax[i].method != undefined ){ //Method call
						var evaluated = grammar.syntax[i].method.call( this, ruleContainer, scriptSettings );
						if( !evaluated ){
							ruleContainer.validated = false;
							ruleContainer.expected.push( { grammar: grammar.syntax[i].name, token:null } );
						}
					}
					else if( grammar.syntax[i].length ){ //Text
						if( scriptSettings.rawScript.substr( ruleContainer.length + ruleContainer.charPtr , grammar.syntax[i].length ) == grammar.syntax[i] ){
							ruleContainer.text += scriptSettings.rawScript.substr( ruleContainer.length + ruleContainer.charPtr, grammar.syntax[i].length );
							ruleContainer.length += grammar.syntax[i].length;
							ruleContainer.validations++;
						}
						else{
							ruleContainer.validated = false;
							ruleContainer.expected.push( { grammar: grammar.syntax[i], token:null } );
						}
					}
				}
				break;
			case _rl.or:
				//@todo set the syntax into groups so we only process each syntax layer once//
				//var groups = _GenerateOrTrees( grammar, 1 );
				//Which one matches the most by a degree of complexity//
				var bestSubcommand = ruleContainer;
				for( var i = 0; i < grammar.syntax.length; i++ ){
					var subContainer = { length: ruleContainer.length, charPtr:ruleContainer.charPtr , text:ruleContainer.text , tokens:[], validations:0, validated:false, expected:[] };
					if( grammar.syntax[i].id ){ //Grammar object
						var ruleToken = _GenerateToken.call( this, grammar.syntax[i], subContainer.charPtr, scriptSettings );
						_ProcessRuleGrammar.call( this, grammar.syntax[i].grammar, ruleToken, scriptSettings );
						if( ruleToken.validated ){
							ruleToken.parent = subContainer;
							ruleToken.position = subContainer.tokens.length;
							subContainer.tokens.push( ruleToken );
							subContainer.length += ruleToken.length;
							subContainer.text += ruleToken.text;
							subContainer.validated = true;
							subContainer.validations++;
						}
						else{
							ruleContainer.expected.push( { grammar:grammar.syntax[i].name, token:ruleToken } );
						}
					}
					else if( grammar.syntax[i].type ){ //Multi-level grammar
						_ProcessRuleGrammar.call( this, grammar.syntax[i], subContainer, scriptSettings );
					}
					else if( grammar.syntax[i].method != undefined ){ //Method call
						var evaluated = grammar.syntax[i].method.call( this, subContainer, scriptSettings );
						if( evaluated ){
							subContainer.validated = true;
						}
						else{
							ruleContainer.expected.push( { grammar: grammar.syntax[i].name, token:null } );
						}
					}
					else{ //Text
						if( scriptSettings.rawScript.substr( subContainer.charPtr + subContainer.length, grammar.syntax[i].length ) == grammar.syntax[i] ){
							validatedRule = i;
							subContainer.text += scriptSettings.rawScript.substr( subContainer.charPtr + subContainer.length, grammar.syntax[i].length );
							subContainer.length += grammar.syntax[i].length;
							subContainer.validated = true;
							subContainer.validations++;
						}
						else{
							ruleContainer.expected.push( { grammar:grammar.syntax[i], token:null } );
						}
					}

					if( subContainer.validated && subContainer.validations > bestSubcommand.validations ||
						subContainer.validated && bestSubcommand == ruleContainer ){
						bestSubcommand = subContainer;
					}
				}
				if( bestSubcommand.validated && bestSubcommand != ruleContainer ){
					ruleContainer.length = bestSubcommand.length;
					ruleContainer.text = bestSubcommand.text;
					ruleContainer.validations = bestSubcommand.validations;
					ruleContainer.validated = true;
					for( var t = 0; t < bestSubcommand.tokens.length; t++ ){
						ruleContainer.tokens.push( bestSubcommand.tokens[t] );
					}
				}
				break;
			case _rl.cgroup:
				var char = scriptSettings.rawScript.substr( ruleContainer.charPtr + ruleContainer.length, 1 );
				var charNumber = char.charCodeAt( 0 );
				if( charNumber >= grammar.low && charNumber <= grammar.high ){
					ruleContainer.length += 1;
					ruleContainer.text += char;
					ruleContainer.validations++;
					ruleContainer.validated = true;
				}
				else{
					ruleContainer.expected.push( { grammar:"Char(" + grammar.low + "-" + grammar.high + ")" , token:null } );
				}
				break;
			case _rl.repeat:
				console.log( "repeat" );
				break;
			case _rl.optional:
				console.log( "optional" );
				break;
			case _rl.include:
				if( _includedParsers[grammar.syntax[0]] ){
					var subContainer = { name:grammar.syntax[0], length: ruleContainer.length, charPtr:ruleContainer.charPtr , text:ruleContainer.text , tokens:[], validations:0, validated:false, expected:[] };
					_includedParsers[grammar.syntax[0]].ParseIncludedInto( subContainer, scriptSettings );
					if( subContainer.validated == true ){
						ruleContainer.name = subContainer.name;
						ruleContainer.length = subContainer.length;
						ruleContainer.text = subContainer.text;
						ruleContainer.validations = subContainer.validations;
						ruleContainer.validated = true;
						for( var t = 0; t < subContainer.tokens.length; t++ ){
							ruleContainer.tokens.push( subContainer.tokens[t] );
						}
					}
				}
				else{
					console.log( "Call to include grammar of unknown type. '"+grammar.syntax[0]+"'" );
					process.exit();
				}

				break;
			default:
				console.log( "Unknown grammar type, '"+grammar.type+"' please add a case for the grammar." );
				process.exit();
				break;
		};

	};
	/**
	 * Tokenizes the file and prepares it for execution, or outputs the errors of why the script failed to parse.
	 * @param rulePath Object( @see syntaxObject ) - The syntax object rule path to start the parser.
	 * @returns Script - The compiled script object.
	 */
	function _Tokenize( rulePath, scriptSettings ){

		//Generate the core token//
		var ruleToken = _GenerateToken( _interpreter.syntaxObject.script, 0, scriptSettings );
		//Go over token rules in the core grammar//
		_ProcessRuleGrammar.call( this, rulePath.grammar, ruleToken, scriptSettings );
		//Did our script return valid?//
		var script = new Script( this, _interpreter, ruleToken, scriptSettings );

		return script;
	};

	////////////////////
//////PUBLIC VARIABLES//
	////////////////////

	//////////////////
//////PUBLIC METHODS//
	//////////////////
	/**
	 * Creates a connection between this parser and another.
	 * @param includedParser parser - The parser to include.
	 */
	this.IncludeLanguage = function( includedParser ){
		_includedParsers[includedParser.GetLanguageName()] = includedParser;
	};
	/**
	 * Parses a given script file.
	 * @param scriptFile string - Name of script file to parse.
	 */
	this.ParseScript = function( scriptFile, callback ){
		var self = this;
		fs.readFile( scriptFile, function( error, data ){
			if( error ) throw error;
			var script = self.ParseScriptString( data );
			if( callback != undefined ){
				callback( script );
			}
		} );
	};
	/**
	 * Parses a script from a string.
	 * @param scriptString string - Raw string of the script to parse.
	 */
	this.ParseScriptString = function( scriptString ){
		var scriptSettings = {
			rawScript:scriptString.toString(),
			endOfSource:scriptString.length,
			lineNumber:0
		};
		_tokenContainer = null;
		var script = _Tokenize.call( this, _interpreter.syntaxObject.script, scriptSettings );
		script.Execute();
		return script;
	};
	/**
	 * Call from another parser telling this parser to compile from syntax token using an existing script, and return the returns to the calling parser.
	 * @param subContainer Token - The token container to be attached.
	 * @param scriptSettings Object - The settings of the script from the caller.
	 */
	this.ParseIncludedInto = function( subContainer, scriptSettings ){
		var nScriptSettings = {};
		if( !scriptSettings.subScript ){
			for( i in scriptSettings ){
				nScriptSettings[i] = scriptSettings[i];
			}
			nScriptSettings.subScript = true;
		}
		else{
			nScriptSettings = scriptSettings;
		}
		_ProcessRuleGrammar.call( this, _interpreter.syntaxObject.syntax.grammar, subContainer, nScriptSettings );
	};

	//CALL TO CONSTRUCTOR//
	Constructor.call( this, arguments[0] );
	//CALL TO CONSTRUCTOR//
};
