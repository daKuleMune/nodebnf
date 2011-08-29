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
 * 
 */

/**
 * Language object to be interpreted by
 */
exports.languageObject = function( ){
	var Constructor = function( name ){
		_name = name;
	};
	
	var _lastId = 1;
	
	this.syntaxObject = { syntax:{ id: 0 } };
	var _tokenIdList = {};
	this.ruleList = { and:2, or:1, norule:0, optional:3 };
	
	function argumentArray( arguments ){
		var argumentArray = [];
		for( var i = 0; i < arguments.length; i++ ){
			argumentArray.push( arguments[i] );
		}
		return argumentArray;
	};
	/**
	 * Short cut for creating a "and" rule.
	 * @param [mixed][...] 
	 */
	this.Or = function( ){
		return { type:this.ruleList.or, syntax:argumentArray(arguments) };
	};
	/**
	 * Short cut for creating a "and" rule.
	 * @param [mixed][...] 
	 */
	this.And = function( ){
		return { type:this.ruleList.and, syntax:argumentArray(arguments) };
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
	
	this.FireToken = function( token ){
		for( var i = 0; i < _tokenIdList[token.id].binding.length; i++ ){
			token.fired = true;
			_tokenIdList[token.id].binding[i](token);
		}
	};
	
	this.AddRule = function( rule, id ){
		id = id || _lastId;
		_lastId = id + 1;
		this.syntaxObject[rule] = { id:id };
	};
	
	this.AddTokenEventById = function( tokenId, event ){
		_AddTokenEvent.call( this, _tokenIdList[tokenId], event );
	};
	
	this.AddTokenEventByName = function( tokenName, event ){
		_AddTokenEvent.call( this, this.syntaxObject[tokenName], event );
	};
	
	this.AddTokenEventByToken = function( token, event ){
		_AddTokenEvent.call( this, token, event );
	};
	
	function _AddTokenEvent( token, event ){
		token.binding.push(event);
	};
	
	this.IndexTokenIdList = function( ){
		for( var i in this.syntaxObject ){
			_tokenIdList[this.syntaxObject[i].id] = this.syntaxObject[i];
		}
	};
	
	Constructor.call( this, arguments[0] );
};

	/**
	 * Token object class.
	 * @returns {Token}
	 */
Token = function( ){
		/**
		 * Constructor of the class
		 * @param name
		 * @param id
		 * @param charPtr
		 * @bug If the object is not "this" then node sees it as global space.
		 */
		function Constructor( tokenName, id, charPtr ){
			this.name = tokenName;
			this.id = id;
			this.charPtr = charPtr;
		};
		this.name = "";
		this.id = -1;
		this.text = "";
		this.tokens = [];
		this.charPtr = 0;
		this.length = 0;
		this.validated = false;
		this.offset = -1;
		this.fired = false;
		this.validations = 0;
		
		Constructor.call( this, arguments[0], arguments[1], arguments[2] );
	}
	



exports.parser = function( ){
	
	function Constructor( interpreter ){
		_interpreter = interpreter;
		_rl = _interpreter.ruleList;
	};
	var _interpreter = null;
	var _rawScript = "";
	var _endOfSource = 0;
	var _charPtr = 0;
	var _tokenContainer;
	var _lineNumber = 1;
	var _rulePath = null;
	var _rl = null;
	
	this.ParseScript = function( scriptFile ){
		var self = this;
		fs.readFile( scriptFile, function( error, data ){
			if( error ) throw error;
			self.ParseScriptString( data );
		} );
	};
	
	this.ParseScriptString = function( scriptString ){
		_rawScript = scriptString.toString();
		_endOfSource = scriptString.length;
		_charPtr = 0;
		_lineNumber = 1;
		_tokenContainer = null;
		_Tokenize.call( this, _interpreter.syntaxObject.syntax );
		_Execute.call( this );
	};
	
	/**
	 * Tokenizes the file and prepares it for execution.
	 * @param rulePath
	 */
	function _Tokenize( rulePath ){
		
		//Generate the core token//
		var ruleToken = _GenerateToken( _interpreter.syntaxObject.syntax, _charPtr );
		
		//Go over token rules in the core grammar//
		_ProcessRuleGrammar.call( this, rulePath.grammar, ruleToken );
		
		//Did our script return valid?//
		if( ruleToken.validated ){
			if( ruleToken.length !=_endOfSource ){
				//There was more in the file then we recall adding?//
				console.log( "Erroneous data at end of file which will no be compiled." );
			}
			
			_tokenContainer = ruleToken;
		}
	};
	
	function _Execute(){
		if( _tokenContainer != null ){
			var token = null;
			while( ( token = _interpreter.GetToken( _tokenContainer ) ) != null ){
				/* Token received */
			}
		}
	};
	
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
	
	function _CheckNextSyntaxLevel( level ){
		
	};
	
	/**
	 * Generates the trees of possible paths that can be taken to come to a result.
	 * @param grammar
	 * @todo this method is not implemented or test fully
	 */
	function _GenerateOrTrees( grammar, complexLayer ){
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
	};
	
	function _GenerateToken( rulePath, charPtr ){
		var token = new Token( rulePath.name, rulePath.id, charPtr );
		return token;
	};
	
	Constructor.call( this, arguments[0] );
};