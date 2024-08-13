import {Epoch} from "@/lib/labyrinth/labyrinth-types.ts";
import {LinkedList} from "linked-list-typescript";

class UnknownEpochError extends Error {
    constructor() {
        super();

        Object.setPrototypeOf(this, UnknownEpochError.prototype);
    }
}

class EpochAlreadyExistError extends Error {
    constructor() {
        super();

        Object.setPrototypeOf(this, EpochAlreadyExistError.prototype);
    }
}

class OmittedEpochError extends Error {
    constructor() {
        super();

        Object.setPrototypeOf(this, OmittedEpochError.prototype);
    }
}

interface IEpochStorage {
    sequenceIDToEpoch: { [sequenceID: string]: Epoch }
    epochs: LinkedList<Epoch>
}

export class EpochStorage {
    private readonly sequenceIDToEpoch: { [sequenceID: string]: Epoch }
    private readonly epochs: LinkedList<Epoch>

    constructor()
    constructor(epochStorage?: IEpochStorage) {
        this.sequenceIDToEpoch = epochStorage?.sequenceIDToEpoch ?? {}
        this.epochs = epochStorage?.epochs ?? new LinkedList<Epoch>()
    }

    getEpoch(sequenceID: string): Epoch {
        const epoch = this.sequenceIDToEpoch[sequenceID]
        if (epoch === undefined) {
            throw new UnknownEpochError()
        }

        return epoch
    }

    getOldestEpoch() {
        return this.epochs.head
    }

    getNewestEpoch() {
        return this.epochs.tail
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
            const oldestKnownEpochSequenceID = BigInt(this.epochs.head.sequenceID)

            if (oldestKnownEpochSequenceID - 1n !== olderEpochSequenceID) {
                throw new OmittedEpochError()
            }
        }

        this.epochs.prepend(olderEpoch)
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
        if (this.epochs.length !== 0) {
            const newestKnownEpochSequenceID = BigInt(this.epochs.head.sequenceID)

            if (newestKnownEpochSequenceID + 1n !== newerEpochSequenceID) {
                throw new OmittedEpochError()
            }
        }

        this.epochs.append(newerEpoch)
        this.sequenceIDToEpoch[newerEpoch.sequenceID] = newerEpoch
    }
}