import { LABYRINTH_INSTANCE_KEY } from '@/constants.ts';
import labyrinthWebClientImpl from '@/api/labyrinthWebClientImpl.ts';
import { useEffect, useState, useCallback } from 'react';
import {
    Labyrinth,
    LabyrinthSerialized,
} from '@sebastianp265/safe-server-side-storage-client';
import { CustomApiError } from '@/lib/errorUtils';

export enum LabyrinthStatus {
    INITIAL_LOADING,

    AWAITING_FIRST_EPOCH_CREATION,
    CREATING_FIRST_EPOCH,
    SUCCESS_FIRST_EPOCH_CREATION,

    AWAITING_RECOVERY_CODE,
    PROCESSING_RECOVERY_CODE,
    SUCCESS_RECOVERY_CODE_PROCESSED,

    ERROR,

    READY_TO_USE_LABYRINTH,
}

export type LabyrinthHookState =
    | { status: LabyrinthStatus.INITIAL_LOADING }
    | (
          | { status: LabyrinthStatus.AWAITING_FIRST_EPOCH_CREATION }
          | { status: LabyrinthStatus.CREATING_FIRST_EPOCH }
          | {
                status: LabyrinthStatus.SUCCESS_FIRST_EPOCH_CREATION;
                recoveryCode: string;
                _instance: Labyrinth;
            }
      )
    | (
          | { status: LabyrinthStatus.AWAITING_RECOVERY_CODE }
          | { status: LabyrinthStatus.PROCESSING_RECOVERY_CODE }
          | {
                status: LabyrinthStatus.SUCCESS_RECOVERY_CODE_PROCESSED;
                _instance: Labyrinth;
            }
      )
    | {
          status: LabyrinthStatus.ERROR;
          error: CustomApiError;
          previousStatus?: LabyrinthStatus;
      }
    | {
          status: LabyrinthStatus.READY_TO_USE_LABYRINTH;
          instance: Labyrinth;
      };

function loadLabyrinthFromLocalStorage(loggedUserId: string): LabyrinthSerialized | null {
    const labyrinthJSONString = localStorage.getItem(`${LABYRINTH_INSTANCE_KEY}${loggedUserId}`);
    if (labyrinthJSONString === null) {
        return null;
    }
    return JSON.parse(labyrinthJSONString);
}

function saveLabyrinthToLocalStorage(loggedUserId: string, labyrinth: Labyrinth) {
    localStorage.setItem(
        `${LABYRINTH_INSTANCE_KEY}${loggedUserId}`,
        JSON.stringify(labyrinth.serialize()),
    );
}

export default function useLabyrinth(loggedUserId: string) {
    const [labyrinthHookState, setLabyrinthHookState] =
        useState<LabyrinthHookState>({
            status: LabyrinthStatus.INITIAL_LOADING,
        });

    useEffect(() => {
        if (labyrinthHookState.status === LabyrinthStatus.INITIAL_LOADING) {
            const serializedLabyrinth = loadLabyrinthFromLocalStorage(loggedUserId);

            if (serializedLabyrinth) {
                Labyrinth.deserialize(
                    serializedLabyrinth,
                    labyrinthWebClientImpl,
                )
                    .then((instance) => {
                        setLabyrinthHookState({
                            status: LabyrinthStatus.READY_TO_USE_LABYRINTH,
                            instance,
                        });
                    })
                    .catch((e: CustomApiError) => {
                        setLabyrinthHookState({
                            status: LabyrinthStatus.ERROR,
                            error: e,
                            previousStatus: LabyrinthStatus.INITIAL_LOADING,
                        });
                    });
            } else {
                Labyrinth.checkIfLabyrinthIsInitialized(labyrinthWebClientImpl)
                    .then((response) => {
                        if (response.isInitialized) {
                            setLabyrinthHookState({
                                status: LabyrinthStatus.AWAITING_RECOVERY_CODE,
                            });
                        } else {
                            setLabyrinthHookState({
                                status: LabyrinthStatus.AWAITING_FIRST_EPOCH_CREATION,
                            });
                        }
                    })
                    .catch((e: CustomApiError) => {
                        setLabyrinthHookState({
                            status: LabyrinthStatus.ERROR,
                            error: e,
                            previousStatus: LabyrinthStatus.INITIAL_LOADING,
                        });
                    });
            }
        } else if (
            labyrinthHookState.status === LabyrinthStatus.READY_TO_USE_LABYRINTH
        ) {
            saveLabyrinthToLocalStorage(loggedUserId, labyrinthHookState.instance);
        }
    }, [labyrinthHookState.status]);

    const initializeLabyrinthFromRecoveryCode = useCallback(
        (recoveryCode: string): void => {
            setLabyrinthHookState({
                status: LabyrinthStatus.PROCESSING_RECOVERY_CODE,
            });
            Labyrinth.fromRecoveryCode(
                loggedUserId,
                recoveryCode,
                labyrinthWebClientImpl,
            )
                .then((labyrinthInstance) => {
                    setLabyrinthHookState({
                        status: LabyrinthStatus.SUCCESS_RECOVERY_CODE_PROCESSED,
                        _instance: labyrinthInstance,
                    });
                })
                .catch((e: CustomApiError) => {
                    setLabyrinthHookState({
                        status: LabyrinthStatus.ERROR,
                        error: e,
                        previousStatus:
                            LabyrinthStatus.PROCESSING_RECOVERY_CODE,
                    });
                });
        },
        [loggedUserId],
    );

    const initializeLabyrinthFromFirstEpoch = useCallback((): void => {
        setLabyrinthHookState({
            status: LabyrinthStatus.CREATING_FIRST_EPOCH,
        });
        Labyrinth.initialize(loggedUserId, labyrinthWebClientImpl)
            .then((fromFirstEpoch) => {
                setLabyrinthHookState({
                    status: LabyrinthStatus.SUCCESS_FIRST_EPOCH_CREATION,
                    recoveryCode: fromFirstEpoch.recoveryCode,
                    _instance: fromFirstEpoch.labyrinthInstance,
                });
            })
            .catch((e: CustomApiError) => {
                setLabyrinthHookState({
                    status: LabyrinthStatus.ERROR,
                    error: e,
                    previousStatus: LabyrinthStatus.CREATING_FIRST_EPOCH,
                });
            });
    }, [loggedUserId]);

    const retryInitialization = useCallback(() => {
        setLabyrinthHookState({ status: LabyrinthStatus.INITIAL_LOADING });
    }, []);

    const finishInitializationFromDialog = useCallback(() => {
        if (
            labyrinthHookState.status ===
                LabyrinthStatus.SUCCESS_FIRST_EPOCH_CREATION ||
            labyrinthHookState.status ===
                LabyrinthStatus.SUCCESS_RECOVERY_CODE_PROCESSED
        ) {
            setLabyrinthHookState({
                status: LabyrinthStatus.READY_TO_USE_LABYRINTH,
                instance: labyrinthHookState._instance,
            });
        }
    }, [labyrinthHookState]);

    return {
        labyrinthHookState,
        initializeLabyrinthFromFirstEpoch,
        initializeLabyrinthFromRecoveryCode,
        retryInitialization,
        finishInitializationFromDialog,
    } as const;
}
