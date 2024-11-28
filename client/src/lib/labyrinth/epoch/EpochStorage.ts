import {BytesSerializer} from "@/lib/labyrinth/BytesSerializer.ts";

export class EpochStorageError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, EpochStorageError.prototype);
    }
}

export class EpochDoesNotExistError extends EpochStorageError {
    constructor(epochSequenceID: string) {
        super(`Epoch with sequenceID = ${epochSequenceID} doesn't exist`);

        Object.setPrototypeOf(this, EpochDoesNotExistError.prototype);
    }
}

export class EpochAlreadyExistError extends EpochStorageError {
    constructor(epochSequenceID: string) {
        super(`Epoch with sequenceID = ${epochSequenceID} already exists`);

        Object.setPrototypeOf(this, EpochAlreadyExistError.prototype);
    }
}

export class OmittedEpochError extends EpochStorageError {
    constructor(expectedOlderEpochSequenceID: string, expectedNewerEpochSequenceID: string, actualEpochSequenceID: string) {
        super(`Expected to add older epoch with sequenceID = ${expectedOlderEpochSequenceID} or to add newer epoch with sequenceID = ${expectedNewerEpochSequenceID}, got epoch with sequenceID = ${actualEpochSequenceID}`);

        Object.setPrototypeOf(this, OmittedEpochError.prototype);
    }
}

export class NoEpochExistsInEpochStorageError extends EpochStorageError {
    constructor() {
        super("No epoch exists");

        Object.setPrototypeOf(this, NoEpochExistsInEpochStorageError.prototype)
    }
}

export class NegativeEpochSequenceIDError extends EpochStorageError {
    constructor() {
        super("There cannot be an epoch with negative sequenceID");

        Object.setPrototypeOf(this, NegativeEpochSequenceIDError.prototype);
    }
}

export type EpochSerialized = {
    id: string,
    sequenceID: string,
    rootKey: string,
}

export type Epoch = {
    id: string,
    sequenceID: string,
    rootKey: Uint8Array,
}

export type EpochWithoutID = {
    sequenceID: string,
    rootKey: Uint8Array,
}

export type EpochStorageSerialized = {
    newestEpochSequenceID: string | null
    oldestEpochSequenceID: string | null
    sequenceIDToEpoch: { [sequenceID: string]: EpochSerialized }
}

export class EpochStorage {
    private newestEpochSequenceID: string | null
    private oldestEpochSequenceID: string | null
    private readonly sequenceIDToEpoch: { [sequenceID: string]: Epoch }

    private constructor(
        newestEpochSequenceID: string | null,
        oldestEpochSequenceID: string | null,
        sequenceIDToEpoch: { [sequenceID: string]: Epoch }
    ) {
        this.newestEpochSequenceID = newestEpochSequenceID
        this.oldestEpochSequenceID = oldestEpochSequenceID
        this.sequenceIDToEpoch = sequenceIDToEpoch
    }

    public static deserialize(epochStorageSerialized: EpochStorageSerialized): EpochStorage {
        return new EpochStorage(
            epochStorageSerialized.oldestEpochSequenceID,
            epochStorageSerialized.newestEpochSequenceID,
            Object.fromEntries(Object.entries(epochStorageSerialized.sequenceIDToEpoch).map(e => {
                const [k, v] = e
                return [k, {
                    id: v.id,
                    rootKey: BytesSerializer.deserialize(v.rootKey),
                    sequenceID: v.sequenceID,
                } as Epoch]
            }))
        )
    }

    public serialize(): EpochStorageSerialized {
        return {
            newestEpochSequenceID: this.newestEpochSequenceID,
            oldestEpochSequenceID: this.oldestEpochSequenceID,
            sequenceIDToEpoch: Object.fromEntries(Object.entries(this.sequenceIDToEpoch).map(e => {
                const [k, v] = e
                return [k, {
                    id: v.id,
                    rootKey: BytesSerializer.serialize(v.rootKey),
                    sequenceID: v.sequenceID,
                } as EpochSerialized]
            }))
        }
    }

    public static createEmpty() {
        return new EpochStorage(null, null, {})
    }

    public getEpoch(sequenceID: string): Epoch {
        const epoch = this.sequenceIDToEpoch[sequenceID]
        if (epoch === undefined) {
            throw new EpochDoesNotExistError(sequenceID)
        }

        return epoch
    }

    public isEpochPresent(sequenceID: string): boolean {
        return Object.hasOwn(this.sequenceIDToEpoch, sequenceID)
    }

    public getOldestEpoch() {
        if (this.oldestEpochSequenceID === null) {
            throw new NoEpochExistsInEpochStorageError()
        }
        return this.sequenceIDToEpoch[this.oldestEpochSequenceID]
    }

    public getNewestEpoch() {
        if (this.newestEpochSequenceID === null) {
            throw new NoEpochExistsInEpochStorageError()
        }
        return this.sequenceIDToEpoch[this.newestEpochSequenceID]
    }

    public add(epochToAdd: Epoch) {
        if (this.isEpochPresent(epochToAdd.sequenceID)) {
            throw new EpochAlreadyExistError(epochToAdd.sequenceID)
        }
        const epochToAddSequenceIDInt = BigInt(epochToAdd.sequenceID)
        if (epochToAddSequenceIDInt < 0) {
            throw new NegativeEpochSequenceIDError()
        }

        if (Object.keys(this.sequenceIDToEpoch).length === 0) {
            this.sequenceIDToEpoch[epochToAdd.sequenceID] = epochToAdd
            this.oldestEpochSequenceID = epochToAdd.sequenceID
            this.newestEpochSequenceID = epochToAdd.sequenceID
        } else {
            const possibleOlderEpochSequenceIDInt = BigInt(this.oldestEpochSequenceID!) - 1n
            const possibleNewerEpochSequenceIDInt = BigInt(this.newestEpochSequenceID!) + 1n

            if (possibleOlderEpochSequenceIDInt === epochToAddSequenceIDInt) {
                this.oldestEpochSequenceID = epochToAdd.sequenceID
            } else if (possibleNewerEpochSequenceIDInt === epochToAddSequenceIDInt) {
                this.newestEpochSequenceID = epochToAdd.sequenceID
            } else {
                throw new OmittedEpochError(
                    possibleOlderEpochSequenceIDInt.toString(),
                    possibleNewerEpochSequenceIDInt.toString(),
                    epochToAdd.sequenceID
                )
            }

            this.sequenceIDToEpoch[epochToAdd.sequenceID] = epochToAdd
        }
    }

}