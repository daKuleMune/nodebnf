const BnfLine = require( "./BnfLine" ).BnfLine;
const types = require( "./BnfLine" ).Types;

exports.Language = class Language{
  constructor( abnfSyntax, languageId ){
    this.name = languageId;
    this._lineIndex = 0;
    this._charPosition = 0;
    this._rawSyntaxArray = [];
    this._literalMap = [];
    this._CreateSyntaxLines( abnfSyntax );
    this._rawSyntax = this._rawSyntaxArray.join( "\n" );
    try{
      this._CreateRuleList();
    }
    catch( ex ){
      console.error( "Unable to compile language (a)bnf." );
      console.error( ex );
      console.error( "\nSYNTAX:\n" + this._rawSyntax.trim() );
    }
    
  }

  _CreateRuleList(){
    this.rules = {};
    let ruleBuilder = [];
    let match;
    let namePattern = /<*([A-z_][A-z_\-\d]*)>*[\s\n]*:{0,2}=/mg;
    while ((match = namePattern.exec(this._rawSyntax)) != null) {
      let name = match[1];
      ruleBuilder.push( {
        name,
        startAt : match.index,
        endAt : this._rawSyntax.length
      });
      if( ruleBuilder.length != 1 ){
        ruleBuilder[ruleBuilder.length - 2].endAt = ruleBuilder[ruleBuilder.length - 1].startAt - 1;
      }
    }

    ruleBuilder.map( x => this._AddRule( x.name, this._BuildSyntax( this._rawSyntax.substring( x.startAt, x.endAt ).replace( /\n/g, " " ).trim() ) ) );

  }

  _AddRule( ruleName, ruleSyntax ){
    if( this.rules[ruleName] === undefined ){
      this.rules[ruleName] = ruleSyntax;
    }
    else{
      if( ruleSyntax[0].type !== types.alt ){
        throw "Duplicate definition of rule: '" + ruleName + "'";
      }
      else{
        this.rules[ruleName] = this.rules[ruleName].concat( ruleSyntax );
      }
    }
  }

  _BuildSyntax( rawSyntax ){
    let ruleSyntax = rawSyntax.split( "=" )[1].trim();
    let rule = { rawSyntax : ruleSyntax };
    try{
      let bnfLine = new BnfLine( ruleSyntax, this._literalMap );
      rule.syntax = bnfLine.GetTokenMap();
    }
    catch( ex ){
      throw "Unable to build bnf line syntax for rule " + rawSyntax + "\nerror: " + ex;
    }

    return rule.syntax;
  }

  _MapLiterals( syntax ){
    let literals = syntax.raw.match( /['"][^'"]*['"]/gi );
    if( literals === null ){
      return [];
    }
    else{
      let ret = [];
      literals.map( ( x ) => {
        let literal = x.substring( 1, x.length - 1 );
        if( literal === "" ){
          syntax.raw = syntax.raw.replace( x, "<BLANK>" );
        }
        else{
          syntax.raw = syntax.raw.replace( x, "@" + ( ret.length + this._literalMap.length ) );
        }
        ret.push( literal );//Trim to quotes away //Turn into a buffer//
      } );

      return ret;
    }
  }

  _PrepareLine( rawSyntax ){
    let syntax = {
      raw : rawSyntax
    };
    let literals = this._MapLiterals( syntax );
    if( syntax.raw.indexOf( ";" ) !== -1 ){
      syntax.raw = syntax.raw.substring( 0, syntax.raw.indexOf( ";" ) );
    }
    
    let literalMatch = syntax.raw.match( /@\d+/g ) || [];
    if( literals.length > literalMatch.length ){
      literals.splice( literalMatch.length, literals.length - literalMatch.length );
    }

    this._literalMap = this._literalMap.concat( literals );

    let preparedLine = {
      line : this._lineIndex++,
      charPosition : this._charPosition,
      original : rawSyntax,
      syntax : this._TrimSyntax( syntax ),
    }

    this._rawSyntaxArray.push( preparedLine.syntax );

    this._charPosition += preparedLine.syntax.length + 1;

    return preparedLine;
  }

  _TrimSyntax( syntax ){
    syntax.raw = syntax.raw.trim();
    if( syntax.raw === "" ){
      return "";
    }

    if( syntax.raw.startsWith( ';' ) ){
      return "";
    }

    return syntax.raw;
  }

  _CreateSyntaxLines( abnfSyntax ){
    let literalIndex = 0;
    this._syntaxLines = abnfSyntax.replace( /\r/gi, "" ).split( "\n" )
    .map( ( x ) => this._PrepareLine( x ) );
  }
}