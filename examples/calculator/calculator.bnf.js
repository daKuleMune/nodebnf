var languageObject = require( "../../lib/parser.js" ).LanguageObject;
var i = new languageObject( "calculator" );

var r = i.syntaxObject;

i.AddRule( "expression" );
i.AddRule( "number" );
i.AddRule( "type" );
i.AddRule( "nextLine" );
i.AddRule( "posNumber" );
i.AddRule( "negNumber" );
i.AddRule( "digit" );
i.AddRule( "digits" );
i.IndexTokenIdList();

i.WriteRule( "rule", i.Or( r.expression, i.And( r.expression, r.nextLine, r.rule ) ) );
i.WriteRule( "expression", i.And( r.number, r.type, r.number ) );
i.WriteRule( "number", i.Or( r.posNumber, r.negNumber ) );
i.WriteRule( "posNumber", r.digits );
i.WriteRule( "negNumber", i.And( "-", r.digits ) );
i.WriteRule( "digits", i.Or( r.digit, i.And( r.digit, r.digits ) ) );
i.WriteRule( "digit", i.Or( "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" ) );
i.WriteRule( "type", i.Or( "+", "-", "*", "/" ) );
i.WriteRule( "nextLine", i.Or( i.And( "\r", "\n" ), "\n" ) );

exports.interpreter = i;