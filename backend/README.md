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

## Limitations on calculation
- All whitespace is ignored, therefore `1 + 2 3` will consider as `1 + 23`
- `negative sign` is only allowed at the beginning of an expression but not after multiplication or division
    - e.g. `-5*3 + 1` will return `-14`
    - e.g. `5 * -3` will return error.
- large number will be converted to exponential notation: e.g. `999999999999 * 999999999999` will return `9.99999999998e+23`
    - default threshold of exponent is `20`
    - ref: https://mikemcl.github.io/decimal.js/#precision