const READ_LINE = require('readline');

const REGULAR_EXPRESSION_SPACE = ' ';
const REGULAR_EXPRESSION_OPERATION_ = /^(((\d{1,})_)?(\d{1,})\/(\d{1,}))\s{1,}([+\-*\/])\s{1,}(((\d{1,})_)?(\d{1,})\/(\d{1,}))$/;

const FIRST_VALUE_POSITION = 0;
const OPERATOR_POSITION = 1;
const SECOND_VALUE_POSITION = 2;

const FIRST_WHOLE_NUMBER_POSITIION = 3;
const FIRST_NUMERATOR_POSITIION = 4;
const FIRST_DENOMINATOR_POSITIION = 5;

const SECOND_WHOLE_NUMBER_POSITIION = 9;
const SECOND_NUMERATOR_POSITIION = 10;
const SECOND_DENOMINATOR_POSITIION = 11;

const COMMAND_LINE = READ_LINE.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const grabInputValues = (input) => {
    return input.match(REGULAR_EXPRESSION_OPERATION_);
}

const standardize = (whole_number, numerator, denominator) => {
    // If a whole number is involved, convert the input to a fraction
    // Else, return the inputs
    // ie, 
    // 5_1/2 => (2 * 5) + 1 => 11/2

    if(whole_number) {
        return {numerator: (denominator * whole_number) + numerator, denominator};
    } else {
        return {numerator, denominator}; 
    }
}

const simplify = (numerator, denominator) => {
    if  (numerator % denominator === 0) {
        return `${numerator / denominator}/${denominator / denominator}`
    }

    let whole_number, number, divisor;

    if (numerator > denominator) {
        whole_number = Math.floor(numerator / denominator);
        number  = divisor = numerator % denominator;
    }

    while(divisor > 1) {
        if ((number % divisor === 0) && (denominator % divisor === 0)) {
            break;
        }

        divisor--;
    }

    if(numerator > denominator) {
        return `${whole_number}_${number/divisor}/${denominator/divisor}`;
    } else {
        return  `${number/divisor}/${denominator/divisor}`;
    }
}

const addOrSubtract = (left, right, operator) => {
    let output = {};
    let lcm = (left.denominator > right.denominator) ? left.denominator : right.denominator;

    while (true) {
        if (!(lcm % left.denominator) && !(lcm % right.denominator)) {
            break;
        }

        lcm++;
    }

    const left_multiplier = lcm / left.denominator;
    const right_multiplier = lcm / right.denominator;

    if(operator === '+') {
        output.numerator = (left.numerator * left_multiplier) + (right.numerator * right_multiplier)
    } else {
        output.numerator = (left.numerator * left_multiplier) - (right.numerator * right_multiplier)
    }

    output.denominator = lcm;

    return output;

}

const multiply = (first_fraction, second_fraction) => {
    const numerator = first_fraction.numerator * second_fraction.numerator;
    const denominator = first_fraction.denominator * second_fraction.denominator; 
    return { numerator, denominator} 
}

const validate = (value_one, value_two) => {
    if(value_one && value_two) {
        if (value_one !== value_two) {
            console.warn(`Validation failed! ${value_one} is not equal to ${value_two}.\n`);
        } else {
            console.log(`Validation Successful! ${value_one} is the correct answer.\n`);
        }
    } else {
        console.warn(`Validation failed! Undefined or empty string provided.\n`);
    }
}

const processInput = (input) => {
    if(!input) {
        console.warn('Result: No input provided');
        return;
    }

    input = input.trim();
    const values = input.split(REGULAR_EXPRESSION_SPACE);

    if(!values || !values.length || values.length !== 3) {
        console.warn('Result: Improper format used for input.');
        return;
    }

    try {
        const first_input = values[FIRST_VALUE_POSITION];
        const operator = values[OPERATOR_POSITION];
        const second_input = values[SECOND_VALUE_POSITION];
    
        if(first_input[first_input.length - 1] == 0) {
            console.warn('Result: Illegal Fraction Found! First input value contains a 0 denominator.');
            return;
        } else if(second_input[second_input.length - 1] == 0) {
            console.warn('Result: Illegal Fraction Found! Second input value contains a 0 denominator.');
            return;
        }

        console.log(`Will process the following... First Value: ${first_input}; Operation: ${operator}; Second Value: ${second_input}`);

        let result;
        let first_whole_number;
        let first_input_numerator;
        let first_input_denominator;
        let second_whole_number;
        let second_input_numerator;
        let second_input_denominator;
    
        const input_values = grabInputValues(input);
    
        if(!input_values) {
            console.warn('Result: Invalid input provided');
            return;
        }
    
        if(input_values[FIRST_WHOLE_NUMBER_POSITIION]) {
            first_whole_number = parseInt(input_values[FIRST_WHOLE_NUMBER_POSITIION]);
        }
    
        if(input_values[SECOND_WHOLE_NUMBER_POSITIION]) {
            second_whole_number = parseInt(input_values[SECOND_WHOLE_NUMBER_POSITIION]);
        }
    
        first_input_numerator = parseInt(input_values[FIRST_NUMERATOR_POSITIION]);
        first_input_denominator = parseInt(input_values[FIRST_DENOMINATOR_POSITIION]);
        second_input_numerator = parseInt(input_values[SECOND_NUMERATOR_POSITIION]);
        second_input_denominator = parseInt(input_values[SECOND_DENOMINATOR_POSITIION]);
    
        const first_fraction = standardize(first_whole_number, first_input_numerator, first_input_denominator);
        const second_fraction = standardize(second_whole_number, second_input_numerator, second_input_denominator);
    
        if(operator === '+' || operator === '-') { 
            result = addOrSubtract(first_fraction, second_fraction, operator); 
        } else if(operator === '*') {
            result = multiply(first_fraction, second_fraction); 
        } else if(operator === '/') {
            if(second_fraction.numerator > 0) {
                result = multiply(first_fraction, {
                    numerator: second_fraction.denominator, 
                    denominator: second_fraction.numerator
                }); 
            } else {
                console.warn('Result: Division by zero is not allowed')
            }
            
        } else {
            console.warn('Result: Unsupported operation.')
            return;
        }
    
        console.log(`Result: ${result.numerator}/${result.denominator}`);

        if(result.numerator === result.denominator) {
            console.log(`Whole Number Found: 1`);
        } else if((result.numerator % result.denominator)  === 0) {
            console.log(`Whole Number Found: ${result.numerator / result.denominator}`);
        }

        const simplified = simplify(result.numerator, result.denominator);
        console.log(`Fraction Result: ${simplified}.`);

        return simplified;   
    } catch (error) {
        console.error('Errored during processing', error);
    }
}

// Samples Provided In Email Plus Added Test Cases 
/*
let test_case;
test_case = processInput('');
validate(test_case, '');

test_case = processInput('1');
validate(test_case, '');

test_case = processInput('6_8/1 / 1/0');
validate(test_case, undefined);

test_case = processInput('6_8/1 + 7_9/3');
validate(test_case, '24/1');

test_case = processInput('2/2 + 4/2');
validate(test_case, '3/1');

test_case = processInput('1/1 - 1/1');
validate(test_case, '0/1');

test_case = processInput('1/2 + 1/2');
validate(test_case, '1/1');

test_case = processInput('1/2 * 3_3/4');
validate(test_case, '1_7/8');

test_case = processInput('2_3/8 + 9/8');
validate(test_case, '3_1/2');

test_case = processInput('1_4/2 - 2/2');
validate(test_case, '2/1');
*/
  
COMMAND_LINE.question(`Provide input calculation: `, calculation => {
    console.log(`Calculating answer for ${calculation} ..... `);

    processInput(calculation);
    COMMAND_LINE.close();
});