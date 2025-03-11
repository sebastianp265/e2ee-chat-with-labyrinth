# Secure chat with labyrinth protocol implementation 
Chat with server-side confidential message storage using Meta Labirynth Protocol - https://engineering.fb.com/wp-content/uploads/2023/12/TheLabyrinthEncryptedMessageStorageProtocol_12-6-2023.pdf
## Features
- ✅ Real-time communication
- ✅ Secure message storage
- ❌ End-to-End Encryption (on todo list)
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
./script.sh [DOCKER_DB] [DOCKER_TEMP_MESSAGE_STORAGE]
```

#### Script Arguments

| Argument                      | Description                             | Default Value                                          |
|-------------------------------|-----------------------------------------|--------------------------------------------------------|
| `DOCKER_DB`                   | Name of the PostgreSQL Docker container | `e2ee-chat-with-labirynth-server_db-1`                 |
| `DOCKER_TEMP_MESSAGE_STORAGE` | Name of the Redis Docker container      | `e2ee-chat-with-labirynth-temporary_message_storage-1` |

### Open the Application

After the database is seeded, open the app in your browser:

🔗 **[http://localhost:5173](http://localhost:5173)**

You can log in with one of the following test users:

- **alice**
- **bob**
- **carol**

The password for all users is:  
`123456`