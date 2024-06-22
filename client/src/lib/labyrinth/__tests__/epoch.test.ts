import {initializeLabyrinth} from "@/lib/labyrinth/labyrinth.ts";
import {
    encryptNewEpochEntropy,
    Epoch,
    ForeignDevice,
    joinNewEpoch,
    openNewEpoch,
    SelfDevice
} from "@/lib/labyrinth/epoch.ts";
import {random} from "@/lib/labyrinth/crypto/utils.ts";

describe("Labyrinth", () => {
    test("After Alice opening new epoch with Bob, Bob should be able to derive the same epoch data", () => {
        // common
        const prevEpoch: Epoch = {
            id: Buffer.of(0x0F),
            sequenceID: 1n,
            rootKey: random(32)
        }

        // on Alice device
        const aliceKeyBundle = initializeLabyrinth()
        const aliceDevice: SelfDevice = {
            id: Buffer.of(0x02),
            keyBundle: aliceKeyBundle
        }

        // on Bob device
        const bobKeyBundle = initializeLabyrinth()
        const bobDevice: SelfDevice = {
            id: Buffer.of(0x03),
            keyBundle: bobKeyBundle
        }

        // on Alice device
        const bobDeviceFromAlicePerspective: ForeignDevice = {
            id: Buffer.of(0x03),
            keyBundle: bobKeyBundle.public
        }

        // on Bob device
        const aliceDeviceFromBobPerspective: ForeignDevice = {
            id: Buffer.of(0x02),
            keyBundle: aliceKeyBundle.public
        }

        // on Alice device - Alice opens new epoch
        const newEpochID = Buffer.of(0xFF)
        const {
            newEpoch: newEpochOnAliceDevice,
            newEpochEntropy,
            newEpochDistributionPreSharedKey
        } = openNewEpoch(prevEpoch, newEpochID)


        const encryptedNewEpochEntropy = encryptNewEpochEntropy(
            aliceDevice,
            bobDeviceFromAlicePerspective,
            newEpochDistributionPreSharedKey,
            newEpochOnAliceDevice.sequenceID,
            newEpochEntropy
        )

        // Alice sends encrypted entropy to Bob

        // on Bob device
        const newEpochOnBobDevice = joinNewEpoch(
            bobDevice,
            aliceDeviceFromBobPerspective,
            prevEpoch,
            encryptedNewEpochEntropy,
            Buffer.of(0xFF)
        )

        expect(newEpochOnBobDevice).toStrictEqual(newEpochOnAliceDevice)
    })

})