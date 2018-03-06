const Token = require( "./Token" ).Token;

exports.Script = class Script{

  constructor( script, parser, dataObject ){
    this.rawScript = script;
    this.parser = parser;
    this.subscript = false;
    this.scriptBuffer = Buffer.from( script );
    this.rootToken = new Token( "SCRIPT", this, null );
  }

  get rules(){
    return this.parser.rules;
  }

  GetString( length, token ){
    let str = this.rawScript.substring( token.point, token.point + length );
    token.Seek( length );
    return str;
  }

  SubScript( language ){
    return new Script( this.rawScript, this.parser.compiler.parsers[language], {} );
  }

  get expected(){
    return this.rootToken.expected;
  }

}