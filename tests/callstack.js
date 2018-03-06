const { Compiler } = require( "../Compiler" );

//This will overflow the callstack with the addition of just one parse char, and needs to be fixed.
//@TODO
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
    console.log( token.value );
    console.log( "evaluation token found answer:", eval( token.value ) );
  }
});


compiler.ParseScript( `
"asasdfasdfasdfasdfasdfasdffasdfasfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfadfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfsdfasfadfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfsdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdffasdfasdfasdfasdfasdfasdfadfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfsdfasdfasdfasdfasdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfasddfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasfasdfasdfasdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdfasdfasdfasdfasdfasdfasdfasdfasdffasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfdf asddfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdff asdfdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf asf asdf dfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf asdf asddfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdff asdf asdf dfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasd fasdfasd fasdfasdfasfasdfasdfasfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf" + "asdf" 
`.trim() );