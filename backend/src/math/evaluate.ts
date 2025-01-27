import { Summand } from './types';
const operators = new Set(['+', '-', '*', '/']);

// isValidOperation checks if the operation is a allowed mathematical expression
function isValidOperation(operation: string): boolean {
    const cleanedOperation = operation.replace(/ /g,''); // remove all spaces
    if (cleanedOperation.length === 0) {
        return false;
    }
    if (!allowedChars(cleanedOperation)) {
        return false;
    }
    if (!noAdjacentOperators(cleanedOperation)) {
        return false;
    }
    if (noOperatorsAtTheEnd(cleanedOperation)) {
        return false;
    }
    return true;
}

function allowedChars(operation: string): boolean {
    return /^[\d+\-*/.]+$/.test(operation);
}

function noAdjacentOperators(operation: string): boolean {
    for (let i = 0; i < operation.length - 1; i++) {
        if (operators.has(operation[i]) && operators.has(operation[i + 1])) {
            return false;
        }
    }
    return true;
}

function noOperatorsAtTheEnd(operation: string): boolean {
    return operators.has(operation[operation.length - 1]);
}

// evaluate evaluate a mathematical expression
function evaluate(s: string): string {
    if (!isValidOperation(s)) {
        throw new Error('Invalid command');
    }
    s = s.replace(/ /g,''); // remove all spaces
    
    const summands = parseExpression(s);
    const fractions = summands.map(expMD => expMD.toFraction());
    const first = fractions.shift();
    if (!first) {
        return "0"
    }
    // early return
    if (fractions.length === 0) {
        return first.evaluate()
    }
    const result = fractions.reduce((acc, f) =>  acc.add(f), first);
    return result.evaluate().toString();
}

// parseExpression parse the expression into list of Summand
const parseExpression = (s: string): Summand[] => {
    const summands: Summand[] = [];
    let currExp = "";
    let prevOp = true;
    if (s[0] === '-') {
        prevOp = false;
        s = s.slice(1);
    }
    for (const token of s.split('')) {
        if (token === '+') {
            summands.push(new Summand(prevOp, currExp));
            prevOp = true
            currExp = "";
        } else if (token === '-') {
            summands.push(new Summand(prevOp, currExp));
            prevOp = false;
            currExp = "";
        } else {
            currExp += token;
        }
    }
    summands.push(new Summand(prevOp, currExp)); // last token
    return summands;
}

export { evaluate };