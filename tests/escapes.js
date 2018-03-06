const { Compiler } = require( "../Compiler" );

let testSyntax = `
<SYNTAX> ::= <evaluation> | <evaluation> <CRLF> <SYNTAX>
<evaluation> ::= <combinator> <OWSP> <type> <OWSP> <combinator>
<combinator> ::= <LITERAL>
<type> ::= "+"
`
let compiler = new Compiler();
compiler.AddLanguage( testSyntax, "testLang" );

compiler.SetRuleEvents({
  //number( token, dataPool ){
  //  console.log( "number token found", token.value );
  //},
  evaluation( token ){
    //console.log( token.tokens[token.tokens.length - 1] );
    console.log( token.value ); //@TODO values are not keeping escaped quotes//
    console.log( "evaluation token found answer:", eval( token.value ) );
  }
});


compiler.ParseScript( `
  "test" + "tes\\\"t"
`.trim() );
