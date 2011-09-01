NodeBNF
=======

NodeBNF is a language parsing library, and interpreter framework. Programmed in JavaScript and tested with [nodeJS]( https://github.com/joyent/node). It was made to work with another project as a dependency for sub language processing in node.

Description
-----------

NodeBNF is both a framework for an interpreter, and a language parser. It's using at this time a custom JavaScript mark-up which was molded after [BNF]( http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form).

Parts
-----

- Language parser: Using a custom JavaScript mark-up the language parser converts scripts into a pre-interpreted collection of tokens, while at the same time checking for syntax correctness.
- Interpreter framework: Every interpreter wants to be different, and should be, as no language compiles or understands tokens in the same way. The framework binds actions to the tokens, and then calls the actions, which is a basic parsing style. The framework try's to speed this process up by putting the tokens in a tree shaped data pool.

Road Map
--------

- At this time the language parser reads a custom JavaScript API, however when the project was envisioned it was to read files of true BNF grammar. It will very soon be able to do that in both real time, and compile BNF grammar files into the optimized JavaScript API.
- I personally like normal BNF, but I know ABNF offers some great advantages to writing a scripting language, so ABNF is going to be supported.
- Parsing text will be able to be done with regular expressions.
- More optimizations are already TODO'd and will be done.

TODO
----

- The OR operation should set the syntax into groups so as only process each syntax layer once.

License
-------
[OSL-3.0](http://www.opensource.org/licenses/OSL-3.0)

Copyright (c) 2011 by Steven Adams.