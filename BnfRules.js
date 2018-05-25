//Some of these more complex rules can be removed if a token can generate a group rule. Once that is added they will be removed!
exports.bnfRules = {
  BLANK(){
    return true;
  },
  DIGIT( token ){
    if( token.CharCodeRange( 48, 57 ) ){
      token.SetChar();
      return true;
    }

    return false;
  },
  ALPHA( token ){
    if( token.CharCodeRange( 65, 90 ) || token.CharCodeRange( 97, 122 ) ){
      token.SetChar();
      return true;
    }

    return false;
  },
  SYMBOL( token ){
    if( token.CharIs( 33 )
      || token.CharCodeRange( 35, 38 )
      || token.CharCodeRange( 40, 47 )
      || token.CharCodeRange( 58, 64 )
      || token.CharIs( 91 )
      || token.CharCodeRange( 93, 95 )
      || token.CharCodeRange( 123, 126 ) ){
      token.SetChar();
      return true;
    }

    return false;
  },
  ANYCHAR( token ){
    return token.Or( [
      token.Rule( "ALPHA" ),
      token.Rule( "DIGIT" ),
      token.Rule( "SYMBOL" ),
      token.Rule( "ONEWSP" )
    ]);
  },
  //Should change to range rule @LHF
  DIGITS( token ){
    return token.Or( [
      token.Rule( "DIGIT" ),
      ( t ) => t.And( [ token.Rule( "DIGIT" ), token.Rule( "DIGITS" ) ] )
    ]);
  },
  NUMBER( token ){
    return token.Or( [
      ( t ) => t.And( [ t.Rule( "DIGITS" ), t.Grammar( "LITERAL", "." ), t.Rule( "DIGITS" ) ] ),
      ( t ) => t.And( [ t.Grammar( "LITERAL", "." ), t.Rule( "DIGITS" ) ] ),
      token.Rule( "DIGITS" )
    ]);
  },
  TAB( token ){
    return token.TryChar( 9 );
  },
  SPACE( token ){
    return token.TryChar( 32 );
  },
  //Should change to range rule @LHF
  WSP( token ){
    return token.Or( [
      token.Rule( "ONEWSP" ),
      ( t ) => t.And( [ token.Rule( "ONEWSP" ), token.Rule( "WSP" ) ] )
    ]);
  },
  //MIGHT BE REMOVED IN THIS MAJOR VERSION! DO NOT USE!
  ONEWSP( token ){
    return token.Or( [
      token.Rule( "SPACE" ),
      token.Rule( "TAB" )
    ]);
  },
  CR( token ){
    return token.TryChar( 13 );
  },
  LF( token ){
    return token.TryChar( 10 );
  },
  CRLF( token ){
    return token.Or( [
      ( t ) => t.And( [ t.Rule( "CR" ), t.Rule( "LF" ) ] ),
      token.Rule( "CR" ),
      token.Rule( "LF" )
    ]);
  },
  OWSP( token ){
    return token.Or( [
      token.Rule( "WSP" ), token.Rule( "BLANK" )
    ]);
  },
  BLANK( token ){
    return true;
  },
  //MIGHT BE REMOVED IN THIS MAJOR VERSION! DO NOT USE!
  ONEWSPCRLF( token ){
    return token.Or( [
      token.Rule( "ONEWSP" ), token.Rule( "CRLF" )
    ]);
  },
  //MIGHT BE REMOVED IN THIS MAJOR VERSION! DO NOT USE!
  ONEORMOREWSP( token ){
    return token.Or( [
      token.Rule( "ONEWSPCRLF" ),
      ( t ) => t.And( [ token.Rule( "ONEWSPCRLF" ), token.Rule( "ONEORMOREWSP" ) ] )
    ]);
  },
  ANYWSP( token ){
    return token.Or( [
      token.Rule( "ONEORMOREWSP" ), token.Rule( "BLANK" )
    ]);
  },
  ESCAPE( token ){
    return token.TryChar( 92 );
  },
  QUOTE( token ){
    return token.TryChar( 34 );
  },
  SQUOTE( token ){
    return token.TryChar( 39 );
  },
  AQUOTE( token ){
    return token.TryChar( 96 );
  },
  ESCQUOTE( token ){
    return token.TryString( Buffer.from( [ 92, 34 ] ) );
  },
  ESCSQUOTE( token ){
    return token.TryString( Buffer.from( [ 92, 39 ] ) );
  },
  ESCAQUOTE( token ){
    return token.TryString( Buffer.from( [ 92, 96 ] ) );
  },
  //DO BE REMOVED IN THIS MAJOR VERSION! DO NOT USE!
  SQEANYCHAR( token ){
    return token.Or( [
      token.Rule( "ESCSQUOTE" ),
      token.Rule( "ANYCHAR" ),
      token.Rule( "QUOTE" ),
      token.Rule( "AQUOTE" ),
      token.Rule( "ESCAPE" )
    ]);
  },
  //DO BE REMOVED IN THIS MAJOR VERSION! DO NOT USE!
  SQLITERALCHARS( token ){
    return token.Or( [
      token.Rule( "SQEANYCHAR" ),
      ( t ) => t.And( [ token.Rule( "SQEANYCHAR" ), token.Rule( "SQLITERALCHARS" ) ] )
    ]);
  },
  SQLITERAL( token ){
    return token.And( [
      token.Rule( "SQUOTE" ),
      token.Rule( "SQLITERALCHARS" ),
      token.Rule( "SQUOTE" )
    ]);
  },
  //DO BE REMOVED IN THIS MAJOR VERSION! DO NOT USE!
  QEANYCHAR( token ){
    return token.Or( [
      token.Rule( "ESCQUOTE" ),
      token.Rule( "ANYCHAR" ),
      token.Rule( "SQUOTE" ),
      token.Rule( "AQUOTE" ),
      token.Rule( "ESCAPE" )
    ]);
  },
  //DO BE REMOVED IN THIS MAJOR VERSION! DO NOT USE!
  QLITERALCHARS( token ){
    return token.Or( [
      token.Rule( "QEANYCHAR" ),
      ( t ) => t.And( [ token.Rule( "QEANYCHAR" ), token.Rule( "QLITERALCHARS" ) ] )
    ]);
  },
  QLITERAL( token ){
    return token.And( [
      token.Rule( "QUOTE" ),
      token.Rule( "QLITERALCHARS" ),
      token.Rule( "QUOTE" )
    ]);
  },
  //DO BE REMOVED IN THIS MAJOR VERSION! DO NOT USE!
  AQEANYCHAR( token ){
    return token.Or( [
      token.Rule( "ESCAQUOTE" ),
      token.Rule( "ANYCHAR" ),
      token.Rule( "SQUOTE" ),
      token.Rule( "QUOTE" ),
      token.Rule( "CRLF" ),
      token.Rule( "ESCAPE" )
    ]);
  },
  //DO BE REMOVED IN THIS MAJOR VERSION! DO NOT USE!
  AQLITERALCHARS( token ){
    return token.Or( [
      token.Rule( "AQEANYCHAR" ),
      ( t ) => t.And( [ token.Rule( "AQEANYCHAR" ), token.Rule( "AQLITERALCHARS" ) ] )
    ] );
    /*
    This should work as the new way of doing an AQLITERALCHAR which can then be moved into AQLITERAL which is planned to remain.
    return token.Grammar( "RANGE", {
      rule : ( t ) =>
        t.Grammar( "GROUP", ( t1 ) =>
          t1.Or( [
            t1.Rule( "ESCAQUOTE" ),
            t1.Rule( "ANYCHAR" ),
            t1.Rule( "SQUOTE" ),
            t1.Rule( "QUOTE" ),
            t1.Rule( "CRLF" ),
            t1.Rule( "ESCAPE" )
          ] )
        ),
      range : [ 1, -1 ]
    } );
    */
  },
  AQLITERAL( token ){
    return token.And( [
      token.Rule( "AQUOTE" ),
      token.Rule( "AQLITERALCHARS" ),
      token.Rule( "AQUOTE" )
    ]);
  },
  LITERAL( token ){
    return token.Or( [
      token.Rule( "SQLITERAL" ),
      token.Rule( "QLITERAL" )
    ]);
  },
  ANYLITERAL( token ){
    return token.Or( [
      token.Rule( "SQLITERAL" ),
      token.Rule( "QLITERAL" ),
      token.Rule( "AQLITERAL" )
    ]);
  },
  EOF( token ){
    if( token.point === token.eof || token.script.subscript ){
      return true;
    }

    return false;
  },
  SCRIPT( token ){
    return token.And( [ token.Rule( "SYNTAX" ), token.Rule( "EOF" ) ] );
  }
};

exports.parserRules = {
  "&OR"( token ){
    let rules = token.ruleSyntax;
    let resetPoint = token.point;
    let tokenPoints = {};
    for( let i = 0; i < rules.length; i++ ){
      token.point = resetPoint;
      tokenPoints[i] = {
        result : rules[i]( token ),
        point : token.point
      };
      
      token._tokenTrees.push( [] );
      token._currentTokenTree = token._tokenTrees[token._tokenTrees.length - 1];
    }
    let topWeightIndex = -1;
    let topWeight = -1;
    for( let i = 0; i < token._tokenTrees.length - 1; i++ ){
      if( tokenPoints[i].result === true ){
        let weight = 0;
        token._tokenTrees[i].map( x => weight += x.weight );
        if( weight > topWeight ){
          topWeight = weight;
          topWeightIndex = i;
        }
      }
    }

    if( topWeightIndex !== -1 ){
      token.point = tokenPoints[topWeightIndex].point;
      token._tokenTrees[0] = token._tokenTrees[topWeightIndex];
      return true;
    }
    else{
      //This can be optimized @LHF
      for( let i = 0; i < token._tokenTrees.length - 1; i++ ){
        for( let t = 0; t < token._tokenTrees[i].length; t++ ){
          for( let line in token._tokenTrees[i][t].expected ){
            for( let char in token._tokenTrees[i][t].expected[line] ){
              for( let x = 0; x < token._tokenTrees[i][t].expected[line][char].length; x++ ){
                token.AddExpected( token._tokenTrees[i][t].expected[line][char][x], line, char );
              }
            }
          }
        }
      }
      token._tokenTrees[0] = [];
      
      return false;
    }
  },
  "&AND"( token ){
    let rules = token.ruleSyntax;
    let resetPoint = token.point;
    for( let i = 0; i < rules.length; i++ ){
      if( !rules[i]( token ) ){
        token.point = resetPoint;
        return false;
      }
    }
    
    return true;
  },
  "&LITERAL"( token ){
    let scriptLit = token.GetLitString( token.ruleSyntax.length );
    if( token.ruleSyntax === scriptLit ){
      token.SetValue( token.ruleSyntax );
      return true;
    }
    else{
      token.AddExpected( token.ruleSyntax );
      return false;
    }
  },
  "&OPTIONAL"( token ){
    return token.Or( [
      token.ruleSyntax,
      token.Rule( "BLANK" )
    ]);
  },
  "&GROUP"( token ){
    return token.ruleSyntax( token );
  },
  "&RANGE"( token ){
    if( token.ruleSyntax[0] === token.ruleSyntax[1] ){
      return token.TryChar( token.ruleSyntax[0] );
    }
    else{
      return token.TryCharRange( token.ruleSyntax[0], token.ruleSyntax[1] );
    }
  },
  "&NOT"( token ){
    return !token.ruleSyntax( token );
  },
  "&REPEAT"( token ){
    while( token.ruleSyntax.rule( token ) ){
    }
    //Somehow the group def needs to be preservered to know the syntax that was expected.
    let expected = token._currentTokenTree[0].name;
    token._currentTokenTree.splice( token._currentTokenTree.length - 1, 1 );
    let result = token._currentTokenTree.length >= token.ruleSyntax.range[0] && ( token.ruleSyntax.range[1] === -1 || token._currentTokenTree.length <= token.ruleSyntax.range[1] );

    if( !result ){
      token.AddExpected( "Repeating " + expected + " " + token.ruleSyntax.range[0] + "-" + ( token.ruleSyntax.range[1] === -1 ? "any" : token.ruleSyntax.range[1] ) );
    }
    return result;
  },
  "&SCRIPT"( token ){
    let script = token.script.SubScript( token.ruleSyntax );
    script.subscript = true;
    script.rootToken.point = token.point;
    let result = script.rootToken.Evaluate();
    token._currentTokenTree.push( script.rootToken );
    script.rootToken.parent = token;
    if( result ){
      token.point = script.rootToken.endPoint;
      return true;
    }

    token.AddExpected( "Language " + token.ruleSyntax );
    return false;
  }
};