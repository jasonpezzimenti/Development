var identifier = "",
	string = "",
	character,
	previous,
	next,
	position = 0,
	quoteFound = false,
	identifierFound = false,
	isInsideString = false,
	isConcatenating = false,
	endOfStringReached = false,
	concatenationOperatorFound = false,
	expectingStringOrIdentifier = false,
	expectingNumberOrIdentifier = false,
	expectingParameters = false,
	actionOperatorFound = false;

for(var index = 0; index < SALT.input.length; index++) {
	position = index;
	character = SALT.input[position];
	
	if(SALT.Helpers.isLetter(character)) {
		string += character;
		
		if(!isInsideString) {
			if(expectingParameters) {
				identifierFound = true;
				identifier += character;
			}
			else {
				identifierFound = true;
				identifier += character;
			}
		}

		if(character === SALT.symbols.whiteSpace) {
			if(!isInsideString) {
				if(string !== "") {
					SALT.tokens.push(string);
				}

				SALT.tokens.push(SALT.symbols.whiteSpace);
			}
		}
		
		if(SALT.Helpers.isReservedKeywordOrOperator(string)) {
			switch(string) {
				case SALT.operators.out:
					SALT.tokens.push(SALT.operators.out);
					string = "";
				break;
				case SALT.operators.return:
					SALT.tokens.push(SALT.operators.return);
					string = "";
				break;
				case SALT.keywords.with:
					SALT.tokens.push(SALT.keywords.with);
					string = "";
					expectingStringOrIdentifier = true;
				break; 
			}
		}
		else {
			
		}
	}
	else if(SALT.Helpers.isDigit(character)) {
		if(isInsideString) {
			string += character;
		}
		else{
			if(identifierFound) {
				string += character;
			}

			expectingNumberOrIdentifier = true;
		}
	}
	else if(SALT.Helpers.isSymbol(character)) {
		switch(character) {
			case SALT.symbols.hyphen:
				if(expectingNumberOrIdentifier) {
					expectingNumberOrIdentifier = true;
					if(string !== "") {
						SALT.tokens.push(string);
						string = character;
						SALT.tokens.push(string);
						string = "";
					}
				}
				else {
					string += character;
					previous = character;

					next = SALT.input[++position];
					if(identifierFound && next === SALT.symbols.closingAngleBracket) {
						identifierFound = false;
						SALT.tokens.push(identifier);
						SALT.tokens.push(SALT.operators.actionOperator);
						identifier = "";
						string = "";
					}
				}				
			break;
			case SALT.symbols.closingAngleBracket:
				if(isInsideString) {
					string += character;
				}
				else {
					if(previous === SALT.symbols.hyphen) {
						string += character;
						if(string === SALT.operators.actionOperator) {
							SALT.tokens.push(SALT.operators.actionOperator);
							string = "";
							actionOperatorFound = true;
						}
					}
				}
			break;
			case SALT.operators.assignmentOperator:
				if(identifier !== null) {
					SALT.tokens.push(identifier);
					SALT.tokens.push(SALT.operators.assignmentOperator);
					identifierFound = true;
					string = "";
				}
			break;
			case SALT.symbols.openingParenthesis:
				if(identifierFound) {
					string += character;
					SALT.tokens.push(identifier);
					SALT.tokens.push(SALT.symbols.openingParenthesis);
					string = "";
					expectingParameters = true;
				}
			break;
			case SALT.symbols.closingParenthesis:
				if(identifierFound) {
					
					SALT.tokens.push(string);
					SALT.tokens.push(SALT.symbols.closingParenthesis);
					string = "";
					expectingParameters = false;
					identifier = "";
					identifierFound = false;

				}
			break;
			case SALT.symbols.openingBrace:
				if(isInsideString) {
					string += character;
				}
				else {
					isInsideScope = true;
					// string += character;
					SALT.tokens.push(SALT.symbols.openingBrace);
					string = "";
				}
			break;
			case SALT.symbols.closingBrace:
				if(!isInsideString) {
					isInsideScope = false;
					SALT.tokens.push(SALT.symbols.closingBrace);
				}
				else {
					string += character;
				}
			break;
			case SALT.symbols.comma:
				if(expectingParameters) {
					// string += character;
					SALT.tokens.push(string);
					SALT.tokens.push(SALT.symbols.comma);
					// console.log(string);
					string = "";
					identifier = "";
				}
			break;
			case SALT.symbols.doubleQuote:
				if(!isInsideString) {
					isInsideString = true;
					
					if(identifierFound) {
						SALT.tokens.push(SALT.symbols.doubleQuote);
						identifierFound = false;
						identifier = "";
					}
					else {
						SALT.tokens.push(SALT.symbols.doubleQuote);
					}
				}
				else {
					if(previous === SALT.symbols.backSlash) {
						string += character;
						previous = "";
					}
					else {
						if(string !== "") {
							SALT.tokens.push(string);
						}
						SALT.tokens.push(SALT.symbols.doubleQuote);
						string = "";
						isInsideString = false;
					}
					
					if(identifierFound) {
						string += character;
					}
				}
			break;
			case SALT.symbols.backSlash:
				if(isInsideString) {
					if(previous === SALT.symbols.backSlash) {
						string += character;
					}
					
					previous = SALT.symbols.backSlash;
				}
			case SALT.symbols.EOS:
				if(identifierFound) {
					if(string !== "") {
						SALT.tokens.push(string);
						identifierFound = false;
						identifier = "";
					}
					
					identifierFound = false;
					expectingStringOrIdentifier = false;
					isInsideString = false;
					string = "";
					identifier = "";
				}

				SALT.tokens.push(SALT.symbols.EOS);
			break;
			case SALT.operators.concatenationOperator:
				expectingStringOrIdentifier = true;
				if(string !== "") {
					SALT.tokens.push(string);
				}

				string = "";
				SALT.tokens.push(SALT.operators.concatenationOperator);
			break;
			case SALT.operators.additionOperator:
				expectingNumberOrIdentifier = true;
				if(string !== "") {
					SALT.tokens.push(string);
				}

				string = "";
				SALT.tokens.push(SALT.operators.concatenationOperator);
			break;
			case SALT.operators.multiplicationOperator:
				expectingNumberOrIdentifier = true;
				if(string !== "") {
					SALT.tokens.push(string);
					string = character;
					SALT.tokens.push(string);
					string = "";
				}
			break;
			case SALT.operators.subtractionOperator:
				expectingNumberOrIdentifier = true;
				if(string !== "") {
					SALT.tokens.push(string);
					string = character;
					SALT.tokens.push(string);
					string = "";
				}
			break;
			case SALT.operators.divisionOperator:
				expectingNumberOrIdentifier = true;
				if(string !== "") {
					SALT.tokens.push(string);
					string = character;
					SALT.tokens.push(string);
					string = "";
				}
			break;
			case SALT.operators.modulusOperator:
				expectingNumberOrIdentifier = true;
				if(string !== "") {
					SALT.tokens.push(string);
					string = character;
					SALT.tokens.push(string);
					string = "";
				}
			break;
			case SALT.symbols.whiteSpace:
				if(isInsideString) {
					string += character;
				}
			break;
			default:
				if(isInsideString) {
					string += character;
				}
			break;
		}
	}
}

console.log(SALT.tokens);
