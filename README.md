# e2ee-chat-with-labyrinth

Chat with end-to-end encryption storing messages securely on server side using Meta Labirynth
Protocol - https://engineering.fb.com/wp-content/uploads/2023/12/TheLabyrinthEncryptedMessageStorageProtocol_12-6-2023.pdf

# How To Run

## For Manual Testing With Docker

### Run Docker Containers

Run the following command to start the necessary containers:

```shell
docker compose up --build
```

### Populate the Database

Currently, user creation is **not supported**, but a **predefined user pool** is available for testing.  
To seed the database, run the following script:

```shell
./manual-testing/prepare.sh
```

### Open the Application

After the database is seeded, open the app in your browser:

🔗 **[http://localhost:4173](http://localhost:4173)**

You can log in with one of the following test users:

- **alice**
- **bob**
- **carol**

The password for all users is:  
`123456`

## For Automated Tests With Cypress

Run the following command to start the necessary containers:

```shell
docker compose --env-file .env.test up --build
```

Run Cypress inside 'client' directory

```shell
npm run cypress:test
```