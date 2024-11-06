export async function mac(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        {
            name: 'HMAC',
            hash: 'SHA-256',
        },
        false,
        ['sign'],
    )

    return new Uint8Array(
        await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            data,
        )
    )
}
