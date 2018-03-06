exports.TokenTree = class TokenTree{

  constructor( rootToken, dataObject, compiler, parser ){
    this.dataObject = dataObject;
    this.compiler = compiler;
    this.languageId = parser.language.name;
    this.rootToken = rootToken;
    this.currentToken = null;
    this._PurgeRules( this.rootToken );
  }

  Execute(){
    while( this.Eat() !== false ){

    }
  }

  _PurgeRules( token ){
    let filter = null;
    
    while( ( filter = token.tokens.filter( x => x.name.startsWith( "&" ) ) ).length > 0 ){
      if( filter[0].name === "&LITERAL" ){
        filter[0].name = "GRAMMAR";
      }
      else{
        let insertPoint = token.tokens.indexOf( filter[0] );
        filter[0].tokens.map( x => x.parent = token );
        if( filter[0]._value ){
          filter[0].parent._value = ( filter[0].parent._value !== null ) ? filter[0].parent._value + filter[0]._value : filter[0]._value;
        }
        token.tokens.splice.apply( token.tokens, [ insertPoint, 1 ].concat( filter[0].tokens ) );
      }
    }

    token.tokens.map( ( x ) => {
      this._PurgeRules( x );
    } );
  }

  Consume( untilTokenType ){
    let token = null;
    while( ( token = this.Eat() ) !== false && token.name !== untilTokenType ){

    }

    return token;
  }

  Read( untilTokenType ){
    let token = this.currentToken;

    while( ( token = this._GetTokenAfter( token ) ) !== false && token.name !== untilTokenType ){

    }

    if( token !== null && token.name === untilTokenType ){
      return token;
    }

    return null;
  }

  Reset(){

  }

  _GetFirstToken( token ){
    if( token.tokens.length > 0 ){
      return this._GetFirstToken( token.tokens[0] );
    }

    return token;
  }

  _GetNextToken(){
    if( this.currentToken === null ){
      //First token
      return this._GetFirstToken( this.rootToken );
    }
    else{
      return this._GetTokenAfter( this.currentToken );
    }
  }

  _GetTokenAfter( currentToken ){
    if( currentToken.parent !== null ){
      let tokenLocal = currentToken.parent.tokens.indexOf( currentToken );
      if( currentToken.parent.tokens.length > tokenLocal + 1 ){
        return this._GetFirstToken( currentToken.parent.tokens[tokenLocal + 1] );
      }
      else{
        return currentToken.parent;
      }
    }
    else{
      return null;
    }
  }

  Eat( trigger = true ){
    let token = this._GetNextToken();

    if( token !== null ){
      this.currentToken = token;
      token.expended = true;
      if( token.parent !== null ){
        token.parent.consumerIndex++;
      }
      this.compiler.Trigger( this.languageId, token, this.dataObject, this );
      return token;
    }

    return false;
  }

  Peek(){
    return this._GetNextToken();
  }

};