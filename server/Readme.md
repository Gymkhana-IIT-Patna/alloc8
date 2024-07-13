## Installation
```bash
npm install
```
Edit `.env` file with mongodb db url (`<connectionString>/<dbName>` if you're using mongodb local install)
then run
```bash
npx prisma generate
```

Whenever you update your Prisma schema, you will need to run
 ```bash
 npx prisma db push
 ```

 then 
 ```bash
 npm start
 ```