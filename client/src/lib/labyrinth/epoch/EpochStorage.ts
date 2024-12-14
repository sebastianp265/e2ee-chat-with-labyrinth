import { BytesSerializer } from '@/lib/labyrinth/BytesSerializer.ts';

export class EpochStorageError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, EpochStorageError.prototype);
    }
}

export class EpochDoesNotExistError extends EpochStorageError {
    constructor(epochSequenceId: string) {
        super(`Epoch with sequenceId = ${epochSequenceId} doesn't exist`);

        Object.setPrototypeOf(this, EpochDoesNotExistError.prototype);
    }
}

export class EpochAlreadyExistError extends EpochStorageError {
    constructor(epochSequenceId: string) {
        super(`Epoch with sequenceId = ${epochSequenceId} already exists`);

        Object.setPrototypeOf(this, EpochAlreadyExistError.prototype);
    }
}

export class OmittedEpochError extends EpochStorageError {
    constructor(
        expectedOlderEpochSequenceId: string,
        expectedNewerEpochSequenceId: string,
        actualEpochSequenceId: string,
    ) {
        super(
            `Expected to add older epoch with sequenceId = ${expectedOlderEpochSequenceId} or to add newer epoch with sequenceId = ${expectedNewerEpochSequenceId}, got epoch with sequenceId = ${actualEpochSequenceId}`,
        );

        Object.setPrototypeOf(this, OmittedEpochError.prototype);
    }
}

export class NoEpochExistsInEpochStorageError extends EpochStorageError {
    constructor() {
        super('No epoch exists');

        Object.setPrototypeOf(this, NoEpochExistsInEpochStorageError.prototype);
    }
}

export class NegativeEpochSequenceIdError extends EpochStorageError {
    constructor() {
        super('There cannot be an epoch with negative sequenceId');

        Object.setPrototypeOf(this, NegativeEpochSequenceIdError.prototype);
    }
}

export type EpochSerialized = {
    id: string;
    sequenceId: string;
    rootKey: string;
};

export type Epoch = {
    id: string;
    sequenceId: string;
    rootKey: Uint8Array;
};

export type EpochWithoutId = {
    sequenceId: string;
    rootKey: Uint8Array;
};

export type EpochStorageSerialized = {
    newestEpochSequenceId: string | null;
    oldestEpochSequenceId: string | null;
    sequenceIdToEpoch: { [sequenceId: string]: EpochSerialized };
};

export class EpochStorage {
    private newestEpochSequenceId: string | null;
    private oldestEpochSequenceId: string | null;
    private readonly sequenceIdToEpoch: { [sequenceId: string]: Epoch };

    private constructor(
        newestEpochSequenceId: string | null,
        oldestEpochSequenceId: string | null,
        sequenceIdToEpoch: { [sequenceId: string]: Epoch },
    ) {
        this.newestEpochSequenceId = newestEpochSequenceId;
        this.oldestEpochSequenceId = oldestEpochSequenceId;
        this.sequenceIdToEpoch = sequenceIdToEpoch;
    }

    public static deserialize(
        epochStorageSerialized: EpochStorageSerialized,
    ): EpochStorage {
        return new EpochStorage(
            epochStorageSerialized.oldestEpochSequenceId,
            epochStorageSerialized.newestEpochSequenceId,
            Object.fromEntries(
                Object.entries(epochStorageSerialized.sequenceIdToEpoch).map(
                    (e) => {
                        const [k, v] = e;
                        return [
                            k,
                            {
                                id: v.id,
                                rootKey: BytesSerializer.deserialize(v.rootKey),
                                sequenceId: v.sequenceId,
                            } as Epoch,
                        ];
                    },
                ),
            ),
        );
    }

    public serialize(): EpochStorageSerialized {
        return {
            newestEpochSequenceId: this.newestEpochSequenceId,
            oldestEpochSequenceId: this.oldestEpochSequenceId,
            sequenceIdToEpoch: Object.fromEntries(
                Object.entries(this.sequenceIdToEpoch).map((e) => {
                    const [k, v] = e;
                    return [
                        k,
                        {
                            id: v.id,
                            rootKey: BytesSerializer.serialize(v.rootKey),
                            sequenceId: v.sequenceId,
                        } as EpochSerialized,
                    ];
                }),
            ),
        };
    }

    public static createEmpty() {
        return new EpochStorage(null, null, {});
    }

    public getEpoch(sequenceId: string): Epoch {
        const epoch = this.sequenceIdToEpoch[sequenceId];
        if (epoch === undefined) {
            throw new EpochDoesNotExistError(sequenceId);
        }

        return epoch;
    }

    public isEpochPresent(sequenceId: string): boolean {
        return Object.hasOwn(this.sequenceIdToEpoch, sequenceId);
    }

    public getOldestEpoch() {
        if (this.oldestEpochSequenceId === null) {
            throw new NoEpochExistsInEpochStorageError();
        }
        return this.sequenceIdToEpoch[this.oldestEpochSequenceId];
    }

    public getNewestEpoch() {
        if (this.newestEpochSequenceId === null) {
            throw new NoEpochExistsInEpochStorageError();
        }
        return this.sequenceIdToEpoch[this.newestEpochSequenceId];
    }

    public add(epochToAdd: Epoch) {
        if (this.isEpochPresent(epochToAdd.sequenceId)) {
            throw new EpochAlreadyExistError(epochToAdd.sequenceId);
        }
        const epochToAddSequenceIdInt = BigInt(epochToAdd.sequenceId);
        if (epochToAddSequenceIdInt < 0) {
            throw new NegativeEpochSequenceIdError();
        }

        if (Object.keys(this.sequenceIdToEpoch).length === 0) {
            this.sequenceIdToEpoch[epochToAdd.sequenceId] = epochToAdd;
            this.oldestEpochSequenceId = epochToAdd.sequenceId;
            this.newestEpochSequenceId = epochToAdd.sequenceId;
        } else {
            const possibleOlderEpochSequenceIdInt =
                BigInt(this.oldestEpochSequenceId!) - 1n;
            const possibleNewerEpochSequenceIdInt =
                BigInt(this.newestEpochSequenceId!) + 1n;

            if (possibleOlderEpochSequenceIdInt === epochToAddSequenceIdInt) {
                this.oldestEpochSequenceId = epochToAdd.sequenceId;
            } else if (
                possibleNewerEpochSequenceIdInt === epochToAddSequenceIdInt
            ) {
                this.newestEpochSequenceId = epochToAdd.sequenceId;
            } else {
                throw new OmittedEpochError(
                    possibleOlderEpochSequenceIdInt.toString(),
                    possibleNewerEpochSequenceIdInt.toString(),
                    epochToAdd.sequenceId,
                );
            }

            this.sequenceIdToEpoch[epochToAdd.sequenceId] = epochToAdd;
        }
    }
}
