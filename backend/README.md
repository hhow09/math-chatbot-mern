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
