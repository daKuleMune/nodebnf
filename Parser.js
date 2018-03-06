const { Script } = require( "./Script" );
const { Token } = require( "./Token" );
const { TokenTree } = require( "./TokenTree");
const { types } = require( "./BnfLine" );

exports.Parser = class Parser{
  constructor( language, compiler ){
    this.compiler = compiler;
    this.rules = {};
    this.language = language;
    this._GenerateSyntaxParseMap();
  }

  ParseScript( rawScript, dataObject, execute = true ){
    let script = new Script( rawScript, this, dataObject );
    //Generate tokens and validate grammar//
    if( script.rootToken.Evaluate() ){
      //Run the token tree as pass 2
      let scriptTokenTree = new TokenTree( script.rootToken, dataObject, this.compiler, this );
      if( execute ){
        scriptTokenTree.Execute();
      }
      
      return scriptTokenTree;
    }
    else{
      console.error( "Couldn't execute script:" );
      console.error( this._BuildExpectedOutput( script ) );
      console.error( script.rawScript );
      return null;
    }
  }

  _BuildExpectedOutput( script ){
    let lines = Object.keys( script.expected ).sort();
    let errorLine = lines[lines.length - 1];
    let chars = Object.keys( script.expected[errorLine] ).sort();
    let errorChar = chars[chars.length - 1];
    let options = script.expected[errorLine][errorChar];
    let longOption = 0;
    options.map( x => longOption = ( x.length > longOption ) ? x.length : longOption );
    let found = script.rawScript.split( "\n" )[errorLine - 1].substring( errorChar - 1, (errorChar - 1) + longOption );
    for( let o = 0; o < options.length; o++ ){
      if( o === options.length - 1 ){
        options[o] = "or '" + options[o] + "'";
      }
      else{
        options[o] = "'" + options[o] + "'";
      }
      
    }
    return "Expected [ " + options.join( ", " ) + " ] @" + errorLine + ":" + errorChar + " encountered '" + found + "'.";
  }

  _BuildRule( ruleName ){
    //Right now all syntax is stored in strings, this can be quite a hit for large script files, an indexer should be run on the rules to improve performance. @LHF
    let syntax = this.language.rules[ruleName];

    let ruleMap = this._BuildSyntaxFromBnfLine( syntax );

    this.rules[ruleName] = ruleMap;
    
  }

  _BuildSyntaxFromBnfLine( syntaxLine ){
    let orArray = [];
    let currentAnd = [];
    let rangeData = null;
    let notRule = null;

    for( let i = 0; i < syntaxLine.length; i++ ){
      if( syntaxLine[i].type === types.alt ){
        orArray.push( currentAnd );
        currentAnd = [];
      }
      else{
        let newRule = null;
        switch( syntaxLine[i].type ){
          case types.group:
            newRule = this._GenerateGrammarRule( this._BuildSyntaxFromBnfLine( syntaxLine[i].value ), "GROUP" );
            break;
          case types.optional:
            newRule = this._GenerateGrammarRule( this._BuildSyntaxFromBnfLine( syntaxLine[i].value ), "OPTIONAL" );
            break;
          case types.literal:
            newRule = this._GenerateGrammarRule( syntaxLine[i].value, "LITERAL" );
            break;
          case types.identifier:
            newRule = this._GenerateNamedRule( syntaxLine[i].value );
            break;
          case types.repeats:
            rangeData = syntaxLine[i].value;
            break;
          case types.range:
            newRule = this._GenerateGrammarRule( syntaxLine[i].value, "RANGE" );
            break;
          case types.subBnf:
            newRule = this._GenerateGrammarRule( syntaxLine[i].value, "SCRIPT" );
            break;
          case types.not:
            notRule = syntaxLine[i];
            break;
          default:
            console.log( "UNHANDELED RULE TYPE", syntaxLine[i].type );
            break;
        }

        if( newRule !== null ){
          if( rangeData === null && notRule === null ){
            currentAnd.push( newRule );
          }
          else if( notRule !== null ){
            currentAnd.push( this._GenerateGrammarRule( newRule, "NOT" ) );
            notRule = null;
          }
          else{
            currentAnd.push( this._GenerateGrammarRule( { rule : newRule, range : rangeData }, "REPEAT" ) );
            rangeData = null;
          }
        }
      }
    }

    orArray.push( currentAnd );

    return ( orArray.length === 1 ) ? this._GenerateGrammarRule( orArray[0], "AND" ) : this._GenerateGrammarRule( orArray.map( x => this._GenerateGrammarRule( x, "AND" ) ), "OR" );
  }

  _GenerateNamedRule( ruleName ){
    return ( token ) => {
      return token.Rule( ruleName )( token );
    };
  }

  _GenerateGrammarRule( ruleSyntax, ruleName ){
    return ( token ) => {
      return token.Grammar( ruleName, ruleSyntax )( token );
    };
  }

  _GenerateSyntaxParseMap(){
    for( let rule in this.language.rules ){
      this._BuildRule( rule );
    }
  }
}