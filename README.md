# e2ee-chat-with-labyrinth

# About

A secure messaging app using my own library **[safe-server-side-storage-client](https://github.com/sebastianp265/safe-server-side-storage-client)** for safe server-side message storage. The library is based on **[Labyrinth](https://engineering.fb.com/wp-content/uploads/2023/12/TheLabyrinthEncryptedMessageStorageProtocol_12-6-2023.pdf)**, an encrypted message storage protocol developed by **Meta**. This project forms the foundation of my PhD research. Apart from the abstract, the thesis is written in Polish. More details can be found in this [document](https://github.com/sebastianp265/safe-server-side-storage-client/blob/main/phd.pdf).

# Why is it safe?

This application ensures secure storage of messages even after delivery. The core security principles include:
* **End-to-End Encryption (E2EE)**: Messages are intended to be delivered over an encrypted channel before storage (not yet implemented due to the complexity involved).
* **AES Encryption**: The server only stores AES-encrypted messages, meaning it never sees plaintext content.
* **Key Management**: Encryption keys are stored locally on the user's device and can be recovered on new devices using a recovery code.
* **Cryptographic Device Revocation**: The protocol supports revoking inactive devices and ensuring cryptographic key rotation, which strengthens security against compromised or lost devices.

# Features

* Secure message storage with Labyrinth-based encryption.
* Multi-device support with cryptographic recovery.
* Cryptographic revocation of inactive devices.
* Built-in key rotation for enhanced security.

# Screenshots

## First time login

![okno-powitalne](https://github.com/user-attachments/assets/c6421950-a671-4e7e-b238-c0307588b4be)
![kod-odzyskiwania](https://github.com/user-attachments/assets/2538182b-4048-4653-958f-c5788dc164a8)

## Logging in on new devices

![okno-z-miejscem-na-kod](https://github.com/user-attachments/assets/91746ae0-958b-4d85-8ca9-ab23b6767655)
![sukces-odzyskiwania](https://github.com/user-attachments/assets/ee66147d-76c3-4140-9c96-36836ee7ec4c)

## Sending messages

![obraz](https://github.com/user-attachments/assets/374b1bdb-df6a-42ca-ad2e-e6ce5a966115)

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
