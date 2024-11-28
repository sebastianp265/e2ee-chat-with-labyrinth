import {defineConfig} from "cypress";
import pg from "pg";
import {readFileSync} from "fs";

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',
        setupNodeEvents(on, config) {
            on("task", {
                async connectDB({filePath}) {
                    const client = new pg.Client({
                        user: "postgres",
                        password: "postgres",
                        host: "localhost",
                        database: "server",
                        ssl: false,
                        port: 5432
                    })
                    await client.connect()

                    const sql = readFileSync(filePath, "utf-8")
                    await client.query(sql)

                    await client.end()
                    return null
                }
            })
        },
    },
});
