import {Epoch} from "@/lib/labyrinth/labyrinth-types.ts";

export class UnknownEpochError extends Error {
    constructor() {
        super();

        Object.setPrototypeOf(this, UnknownEpochError.prototype);
    }
}

export class EpochAlreadyExistError extends Error {
    constructor() {
        super();

        Object.setPrototypeOf(this, EpochAlreadyExistError.prototype);
    }
}

export class OmittedEpochError extends Error {
    constructor() {
        super();

        Object.setPrototypeOf(this, OmittedEpochError.prototype);
    }
}

interface IEpochStorage {
    sequenceIDToEpoch: { [sequenceID: string]: Epoch }
    epochs: Epoch[]
}

export class EpochStorage {
    private readonly sequenceIDToEpoch: { [sequenceID: string]: Epoch }
    private readonly epochs: Epoch[]

    constructor(epochStorage?: IEpochStorage) {
        this.sequenceIDToEpoch = epochStorage?.sequenceIDToEpoch ?? {}
        this.epochs = epochStorage?.epochs ?? []
    }

    toJSONString(): string {
        const epochStorage = {
            sequenceIDToEpoch: this.sequenceIDToEpoch,
            epochs: this.epochs,
        } as IEpochStorage;

        return JSON.stringify(epochStorage);
    }

    static fromJSONString(jsonString: string): EpochStorage {
        return new EpochStorage(JSON.parse(jsonString))
    }

    shallowCopy(): EpochStorage {
        return new EpochStorage(
            {
                sequenceIDToEpoch: this.sequenceIDToEpoch,
                epochs: this.epochs
            } as IEpochStorage
        )
    }

    deepCopy(): EpochStorage {
        const epochsCopied = this.epochs.map((epochToCopy) => {
            return {...epochToCopy}
        })

        const sequenceIDToEpochCopied = {} as { [sequenceID: string]: Epoch }
        for (const epochCopied of epochsCopied) {
            sequenceIDToEpochCopied[epochCopied.sequenceID] = epochCopied
        }

        return new EpochStorage({epochs: epochsCopied, sequenceIDToEpoch: sequenceIDToEpochCopied})
    }

    getEpoch(sequenceID: string): Epoch {
        const epoch = this.sequenceIDToEpoch[sequenceID]
        if (epoch === undefined) {
            throw new UnknownEpochError()
        }

        return epoch
    }

    isEpochPresent(sequenceID: string): boolean {
        return Object.hasOwn(this.sequenceIDToEpoch, sequenceID)
    }

    getOldestEpoch() {
        return this.epochs[0]
    }

    getNewestEpoch() {
        return this.epochs[this.epochs.length - 1]
    }

    addOlderEpoch(olderEpoch: Epoch) {
        const olderEpochSequenceID = BigInt(olderEpoch.sequenceID)
        if (olderEpochSequenceID < 0) {
            throw new RangeError("There cannot be epoch with negative sequenceID")
        }
        if (Object.hasOwn(this.sequenceIDToEpoch, olderEpoch.sequenceID)) {
            throw new EpochAlreadyExistError()
        }
        if (this.epochs.length !== 0) {
            const oldestKnownEpochSequenceID = BigInt(this.getOldestEpoch().sequenceID)

            if (oldestKnownEpochSequenceID - 1n !== olderEpochSequenceID) {
                throw new OmittedEpochError()
            }
        }

        this.epochs.unshift(olderEpoch)
        this.sequenceIDToEpoch[olderEpoch.sequenceID] = olderEpoch
    }

    addNewerEpoch(newerEpoch: Epoch) {
        const newerEpochSequenceID = BigInt(newerEpoch.sequenceID)
        if (newerEpochSequenceID < 0n) {
            throw new RangeError("There cannot be epoch with negative sequenceID")
        }
        if (Object.hasOwn(this.sequenceIDToEpoch, newerEpoch.sequenceID)) {
            throw new EpochAlreadyExistError()
        }
        if (this.epochs.length > 0) {
            const newestKnownEpochSequenceID = BigInt(this.getNewestEpoch().sequenceID)

            if (newestKnownEpochSequenceID + 1n !== newerEpochSequenceID) {
                throw new OmittedEpochError()
            }
        }

        this.epochs.push(newerEpoch)
        this.sequenceIDToEpoch[newerEpoch.sequenceID] = newerEpoch
    }
}