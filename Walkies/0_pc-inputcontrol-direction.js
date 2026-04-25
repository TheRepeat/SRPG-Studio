/*
* By PCMATH
* Default cursor behaviour is static priority with certain directions having higher priority, leading to ghost key presses
* This plugin changes to most recent input priority and only resorts to base static priority when all else fails
* 
* Function(s) overridden without alias:
*  * InputControl.getInputType
*
* No credit: OK
* Modify: OK
* Share: OK
*/

function makeDirectionalInputFunction(type1, type2) {
	function directionalInputFunction() {
		if (root.isInputState(type1) && root.isInputState(type2)) {
			return InputType.NONE;
		}
		if (root.isInputState(type1)) {
			return type1;
		}
		if (root.isInputState(type2)) {
			return type2;
		}

		return InputType.NONE;
	}

	return directionalInputFunction;
};

InputControl._getInputTypeLeftRight = makeDirectionalInputFunction(InputType.LEFT, InputType.RIGHT);
InputControl._getInputTypeUpDown = makeDirectionalInputFunction(InputType.UP, InputType.DOWN);

InputControl.registerAndReturnInput = function (result) {
	// pure inputs are registered so as to be overwritten
	this._previousInput = result;

	return result;
}

InputControl.getInputType = function () {
	var inputLeftRight = this._getInputTypeLeftRight();
	var inputUpDown = this._getInputTypeUpDown();

	if (inputLeftRight === InputType.NONE) {
		return this.registerAndReturnInput(inputUpDown);
	}
	if (inputUpDown === InputType.NONE) {
		return this.registerAndReturnInput(inputLeftRight);
	}

	// neither is none so we handle double input
	// switch to alternative input
	if (inputLeftRight === this._previousInput) {
		return inputUpDown;
	}
	if (inputUpDown === this._previousInput) {
		return inputLeftRight;
	}

	// if everything fails, use default logic
	var inputType = InputType.NONE;

	if (root.isInputState(InputType.LEFT)) {
		inputType = InputType.LEFT;
	}
	else if (root.isInputState(InputType.UP)) {
		inputType = InputType.UP;
	}
	else if (root.isInputState(InputType.RIGHT)) {
		inputType = InputType.RIGHT;
	}
	else if (root.isInputState(InputType.DOWN)) {
		inputType = InputType.DOWN;
	}

	return inputType;
};


