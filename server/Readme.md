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
 - [ ] get all rooms data on floor: POST request containing {hostel, floor}
 - [ ] get student data roll number : POST request containing {rollNumber}
 - [ ] allot hostel room to student (change both rooms and students collection): POST request containing {hostel, floor, room, rollNumber}
### Later
 - [ ] create a function to validate if a room is given to a student (not restricted, etc)
 - [ ] Mutex / Locks for the above function