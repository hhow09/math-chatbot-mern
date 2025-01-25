# Backend
## Run at Local
### Setup Infrastructure
```bash
cp .env.example .env  # modify .env as needed
docker run --name mongodb -p 27017:27017 -d mongo:6.0.20
npm install
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
    - [socket.id](https://socket.io/docs/v4/server-socket-instance/#socketid) is used as **client identifier**.
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

## MongoDB Data Modeling
- Based on the requirement of `history` command (the only read operation), the data needed to be persisted is `clientId`, `operation`, and `result`.
- The requirement also mentioned that **only the latest 10 operations** need to be persisted.
- There are 2 possible ways to implement this:
    1. each **operation** per document. e.g. `{ clientId: '1', operation: '1 + 1', result: '2', timestamp: '2025-01-25T00:00:00.000Z' }`
    2. store chat history in a single document as a **chat session**. e.g. `{ clientId: '1', history: [{ operation: '1 + 1', result: '2' }, { operation: '1 + 1', result: '2' }, ...] }`.
- For the 1st approach, 
    - read operation is straightforward: query by `clientId` and sort by `timestamp` & limit to 10
    - write operation is also straightforward: [insertOne](https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/)
    - however, additional cleanup logic is needed to remove old operations (e.g. cron job or [TTL Indexes](https://www.mongodb.com/docs/manual/core/index-ttl/))
    - moreover, mongodb document also suggests that **You should consider embedding for performance reasons if you have a collection with a large number of small documents.** (ref: [Collection Contains Large Number of Small Documents](https://www.mongodb.com/docs/manual/core/data-model-operations/#collection-contains-large-number-of-small-documents))
- For the 2nd approach,
    - We need to [Avoid Unbounded Arrays](https://www.mongodb.com/docs/manual/data-modeling/design-antipatterns/unbounded-arrays/) to grow over document size limit 16MB. However, only keeping the latest 10 operations should not be an issue.
    - write operation: there is out-of-box solution of [array push](https://www.mongodb.com/docs/manual/reference/operator/update/push/#mongodb-update-up.-push) with [$slice](https://www.mongodb.com/docs/manual/reference/operator/update/slice/) option in single operation.
    - read operation is also straightforward: simply query by `clientId`.
- In summary, the 2nd approach is more suitable for this case.

## Math Calculation
### Evalutaion Algorithm
1. Parse the expression string by splitting by `+` and `-`, resulting a list of sub-expressions (`Summand`).
2. For each `Summand`, turn it into a `Fraction`.
3. Sum all fractions by `Fraction.add(Fraction)`.
    - It uses **lowest common multiple** to add fractions.
    - [Decimal.js](https://mikemcl.github.io/decimal.js/) is used for the basic arithmetic operations.
4. Evaluate the result by `Fraction.evaluate()`.
    - result is converted to string to avoid overflow and keep precision.

### Example
1. Input string: `5 / 3 / 4 * 9 - 2 * 3 / 8`
2. Parse into sub-expressions: `5 / 3 / 4 * 9` and `-2 * 3 / 8`
3. Turn them into fractions: $\frac{5 * 9}{3 * 4}$ and $-\frac{2 * 3}{8}$
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