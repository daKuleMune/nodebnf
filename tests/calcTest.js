const { Compiler } = require( "../Compiler" );

let calcSyntaxFinished = `
; syntax area
<SYNTAX> ::= 
  <expression> *( <CRLF> <expression> )
; expression of calculator
<expression>
  ::= <compisition> <OWSP> <type> <OWSP> <compisition>
<compisition> ::= #funcLang | <number>
<number>
  ::=
  <DIGITS> "." <DIGITS> | "." <DIGITS> | <DIGITS>; 'DIGITS' are a default rule syntax

; the types
<type> ::= "+" | "-" | '*' | "/"
`;
let funcLangSyntax = `
  <SYNTAX> ::= <mathLibAction>
  <mathLibAction> ::= <mathMethod> | <mathProperty>
  <mathProperty> ::= <methodName>
  <mathMethod> ::= <methodName> "(" <OWSP> ")"
  <methodName> ::= ( <ALPHA> | "_" ) *( <ALPHA> | <DIGIT> | "_" )
`;
let compiler = new Compiler();
compiler.AddLanguage( calcSyntaxFinished, "testLang" );
compiler.AddLanguage( funcLangSyntax, "funcLang" );

compiler.SetRuleEvents({
  mathLibAction( token ){
    token.SetValue( "Math." );
  },
  expression( token ){
    console.log( "TOKEN VALUE", token.value );
    console.log( "evaluation token found answer:", eval( token.value ) );
  }
});


compiler.ParseScript( `
1 + PI
`.trim() );
