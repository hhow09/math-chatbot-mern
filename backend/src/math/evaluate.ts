import { Summand } from './types';
const operators = new Set(['+', '-', '*', '/']);

// isValidCommand checks if the command is a allowed mathematical expression
function isValidCommand(s: string): boolean {
    s = s.replace(/ /g,''); // remove all spaces
    if (s.length === 0) {
        return false;
    }
    // allowed characters: 0-9, +, -, *, /, .
    const regex = /^[\d+\-*/.]+$/;
    if (!regex.test(s)) {
        return false;
    }
    // operators cannot be adjacent to each other
    for (let i = 0; i < s.length - 1; i++) {
        if (operators.has(s[i]) && operators.has(s[i + 1])) {
            return false;
        }
    }
    // operators cannot be at the end of the string
    if (operators.has(s[s.length - 1])) {
        return false;
    }
    return true;
}

// evaluate evaluate a mathematical expression
function evaluate(s: string): string {
    if (!isValidCommand(s)) {
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

export { isValidCommand, evaluate };