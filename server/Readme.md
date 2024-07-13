## Installation And Usage
```bash
npm install
```
Create `.env` file with mongodb db url (`<connectionString>/<dbName>` if you're using mongodb local install)
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

 ## Todo
 - [ ] get all rooms data by post request containing {hostel, floor}
 - [ ] 