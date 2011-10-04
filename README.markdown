NodeBNF
=======

NodeBNF is a script language parsing library. Programmed in JavaScript and tested with [nodeJS]( https://github.com/joyent/node). It was made to work with another project as a dependency for sub language processing in node.

Description
-----------

NodeBNF is both a framework for an interpreter, , [BNF]( http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form) compiler, and a language parser. It can use BNF or a custom JavaScript mark-up which was molded after BNF.

Working Parts
-------------

- BNF compiler:  Optionally taking raw BNF and turning it into a cached JavaScript file used by the language parser.
- Language parser: Using a custom JavaScript mark-up, the language parser converts scripts into a pre-interpreted collection of tokens, while at the same time checking for syntax correctness.
- Interpreter framework: Every interpreter wants to be different, and should be, as no language compiles or understands tokens in the same way. The framework binds actions to the tokens, and then calls the actions, which is a basic parsing style. The framework try's to speed this process up by putting the tokens in a tree shaped data pool.

Road Map
--------

- I personally like normal BNF, but I know ABNF offers some great advantages to writing a scripting language, so ABNF is going to be supported.
- Parsing text will be able to be done with regular expressions.
- The OR operation should set the syntax into groups so as only process each syntax layer only once.

Example of Use
--------------

### Install:

    npm install bnf

### Basic setup and usage:

    var Compiler = requre( "bnf" );
    var scriptText = "rule";
    var events = { "rule":function( token ){ console.log( "found rule" ); } };
    var parser = null;
    var script = null;
    var compiler = new Compiler( );
    compiler.CompileScript( "./languagefile.bnf", "cacheid", function( interpreter ){
        parser = compiler.CreateParser( interpreter, events );
        script = parser.ParseScriptString(scriptText);
    } );
    
### Multiple scripting language in one script:

    parser = compiler.CreateParser( interpreter, events );
    parser.IncludeLanguage( anotherParser );
    
    <bnf>
    <syntax> ::= <myscript> #otherScript | <myscript>
    
### See examples:

- [Calculator](https://github.com/navstev0/nodebnf/tree/master/examples/calculator)
- [Multi-Script](https://github.com/navstev0/nodebnf/tree/master/examples/multi-script)

License
-------
[OSL-3.0](http://www.opensource.org/licenses/OSL-3.0)

Copyright (c) 2011 by Steven Adams.