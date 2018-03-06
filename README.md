BNF
=======

BNF is a script language parsing library for JavaScript and tested with NodeJS. Re-writen from scatch to allow for ABNF and to utilize ECMA 6+.

### Description

BNF is both a framework for an interpreter, [BNF]( http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form) compiler, and a language parser. It can use BNF, ABNF, or a blend of the two. The prior version used a custom JavaScript mark-up which was molded after BNF to interpret script files, this feature was removed in favor of inline compiling.

------------------------------------

### Predefined Rules
* BLANK : ''
* CR : '\r'
* LF : '\n'
* CRLF : CR LF | CR | LF
* DIGIT : 1-0
* DIGITS : 1*DIGIT
* NUMBER : DIGITS [ "." DIGITS ] | "." DIGITS
* WSP : 1*(SPACE | TAB)
* TAB : '\t'
* SPACE : ' '
* OWSP : WSP | BLANK
* ANYWSP : *( CRLF | WSP )
* ALPHA : A-Z a-z
* SYMBOL : !@#$%^&...ect. Does not include '\', ''', '"', or '`'
* ESCAPE : '\'
* QUOTE : '"'
* SQUOTE : '''
* AQUOTE : '`'
* ANYCHAR : CHAR | DIGIT | SYMBOL
* SQLITERAL : SQUOTE *( ( ESCAPE SQUOTE ) | ANYCHAR | QUOTE | AQUOTE | ESCAPE ) SQUOTE
* QLITERAL : QUOTE *( ( ESCAPE QUOTE ) | ANYCHAR | SQUOTE | AQUOTE| ESCAPE ) QUOTE
* AQLITERAL : AQUOTE *( ( ESCAPE AQUOTE ) | ANYCHAR | SQUOTE | QUOTE | CRLF| ESCAPE ) AQUOTE
* LITERAL : SQLITERAL | QLITERAL
* ANYLITERAL : AQLITERAL | SQLITERAL | QLITERAL
* EOF : End of the file.
* SCRIPT : The whole script, which is SYNTAX EOF.
* SYNTAX : The syntax body for the script. The BNF script must declare this.

------------------------------------

### Supported Syntax
    
* BNF
  - `<rule> ::= <expression> | "literal"`

* ABNF                
  - `rule = expression / "literal"`

* Groups
  - `rule = ( expression | ... )`

* Optional
  - `rule = [ expression ... ]`

* Repeats
  - `rule = 1*2expression`
  - `rule = *2expression`
  - `rule = 1*expression`
* Char Lookups
  - `rule = %x0-ff`
  - `rule = %xff`
* Not ( Should be used in an AND where a char is allowed so long as it is not a sequence )
  - `rule = !"}}" %x7d`

------------------------------------

### Example of Use

#### Install:

    npm install bnf

#### Basic setup and usage:

    let compiler = new Compiler();
    compiler.AddLanguage( `
      <SYNTAX> ::= <evaluation> | <evaluation> <CRLF> <SYNTAX>
      <evaluation> ::= <number> <OWSP> <type> <OWSP> <number>
      <number> ::= <DIGITS>
      <type> ::= "+" | "-" | "/" | "*"
    `, "testLang" );
    compiler.SetRuleEvents({
      evaluation( token ){
        console.log( "evaluation token found answer:", eval( token.value ) );
      }
    });

    compiler.ParseScript( `
    5456 / 13
    11 + 3
    10 * 8
    `.trim() );
    
#### Multiple scripting language in one script:

In the first versions of BNF it was supported to be able to change in and out of languges though the course of a single script. This feature will be kept, the following is the plan for use, however not implmented yet.

    compiler.AddLanguage( ..., "otherScript" );

    <SYNTAX> ::= <myscript> #otherScript | <myscript>

### See examples:

- [Calculator](https://github.com/navstev0/nodebnf/tree/master/examples/calculator)
- [JSON](https://github.com/navstev0/nodebnf/tree/master/examples/json)
- [Multi-Script](https://github.com/navstev0/nodebnf/tree/master/examples/multi-script)

------------------------------------

### Status
The BNF and ABNF parser and compiler work great!

With the following caviot: custom BNF rules can be written into the engine, however the way tokens work with rules is going to be changing over the course of this minor version. This will break and uses of custom rules. At the end of this major version custom rules will be fully supported.

### @LHF
This is a part of the code that has a weak level of optimizations and is considered low hanging fruit for fixes that can improve performance.
