import { ExpressionMD } from './types';
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
    
    const exps = parseExpressionMDs(s).map(expMD => expMD.toFraction());
    const first = exps.shift();
    if (!first) {
        return "0"
    }
    if (exps.length === 0) {
        return first.evaluate()
    }
    const result = exps.reduce((acc, expMD) =>  acc.add(expMD), first);
    return result.evaluate().toString();
}

// parseExpressionMDs parse the expression into list of ExpressionMD
const parseExpressionMDs = (s: string): ExpressionMD[] => {
    const expressions: ExpressionMD[] = [];
    let currExp = "";
    let prevOp = true;
    if (s[0] === '-') {
        prevOp = false;
        s = s.slice(1);
    }
    for (const token of s.split('')) {
        if (token === '+') {
            expressions.push(new ExpressionMD(prevOp, currExp));
            prevOp = true
            currExp = "";
        } else if (token === '-') {
            expressions.push(new ExpressionMD(prevOp, currExp));
            prevOp = false;
            currExp = "";
        } else {
            currExp += token;
        }
    }
    expressions.push(new ExpressionMD(prevOp, currExp)); // last one
    return expressions;
}

export { isValidCommand, evaluate };