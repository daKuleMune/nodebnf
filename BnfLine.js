/**
 * Types of tokens from (A)BNF Language Parser.
 */
const types = {
  identifier : 1,
  literal : 2,
  alt : 3,
  group : 4,
  optional : 5,
  repeats : 6,
  range : 7,
  subBnf : 8,
  not : 9
};
exports.types = types;

//This can be turned into the syntax rules that it produces and executed as a compiled language, @LHF.

/**
 * Compiles a single line of (A)BNF into a token map that can be distilled into a parser.
 */
exports.BnfLine = class BnfLine{
  /**
   * Constructor for BnfLine.
   * @param {string} bnfLineSyntax - The statement of (a)bnf syntax to compile into a token mapper.
   * @param {string[]} literalMap - Copy of literalMap for whole (a)bnf script, used to set literals when performing token extraction.
   */
  constructor( bnfLineSyntax, literalMap ){
    this.literalMap = literalMap;
    this.rawBnf = Buffer.from( bnfLineSyntax.trim() );
    this.rawStringBnf = bnfLineSyntax.trim();
    this.Tokenize();
  }

  Tokenize(){
    this._bnfTokens = [];
    this.seekPoint = 0;
    while( this.seekPoint < this.rawBnf.length ){
      if( this.rawBnf[this.seekPoint] === 0x3c/*<*/ ){ 
        this.seekPoint++;
        this._bnfTokens.push({
          type : types.identifier,
          value : this.GetIdentifier()
        });
        if( this.rawBnf[this.seekPoint] !== 0x3e/*>*/ ){
          throw "Bad identifier name";
        }
        this.seekPoint++;
      }
      else if( ( this.rawBnf[this.seekPoint] >= 0x41 && this.rawBnf[this.seekPoint] <= 0x5a )
        || ( this.rawBnf[this.seekPoint] >= 0x61 && this.rawBnf[this.seekPoint] <= 0x7a ) || this.rawBnf[this.seekPoint] === 0x5f/*_*/ ){
        this._bnfTokens.push({
          type : types.identifier,
          value : this.GetIdentifier()
        });
      }
      else if( this.rawBnf[this.seekPoint] === 0x40/*@*/){
        this.seekPoint++;
        this._bnfTokens.push({
          type : types.literal,
          value : this.literalMap[this.GetNumber()]
        });
      }
      else if( this.rawBnf[this.seekPoint] === 0x7c/*|*/ || this.rawBnf[this.seekPoint] === 0x2f/*/*/ ){
        this._bnfTokens.push({
          type : types.alt
        });
        this.seekPoint++;
      }
      else if( this.rawBnf[this.seekPoint] === 0x28/*(*/){
        this._bnfTokens.push({
          type : types.group,
          value : ( new BnfLine( this.GetInnerLine( 0x28/*(*/, 0x29/*)*/ ), this.literalMap ) ).GetTokenMap()
        });
      }
      else if( this.rawBnf[this.seekPoint] === 0x5b/*[*/){
        this._bnfTokens.push({
          type : types.optional,
          value : ( new BnfLine( this.GetInnerLine( 0x5b/*[*/, 0x5d/*]*/ ), this.literalMap ) ).GetTokenMap()
        });
      }
      else if( ( this.rawBnf[this.seekPoint] >= 0x30/*0*/ && this.rawBnf[this.seekPoint] <= 0x39/*9*/ ) || this.rawBnf[this.seekPoint] === 0x2a/***/ ){
        //TODO sure this rule up by making sure it can't be repeated one after another, which can yeild unexpected results.
        let from = 0;
        let to = -1;
        if( this.rawBnf[this.seekPoint] === 0x2a/***/ ){
          this.seekPoint++;
          to = this.GetNumber( -1 );
        }
        else{
          from = this.GetNumber();
          if( this.rawBnf[this.seekPoint] === 0x2a/***/ ){
            this.seekPoint++;
            to = this.GetNumber( -1 );
          }
          else{
            to = from;
          }
        }
        this._bnfTokens.push({
          type : types.repeats,
          value : [ from, to ]
        });
      }
      else if( this.rawBnf[this.seekPoint] === 0x25/*%*/ ){
        this.seekPoint++;
        let range = [ 0, 0 ];
        if( this.rawBnf[this.seekPoint] === 0x64/*d*/ || this.rawBnf[this.seekPoint] === 0x44/*D*/ ){
          this.seekPoint++;
          range = this.GetNumberRange( 'd' );
        }
        else if( this.rawBnf[this.seekPoint] === 0x62/*b*/ || this.rawBnf[this.seekPoint] === 0x42/*B*/ ){
          this.seekPoint++;
          range = this.GetNumberRange( 'b' );
        }
        else if( this.rawBnf[this.seekPoint] === 0x6f/*o*/ || this.rawBnf[this.seekPoint] === 0x4f/*O*/ ){
          this.seekPoint++;
          range = this.GetNumberRange( 'o' );
        }
        else if( this.rawBnf[this.seekPoint] === 0x78/*x*/ || this.rawBnf[this.seekPoint] === 0x58/*X*/ ){
          this.seekPoint++;
          range = this.GetNumberRange( 'x' );
        }
        else{
          throw "Bad syntax for terminal value";
        }

        this._bnfTokens.push({
          type : types.range,
          value : range
        });
      }
      else if( this.rawBnf[this.seekPoint] === 0x23/*#*/ ){
        this.seekPoint++;
        //Get Literal Until End//
        let bnfScript = this.GetIdentifier();
        this._bnfTokens.push({
          type : types.subBnf,
          value : bnfScript
        });
      }
      else if( this.rawBnf[this.seekPoint] === 0x21/*!*/ ){
        this.seekPoint++;
        this._bnfTokens.push({
          type : types.not
        });
      }
      else{
        this.seekPoint++;
      }
      
    }
  }

  GetTokenMap(){
    return this._bnfTokens;
  }

  GetInnerLine( digChar, endingChar ){
    let dig = 0;
    let peekChar = 1;
    while( ( ( this.rawBnf[this.seekPoint + peekChar] !== endingChar && dig === 0 ) || dig > 0 ) && this.seekPoint + peekChar !== this.rawBnf.length ){
      if( this.rawBnf[this.seekPoint + peekChar] === digChar ){
        dig++;
      }
      else if( this.rawBnf[this.seekPoint + peekChar] === endingChar ){
        dig--;
      }
      peekChar++;
    }

    let innerLine = this.rawStringBnf.substring( this.seekPoint + 1, this.seekPoint + peekChar );
    this.seekPoint += peekChar;
    return innerLine;
  }

  GetNumberRange( type ){
    let maxDigit = 0;
    let maxLetter = null;
    let parseDigets = 0;
    switch( type ){
      case "b":
        maxDigit = 1;
        parseDigets = 2;
        break;
      case "x":
        maxDigit = 9;
        maxLetter = 6;
        parseDigets = 16;
      break;
      case "o":
        maxDigit = 7;
        parseDigets = 8;
        break;
      case "d":
        maxDigit = 9;
        parseDigets = 10;
        break;
    }

    let charRange = [];
    for( let i = 0; i <= maxDigit; i++ ){
      charRange.push( 48 + i );
    }

    if( maxLetter !== null ){
      for( let i = 0; i <= maxLetter; i++ ){
        charRange.push( 65 + i );
        charRange.push( 97 + i );
      }
    }

    let peekChar = 0;
    while( charRange.indexOf( this.rawBnf[this.seekPoint + peekChar] ) !== -1 ){
      peekChar++;
    }

    let firstNumberString = this.rawStringBnf.substring( this.seekPoint, this.seekPoint + peekChar );
    let firstRealNumber = parseInt( firstNumberString, parseDigets );
    
    if( isNaN( firstRealNumber ) ){
      throw "First number in range was out of range or malformed.";
    }
    let secondRealNumber = firstRealNumber;
    this.seekPoint += peekChar;

    if( this.rawBnf[this.seekPoint] >= 0x2d/*-*/ ){
      this.seekPoint++;
      peekChar = 0;
      while( charRange.indexOf( this.rawBnf[this.seekPoint + peekChar] ) !== -1 ){
        peekChar++;
      }
      let firstNumberString = this.rawStringBnf.substring( this.seekPoint, this.seekPoint + peekChar );
      secondRealNumber = parseInt( firstNumberString, parseDigets );
      
      if( isNaN( secondRealNumber ) ){
        throw "Second number in range was out of range or malformed.";
      }

      this.seekPoint += peekChar;
    }

    return [ firstRealNumber, secondRealNumber ];
  }

  GetNumber( defaultReturn ){
    let peekChar = 0;
    while( this.rawBnf[this.seekPoint + peekChar] >= 0x30 && this.rawBnf[this.seekPoint + peekChar] <= 0x39 && this.seekPoint + peekChar !== this.rawBnf.length ){
      peekChar++;
    }

    let numberString = this.rawStringBnf.substring( this.seekPoint, this.seekPoint + peekChar );

    let realNumber = parseInt( numberString );
    if( isNaN( realNumber ) ){
      if( defaultReturn === undefined ){
        throw "Number was expected and was not found.";
      }
      realNumber = defaultReturn;
    }

    this.seekPoint += peekChar;
    return realNumber;
  }

  GetIdentifier(){
    let peekChar = 0;
    while( this.seekPoint + peekChar !== this.rawBnf.length ){
      let char = this.rawBnf[this.seekPoint + peekChar];
      if( ( char >= 0x41 && char <= 0x5a ) || ( char >= 0x61 && char <= 0x7a ) || char === 0x5f/*_*/
        || ( peekChar > 0 && ( ( char >= 0x30 && char <= 0x39 ) || char === 0x2d/*-*/ ) ) ){
        peekChar++;
      }
      else{
        break;
      }
    }

    let identifierBuffer = this.rawStringBnf.substring( this.seekPoint, this.seekPoint + peekChar );

    if( identifierBuffer === "" ){
      throw "Missing identifier";
    }

    this.seekPoint += peekChar;
    return identifierBuffer;
  }
}