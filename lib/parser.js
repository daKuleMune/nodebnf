/*!
 * Javascript BNF Parser
 * @version 0.0.1
 */

/**
 * Library version.
 */
exports.version = '0.0.6';
var fs = require('fs');

Array.prototype.clone = function() { return this.slice(0); };

/**
 * @todo - There can be a faster way to search or in character data by grouping letters A-Z = 60-90 >< compare rather then is x sizeof
 */

/**
 * Language object to be interpreted by
 * @see LanguageObject.Constructor
 */
exports.LanguageObject = function( ){
	/////////////////////
//////PRIVATE VARIABLES//
	/////////////////////
	/**
	 * The last id that was iterated
	 * @type integer
	 */
	var _lastId = 1;
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
	 * Constructor of the object
	 * @param name string - The name of the language to be interpreted.
	 */
	var Constructor = function( name ){
		_name = name;
	};
	/**
	 * Binds an event to a token type.
	 * @param token Object( @see syntaxObject ) - The token type to bind the event to.
	 * @param event Function - The method to bind to the token type.
	 */
	function _AddTokenEvent( token, event ){
		token.binding.push(event);
	};
	////////////////////
//////PUBLIC VARIABLES//
	////////////////////
	/**
	 * An enumeration of the types of allowed rule types.
	 * @type Associative Array
	 */
	this.ruleList = { and:2, or:1, norule:0, optional:3 };
	/**
	 * All the grammar for the language, in an associative array, where the name the rest is an object by type.
	 * @todo make a object for reference of what can go into these objects.
	 * @type Associative Array
	 */
	this.syntaxObject = { syntax:{ id: 0 } };
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
	/**
	 * Executes any methods/events bound to the token.
	 * @param token Token - The token with bound events.
	 */
	this.FireToken = function( token ){
		for( var i = 0; i < _tokenIdList[token.id].binding.length; i++ ){
			token.fired = true;
			_tokenIdList[token.id].binding[i](token);
		}
	};
	/**
	 * Gets the next token from the token requested, could be self or one of children.
	 * @param token Token - The token to use as the point to search.
	 * @returns Token - The token that was next in line for execution.
	 */
	this.GetToken = function( token ){
		var firedToken = null;
		if( token.offset == -1 ){
			token.offset = 0;
			firedToken = token;
		}
		else{
			if( token.offset < token.tokens.length ){
				firedToken = this.GetToken( token.tokens[token.offset] );
				if( firedToken == null && token.offset + 1 < token.tokens.length ){
					token.offset++;
					firedToken = this.GetToken( token.tokens[token.offset] );
				}
			}
			else{
				firedToken = null;
			}
		}
		if( firedToken != null && firedToken.fired == false ){
			this.FireToken( firedToken );
		}
		return firedToken;
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
	 * Short cut for creating a "and" rule.
	 * @param [mixed][...] - More rules
	 */
	this.Or = function( ){
		return { type:this.ruleList.or, syntax:_ArgumentArray.call( this, arguments ) };
	};
	
	//@TODO ABNF notations
	/*this.Optional = function( ){
		return { type:this.ruleList.optional, syntax:arguments };
	};
	
	this.Repeat = function( ){
		return { type:4, syntax:arguments };
	};
	
	this.Group = function( ){
		return { type:5, syntax:arguments };
	};*/
	
	/**
	 * Gets the next token by name, moving the execution forward.
	 * @param token Token - Token of children tokens to search.
	 * @param tokenToFind string - The name of the token.
	 * @returns Token - The token found or null.
	 */
	this.SeekTokenByName = function( token, tokenToFind ){
		var foundToken = false;
		var reToken = null;
		while( !foundToken && ( reToken = this.GetToken( token ) ) != null ){
			if( reToken.name == tokenToFind ){
				foundToken = true;
			}
		}
		
		return reToken;
	};
	/**
	 * Writes a grammar rule into the syntax.
	 * @param rule string - The name of the syntax to write the rule into
	 * @param syntax mixed - The collection of rules and sub rules @see LanguageObject.And, LanguageObject.Or
	 */
	this.WriteRule = function( rule, syntax ){
		var self = this;
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
 * Token object class.
 * @see Token.Constructor
 */
Token = function( ){
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
	 * Name of the type of token.
	 * @type string
	 */
	this.name = "";
	/**
	 * The id of the type of token.
	 * @type integer
	 */
	this.id = -1;
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
	/**
	 * Point in the raw source where the token starts.
	 * @type integer
	 */
	this.charPtr = 0;
	/**
	 * Length of the text in the token and its children.
	 * @deprecated can do a string check on check for length.
	 * @type integer
	 */
	this.length = 0;
	/**
	 * Check to see if the token validated.
	 * @type boolean
	 */
	this.validated = false;
	/**
	 * Execution offset, to check which child is next in the execution tree.
	 * @type integer
	 */
	this.offset = -1;
	/**
	 * Did the token fire? Preventing it from firing twice.
	 * @type boolean
	 */
	this.fired = false;
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
exports.parser = function( ){
	/////////////////////
//////PRIVATE VARIABLES//
	/////////////////////
	/**
	 * Interpreter and language object used to parse, and then execute the script.
	 * @type LanguageObject
	 */
	var _interpreter = null;
	/**
	 * Raw script file in string from for parsing.
	 * @type string
	 */
	var _rawScript = "";
	/**
	 * The length equal to the end of the raw source.
	 * @type integer
	 */
	var _endOfSource = 0;
	/**
	 * Syntax token from the source, which holds all other tokens for execution.
	 * @type Token
	 */
	var _tokenContainer;
	/**
	 * The current line number.
	 * @deprecated should be recored inside the tokens.
	 * @type integer
	 */
	var _lineNumber = 1;
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
	 * The constructor of the object
	 * @param interpreter LanguageObject - The interpreter and language object used to parse, and then execute the script.
	 */
	function Constructor( interpreter ){
		_interpreter = interpreter;
		_rl = _interpreter.ruleList;
	};
	/**
	 * Gets the each token on a executable script, causing the interpreter to fire the bound methods or events.
	 */
	function _Execute(){
		if( _tokenContainer != null ){
			var token = null;
			while( ( token = _interpreter.GetToken( _tokenContainer ) ) != null ){
				/* Token received */
			}
		}
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
	function _GenerateToken( rulePath, charPtr ){
		var token = new Token( rulePath.name, rulePath.id, charPtr );
		return token;
	};
	/**
	 * Attempts to create a token at the given grammar rule set and add it to the parent token.
	 * @param grammar Object - The grammar rule to parse the raw script with.
	 * @param ruleContainer Token - The parent token which will contain the parsed script token.
	 */
	function _ProcessRuleGrammar( grammar, ruleContainer ){
		switch( grammar.type ){
			case _rl.and:
				ruleContainer.validated = true;
				var oldCharPtr = ruleContainer.charPtr;
				var eLength = ruleContainer.length;
				var eText = ruleContainer.text;
				var eTokens = [];//ruleContainer.tokens;
				var validations = 0;
				for( var i = 0; i < grammar.syntax.length && ruleContainer.validated == true; i++ ){
					if( grammar.syntax[i].id != undefined ){ //Grammar object
						var ruleToken = _GenerateToken.call( this, grammar.syntax[i], oldCharPtr );
						_ProcessRuleGrammar.call( this, grammar.syntax[i].grammar, ruleToken );
						if( ruleToken.validated ){
							eTokens.push( ruleToken );
							eLength += ruleToken.length;
							oldCharPtr += ruleToken.length;
							eText += ruleToken.text;
							validations++;
						}
						else{
							ruleContainer.validated = false;
						}
					}
					else if( grammar.syntax[i].type != undefined ){ //Multi-level grammar
						_ProcessRuleGrammar.call( this, grammar.syntax[i], ruleContainer );
					}
					else{ //Text
						if( _rawScript.substr( oldCharPtr, grammar.syntax[i].length ) == grammar.syntax[i] ){
							eLength += grammar.syntax[i].length;
							eText += _rawScript.substr( oldCharPtr, grammar.syntax[i].length );
							oldCharPtr += 1;
							validations++;
						}
						else{
							ruleContainer.validated = false;
						}
					}
				}
				if( ruleContainer.validated == true ){
					ruleContainer.length = eLength;
					ruleContainer.text = eText;
					ruleContainer.validations = validations;
					for( var t = 0; t < eTokens.length; t++ ){
						ruleContainer.tokens.push( eTokens[t] );
					}
				}
				break;
			case _rl.or:
				//@todo set the syntax into groups so we only process each syntax layer once//
				//var groups = _GenerateOrTrees( grammar, 1 );
				//Which one matches the most by a degree of complexity//
				var bestSubcommand = ruleContainer;
				for( var i = 0; i < grammar.syntax.length; i++ ){
					var subContainer = { length: ruleContainer.length, charPtr:ruleContainer.charPtr , text:ruleContainer.text , tokens:[], validations:0, validated:false };
					if( grammar.syntax[i].id ){ //Grammar object
						var ruleToken = _GenerateToken.call( this, grammar.syntax[i], subContainer.charPtr );
						_ProcessRuleGrammar.call( this, grammar.syntax[i].grammar, ruleToken );
						if( ruleToken.validated ){
							subContainer.tokens.push( ruleToken );
							subContainer.length += ruleToken.length;
							subContainer.text += ruleToken.text;
							subContainer.validated = true;
							subContainer.validations++;
						}
					}
					else if( grammar.syntax[i].type ){ //Multi-level grammar
						_ProcessRuleGrammar.call( this, grammar.syntax[i], subContainer );
					}
					else{ //Text
						if( _rawScript.substr( subContainer.charPtr, subContainer.length + grammar.syntax[i].length ) == grammar.syntax[i] ){
							validatedRule = i;
							subContainer.length += grammar.syntax[i].length;
							subContainer.text += _rawScript.substr( subContainer.charPtr, subContainer.length );
							subContainer.validated = true;
							subContainer.validations++;
						}
						else{
							//console.log( "validation of text " + _rawScript.substr( ruleContainer.charPtr, ruleContainer.length + grammar.syntax[i].length ) + " to " + grammar.syntax[i] + " failed" );
						}
					}
					
					if( subContainer.validated && subContainer.validations > bestSubcommand.validations ){
						bestSubcommand = subContainer;
					}
				}
				if( bestSubcommand.validated ){
					ruleContainer.length = bestSubcommand.length;
					ruleContainer.text = bestSubcommand.text;
					ruleContainer.validated = bestSubcommand.validations;
					ruleContainer.validated = true;
					for( var t = 0; t < bestSubcommand.tokens.length; t++ ){
						ruleContainer.tokens.push( bestSubcommand.tokens[t] );
					}
				}
				break;
		};
		
	};
	/**
	 * Tokenizes the file and prepares it for execution, or outputs the errors of why the script failed to parse.
	 * @param rulePath Object( @see syntaxObject ) - The syntax object rule path to start the parser.
	 */
	function _Tokenize( rulePath ){
		
		//Generate the core token//
		var ruleToken = _GenerateToken( _interpreter.syntaxObject.syntax, 0 );
		
		//Go over token rules in the core grammar//
		_ProcessRuleGrammar.call( this, rulePath.grammar, ruleToken );
		
		//Did our script return valid?//
		if( ruleToken.validated ){
			if( ruleToken.length !=_endOfSource ){
				//There was more in the file then we recall adding?//
				console.log( "Erroneous data at end of file which will not be compiled." );
			}
			
			_tokenContainer = ruleToken;
		}
		else{
			console.log( "Script didn't evaluate correctly." );
		}
	};
	//////////////////
//////PUBLIC METHODS//
	//////////////////
	/**
	 * Parses a given script file.
	 * @param scriptFile string - Name of script file to parse.
	 */
	this.ParseScript = function( scriptFile ){
		var self = this;
		fs.readFile( scriptFile, function( error, data ){
			if( error ) throw error;
			self.ParseScriptString( data );
		} );
	};
	/**
	 * Parses a script from a string.
	 * @param scriptString string - Raw string of the script to parse.
	 */
	this.ParseScriptString = function( scriptString ){
		_rawScript = scriptString.toString();
		_endOfSource = scriptString.length;
		_lineNumber = 1;
		_tokenContainer = null;
		_Tokenize.call( this, _interpreter.syntaxObject.syntax );
		_Execute.call( this );
	};
	
	//CALL TO CONSTRUCTOR//
	Constructor.call( this, arguments[0] );
	//CALL TO CONSTRUCTOR//
};