# Backend
## Run at Local
### Setup Infrastructure
```bash
cp .env.example .env  # modify .env as needed
docker run --name mongodb -p 27017:27017 -d mongo:6.0.20
```

### Run server
```bash
npm run start
```

### Run tests
```bash
npm run test
```

## Features
- [x] It supports 2 types of operations requested via websocket
    - `operation`: evaluate an expression and return the result.
    - `history`: get the latest 10 commands and results.
- [x] [Express](https://expressjs.com/) is used for the server and router.
- [x] [Socket.io](https://socket.io/) is used for WebSocket communication.
- [x] [MongoDB](https://www.mongodb.com/) is used for storing chat history.
    - [Array $slice](https://www.mongodb.com/docs/manual/reference/operator/update/slice/) is used to keep only the latest history.
    - `Index` is created on `clientId` for history command querying by `clientId`.
- [x] [Jest](https://jestjs.io/) is used for unit testing.
- [x] [Github Workflows](../.github/workflows/ci.yaml) is used for continuous integration.

## Folder Structure
```
src
├── app.spec.ts                     # integration test
├── app.ts                          # main entry
├── chat-server.ts                  # websocket server
├── command-service.ts              # handle business logic
├── entities
│   └── command-result.entity.ts    # entity shared across components
├── math                            # math calculation logic, pure functions
│   ├── evaluate.spec.ts
│   ├── evaluate.ts
│   └── types.ts
└── repositories                    # data access layer
    ├── chat-repo.spec.ts
    ├── chat-repo.ts
    └── index.ts
```

## Math Calculation
### Evalutaion Algorithm
1. Parse the expression string by splitting by `+` and `-`, resulting a list of sub-expressions (`ExpressionMD`).
2. For each sub-expression, turn it into a `Fraction`.
3. Sum all fractions by `Fraction.add(Fraction)`.
    - It uses **lowest common multiple** to add fractions.
    - [Decimal.js](https://mikemcl.github.io/decimal.js/) is used for the basic arithmetic operations.
4. Evaluate the result by `Fraction.evaluate()`.

### Example
1. Input string: `5 / 3 / 4 * 9 - 2 * 3 / 8`
2. Parse into sub-expressions: `5 / 3 / 4 * 9` and `-2 * 3 / 8`
3. Turn these into fractions: $\frac{5 * 9}{3 * 4}$ and $-\frac{2 * 3}{8}$
4. find equivalent fractions with same denominator: $\frac{90}{24}$ and $-\frac{18}{24}$
5. Sum these fractions: $\frac{90}{24} - \frac{18}{24} = \frac{72}{24} = 3$

### Limitations
- All whitespace is ignored, therefore `1 + 2 3` will consider as `1 + 23`
- `negative sign` is only allowed at the beginning of an expression but not after multiplication or division
    - e.g. `-5*3 + 1` will return `-14`
    - e.g. `5 * -3` will return error.
- large number will be converted to exponential notation: e.g. `999999999999 * 999999999999` will return `9.99999999998e+23`
    - default threshold of exponent is `20`
    - ref: https://mikemcl.github.io/decimal.js/#precision