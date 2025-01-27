import { Decimal } from "decimal.js";

// Summand is a mathematical expression only contains numbers, multiplication, division
export class Summand {
    public sign: boolean;
    public exp: string;
    constructor(sign: boolean, exp: string) {
        this.sign = sign;
        this.exp = exp;
    }

    // toFraction evaluate the expression and turn into a fraction
    public toFraction(): Fraction {
        let numerator = new Decimal(this.firstNumber());
        if (!this.sign) {
            numerator = numerator.neg();
        }
        let denominator = new Decimal(1);
        const indexOfFirstOperator = this.firstNumber().length;
        // only one number
        if (indexOfFirstOperator === this.exp.length) {
            return new Fraction(numerator, new Decimal(1));
        }

        // parse the expression of multiplication and division
        let prevOp = this.exp[indexOfFirstOperator];
        let currStr = "";
        for (let i = indexOfFirstOperator + 1; i < this.exp.length; i++) {
            if (this.exp[i] === '*' || this.exp[i] === '/') {
                switch (prevOp) {
                    case '*':
                        numerator = numerator.mul(new Decimal(currStr));
                        break;
                    case '/':
                        denominator = denominator.mul(new Decimal(currStr));
                        break;
                    default:
                        throw new Error('Invalid operator');
                }
                prevOp = this.exp[i];
                currStr = "";
            }else{
                currStr += this.exp[i];
            }
        }
        // last one
        if (prevOp === '*') {
            numerator = numerator.mul(new Decimal(currStr));
        } else if (prevOp === '/') {
            denominator = denominator.mul(new Decimal(currStr));
        } else {
            throw new Error('Invalid operator');
        }

        return new Fraction(numerator, denominator);
    }

    // firstNumber return the first number in the expression
    private firstNumber(): string {
        for (let i = 0; i < this.exp.length; i++) {
            if (this.exp[i] === '*') {
                return this.exp.substring(0, i);
            }
            if (this.exp[i] === '/') {
                return this.exp.substring(0, i);
            }
        }
        return this.exp;
    }
}

export class Fraction {
    public numerator: Decimal;
    public denominator: Decimal;

    constructor(numerator: Decimal, denominator: Decimal) {
        this.numerator = numerator;
        this.denominator = denominator;
    }

    public add(f: Fraction): Fraction {
        const commonDenominator = getLowestCommonMultiple(this.denominator, f.denominator);
        const multiplyThis = commonDenominator.div(this.denominator);
        const multiplyF = commonDenominator.div(f.denominator);
        this.numerator = this.numerator.mul(multiplyThis);
        this.denominator = commonDenominator;
        f.numerator = f.numerator.mul(multiplyF);
        f.denominator = commonDenominator;
        const sum = this.numerator.add(f.numerator);
        return new Fraction(sum, commonDenominator);
    }

    public evaluate(): string {
        return this.numerator.div(this.denominator).toString();
    }
}

function getLowestCommonMultiple(a: Decimal, b: Decimal): Decimal {
    return a.mul(b).div(getGreatestCommonDivisor(a, b));
}

function getGreatestCommonDivisor(a: Decimal, b: Decimal): Decimal {
    const max = Decimal.max(a, b);
    const min = Decimal.min(a, b);
    if (max.mod(min).eq(0)) {
        return min;
    } else {
        return getGreatestCommonDivisor(max.mod(min), min);
    }
}