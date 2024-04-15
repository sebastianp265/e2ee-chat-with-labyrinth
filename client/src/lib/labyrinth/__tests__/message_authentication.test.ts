import {mac} from "@/lib/labyrinth/crypto/message_authentication.ts";

describe('message authentication', () => {
    test('should return the same mac after running twice on the same message', () => {
        const key = Buffer.alloc(256 / 8)
        crypto.getRandomValues(key)
        const data = "Example of a message"
        const data_bytes = Buffer.from(data)

        const mac_first_run = mac(data_bytes, key)
        const mac_second_run = mac(data_bytes, key)

        expect(mac_first_run).toEqual(mac_second_run)
    })

    test('should return different mac after running on a different message', () => {
        const key = Buffer.alloc(256 / 8)
        crypto.getRandomValues(key)

        const data = "Example of a message"
        const data_bytes = Buffer.from(data)
        const mac_first_run = mac(data_bytes, key)

        const different_message = "Same length message "
        const different_message_bytes = Buffer.from(different_message)
        const mac_second_run = mac(different_message_bytes, key)

        expect(mac_first_run).not.toEqual(mac_second_run)
    })
})
