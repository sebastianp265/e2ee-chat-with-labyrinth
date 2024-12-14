import {
    asciiStringToBytes,
    base64StringToBytes,
    bytesToAsciiString,
    bytesToBase64String,
} from '@/lib/labyrinth/crypto/utils.ts';

describe('utils test', () => {
    test('Converting all possible bytes to ascii string is reversible', () => {
        const allPossibleBytes = Uint8Array.of(
            ...Array.from({ length: 256 }, (_, i) => i),
        );

        const asciiFromBytes = bytesToAsciiString(allPossibleBytes);
        const bytesFromAscii = asciiStringToBytes(asciiFromBytes);

        expect(bytesFromAscii).toStrictEqual(allPossibleBytes);
    });
    test('Converting all possible bytes to base64 string is reversible', () => {
        const allPossibleBytes = Uint8Array.of(
            ...Array.from({ length: 256 }, (_, i) => i),
        );

        const base64FromBytes = bytesToBase64String(allPossibleBytes);
        const bytesFromBase64 = base64StringToBytes(base64FromBytes);

        expect(bytesFromBase64).toStrictEqual(allPossibleBytes);
    });
});
