//Import compiler//
const { Compiler } = require( "../../Compiler" );

//Load bnf file, this can be done inline//
let bnf = require( "fs" ).readFileSync( __dirname + "/json.mbnf" ).toString();

//Instance a BNF compiler//
let compiler = new Compiler();

//Add new language for the bnf//
compiler.AddLanguage( bnf, "json" );

//Set the execute rules
compiler.SetRuleEvents({
  jsonObject( token, dataObject ){
    dataObject.objects.push( token.value.replace( /\n/g, "" ).trim() );
  },
  jsonArray( token, dataObject ){
    dataObject.arrays.push( token.value.replace( /\n/g, "" ).trim() );
  },
  jsonProperty( token, dataObject ){
    dataObject.properties.push( token.Child("jsonPropertyName").value.trim() );
  }
});

//Set up data storage for parser//
let parserSavedData = {
  properties : [],
  arrays : [],
  objects : []
};

//Parse the script
compiler.ParseScript( `
[
  "test",
  1234,
  {
    "otherTest" : "place",
    "innerTester" : 1234,
    "innerArray" : [ "a", "b", "c" ],
    "innerObject" : { }
  }
]
`.trim(), parserSavedData );

//Review data saved during parser step//
console.log( parserSavedData );