import {mac} from "@/lib/labyrinth/crypto/message-authentication.ts";
import {encodeText} from "@/lib/labyrinth/crypto/utils.ts";

describe('message authentication', () => {
    test('should return the same mac after running twice on the same message', async () => {
        const key = new Uint8Array(256 / 8)
        crypto.getRandomValues(key)
        const data = "Example of a message"
        const data_bytes = encodeText(data)

        const mac_first_run = await mac(data_bytes, key)
        const mac_second_run = await mac(data_bytes, key)

        expect(mac_first_run).toEqual(mac_second_run)
    })

    test('should return different mac after running on a different message', async () => {
        const key = new Uint8Array(256 / 8)
        crypto.getRandomValues(key)

        const data = "Example of a message"
        const data_bytes = encodeText(data)
        const mac_first_run = await mac(data_bytes, key)

        const different_message = "Same length message "
        const different_message_bytes = encodeText(different_message)
        const mac_second_run = await mac(different_message_bytes, key)

        expect(mac_first_run).not.toEqual(mac_second_run)
    })
})
