import { defineConfig } from 'cypress';
import pg from 'pg';
import { readFileSync } from 'fs';
import { WebSocket } from 'ws';
import axios from 'axios';
import { createClient } from 'redis';

let activeConnections = {};
let messagesPerConnection = {};

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4173',
        setupNodeEvents(on) {
            on('task', {
                async runSQLs({ filenames }) {
                    const client = new pg.Client({
                        user: 'postgres',
                        password: 'postgres_password',
                        host: 'localhost',
                        database: 'server_db',
                        ssl: false,
                        port: 5432,
                    });
                    await client.connect();

                    for (const filename of filenames) {
                        const sql = readFileSync(
                            `cypress/database/${filename}`,
                            'utf-8',
                        );
                        await client.query(sql);
                    }

                    await client.end();
                    return null;
                },
                async clearRedis() {
                    const client = createClient({
                        password: 'redis_password',
                    });

                    await client.connect();

                    await client.flushDb();
                    return null;
                },
                connectWebSocket({ connectionName, cookie }) {
                    return new Promise((resolve, reject) => {
                        const ws = new WebSocket(
                            'http://localhost:8080/api/ws',
                            {
                                headers: {
                                    cookie,
                                },
                            },
                        );

                        ws.on('open', () => {
                            if (activeConnections[connectionName]) {
                                activeConnections[connectionName].close();
                            }
                            activeConnections[connectionName] = ws;
                            resolve('WebSocket connected');
                        });

                        ws.on('error', (err) => {
                            reject(err);
                        });

                        ws.on('message', (message) => {
                            try {
                                const decoder = new TextDecoder();
                                const decodedMessage = JSON.parse(
                                    decoder.decode(message),
                                );
                                if (messagesPerConnection[connectionName]) {
                                    messagesPerConnection[connectionName].push(
                                        decodedMessage,
                                    );
                                } else {
                                    messagesPerConnection[connectionName] = [
                                        decodedMessage,
                                    ];
                                }
                            } catch (err) {
                                reject(err);
                            }
                        });

                        ws.on('close', () => {
                            delete activeConnections[connectionName];
                            delete messagesPerConnection[connectionName];
                        });
                    });
                },
                sendWebSocketMessage({ connectionName, message }) {
                    return new Promise((resolve, reject) => {
                        const ws = activeConnections[connectionName];
                        if (!ws) {
                            return reject(
                                `Connection with name ${connectionName} is not open`,
                            );
                        }

                        ws.send(JSON.stringify(message), (err) => {
                            if (err) return reject(err);
                            resolve('Message sent');
                        });
                    });
                },
                closeWebSocket({ connectionName }) {
                    return new Promise((resolve, reject) => {
                        const ws = activeConnections[connectionName];
                        if (!ws) {
                            return reject(
                                `Connection with name ${connectionName} is not open`,
                            );
                        }

                        ws.close();
                        resolve('WebSocket connection closed');
                    });
                },
                getWebSocketMessages({ connectionName }) {
                    return messagesPerConnection[connectionName];
                },
                resetWebSocketConnections() {
                    // @ts-ignore
                    Object.values(activeConnections).map((ws) => ws.close());

                    activeConnections = {};
                    messagesPerConnection = {};
                    return null;
                },
                async getSessionCookieOfUser({ username }) {
                    try {
                        const password = '123456';
                        const response = await axios.post(
                            'http://localhost:8080/api/auth/login',
                            {
                                username,
                                password,
                            },
                        );

                        const cookies = response.headers['set-cookie']; // Extract cookies from the response
                        if (!cookies) {
                            throw new Error(
                                'No cookies received from login response',
                            );
                        }

                        const cookie = cookies.filter((c) =>
                            c.includes('SESSION='),
                        );
                        if (cookie.length != 1) {
                            throw new Error('Expected only one session cookie');
                        }

                        return cookie[0];
                    } catch (error) {
                        throw new Error(
                            `Login request failed: ${error.message}`,
                        );
                    }
                },
            });
        },
    },
});
