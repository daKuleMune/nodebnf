const Language = require( "./Language" ).Language;
const Parser = require( "./Parser" ).Parser;

exports.Compiler = class Compiler{
  constructor(){
    this.languages = {};
    this.parsers = {};
    this.events = {};
    this.languageEvents = {};
    this.defaultLanguage = null;
  }

  AddLanguage( abnfSyntax, languageId, setAsDefault = false ){
    this.languages[languageId] = new Language( abnfSyntax, languageId );
    this.languageEvents[languageId] = {};
    if( this.defaultLanguage === null || setAsDefault ){
      this.defaultLanguage = languageId;
    }

    this.parsers[languageId] = new Parser( this.languages[languageId], this );
  }

  Trigger( languageId, token, dataObject, tokenTree ){
    if( this.languageEvents[languageId][token.name] ){
      this.languageEvents[languageId][token.name]( token, dataObject, tokenTree );
    }
    if( this.events[token.name] ){
      this.events[token.name]( token, dataObject, tokenTree );
    }
  }

  SetRuleEvents( ruleEventMap, languageId = null ){
    if( languageId !== null ){
      this.languageEvents[languageId] = Object.assign( this.languageEvents[languageId], ruleEventMap );
    }
    else{
      this.events = Object.assign( this.events, ruleEventMap );
    }
  }

  AddRuleEvent( ruleName, event, languageId = null ){
    if( languageId !== null ){
      this.languageEvents[languageId][ruleName] = event;
    }
    else{
      this.events[ruleName] = event;
    }
  }

  ParseScript( script, dataObject = {}, languageId = null ){
    languageId = languageId || this.defaultLanguage;
    return this.parsers[languageId].ParseScript( script, dataObject );
  }
}