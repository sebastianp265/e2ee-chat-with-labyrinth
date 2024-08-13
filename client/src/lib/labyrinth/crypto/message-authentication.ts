import {createHmac} from "crypto"

export function mac(data: Buffer, key: Buffer) {
    const hmac = createHmac('sha256', key)
    hmac.update(data)
    return hmac.digest()
}
