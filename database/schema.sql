-- User module
CREATE TABLE chat_user
(
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username     VARCHAR(255) NOT NULL UNIQUE,
    visible_name VARCHAR(255) NOT NULL
);

CREATE TABLE friend_relation
(
    id                  BIGSERIAL PRIMARY KEY,
    chat_user_id        UUID NOT NULL REFERENCES chat_user,
    chat_user_friend_id UUID NOT NULL REFERENCES chat_user,
    status              VARCHAR(255)
        CONSTRAINT friend_relation_status_check
            CHECK ((status)::text = ANY
                   ((ARRAY ['PENDING'::character varying, 'ACCEPTED'::character varying, 'DECLINED'::character varying])::text[]))
);

-- Chat module
CREATE TABLE chat_inbox
(
    id      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL
);

CREATE TABLE chat_thread
(
    id   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NULL
);

CREATE TABLE chat_thread_member
(
    id             BIGSERIAL PRIMARY KEY,
    chat_thread_id UUID         NOT NULL REFERENCES chat_thread,
    user_id        UUID         NOT NULL,
    visible_name   varchar(255) NULL
);

-- Labyrinth module
CREATE TABLE labyrinth
(
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_inbox_id UUID NOT NULL REFERENCES chat_inbox
);

CREATE TABLE epoch
(
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    labyrinth_id UUID         NOT NULL REFERENCES labyrinth,
    sequence_id  VARCHAR(255) NOT NULL
);

CREATE TABLE device
(
    id                         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    labyrinth_id               UUID  NOT NULL REFERENCES labyrinth,
    device_key_pub             BYTEA NOT NULL,
    epoch_storage_key_pub      BYTEA NOT NULL,
    epoch_storage_key_sig      BYTEA NOT NULL,
    epoch_storage_auth_key_pub BYTEA NOT NULL,
    epoch_storage_auth_key_sig BYTEA NOT NULL
);

CREATE TABLE device_epoch_membership_proof
(
    id               BIGSERIAL PRIMARY KEY,
    epoch_id         UUID  NOT NULL REFERENCES epoch,
    device_id        UUID  NOT NULL REFERENCES device,
    epoch_device_mac BYTEA NOT NULL
);

CREATE TABLE virtual_device
(
    id                    BYTEA PRIMARY KEY,
    labyrinth_id          UUID  NOT NULL REFERENCES labyrinth,
    device_key_pub        BYTEA NOT NULL,
    epoch_storage_key_pub BYTEA NOT NULL,
    epoch_storage_key_sig BYTEA NOT NULL
);

CREATE TABLE virtual_device_epoch_membership_proof
(
    id               BIGSERIAL PRIMARY KEY,
    epoch_id         UUID  NOT NULL REFERENCES epoch,
    epoch_device_mac BYTEA NOT NULL
);

CREATE TABLE virtual_device_encrypted_recovery_secrets
(
    id                               BIGSERIAL PRIMARY KEY,
    labyrinth_id                     UUID  NOT NULL REFERENCES labyrinth,
    virtual_device_id                BYTEA NOT NULL REFERENCES virtual_device,
    epoch_id                         UUID  NOT NULL REFERENCES epoch,
    encrypted_device_key_priv        BYTEA NOT NULL,
    encrypted_epoch_root_key         BYTEA NOT NULL,
    encrypted_epoch_sequence_id      BYTEA NOT NULL,
    encrypted_epoch_storage_key_priv BYTEA NOT NULL
);

CREATE TABLE chat_message
(
    message_id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id              UUID                           NOT NULL REFERENCES chat_thread,
    inbox_id               UUID                           NOT NULL REFERENCES chat_inbox,
    timestamp              TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
    encrypted_message_data BYTEA                          NOT NULL,
    epoch_id               UUID                           NOT NULL REFERENCES epoch,
    version                BIGINT                         NOT NULL
);

CREATE INDEX inbox_thread_timestamp_index
    ON chat_message (inbox_id, thread_id, timestamp);