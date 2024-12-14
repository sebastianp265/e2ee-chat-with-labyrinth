DO
$$
    DECLARE
        -- chat_user
        user_for_logging_in_id     uuid := '9a33b3bc-12c4-4741-b928-e24e28215cfd'::uuid;
        user_not_in_labyrinth_id   uuid := '6c84fbad-12c4-11ec-82a8-0242ac130003'::uuid;
        user_in_labyrinth_alice_id uuid := '14c6d51b-1d4a-4be9-a5e2-df771ebf2051'::uuid;
        user_in_labyrinth_bob_id   uuid := 'cb563237-a662-4e07-9396-511cdbe84159'::uuid;
        user_in_labyrinth_carol_id uuid := 'c9b7d33c-ea52-4068-98e7-fbf114ca1262'::uuid;
    BEGIN
        INSERT INTO chat_user(id, username, visible_name)
        VALUES (user_for_logging_in_id, 'user_for_logging_in', 'User for logging tests'),
               (user_not_in_labyrinth_id, 'user_not_in_labyrinth', 'User who has never joined labyrinth'),
               (user_in_labyrinth_alice_id, 'user_in_labyrinth_alice', 'Alice - in labyrinth'),
               (user_in_labyrinth_bob_id, 'user_in_labyrinth_bob', 'Bob - in labyrinth'),
               (user_in_labyrinth_carol_id, 'user_in_labyrinth_carol', 'Carol - in labyrinth');

        INSERT INTO friend_relation(id, chat_user_friend_id, chat_user_id, status)
        VALUES (1, user_in_labyrinth_alice_id, user_in_labyrinth_bob_id, 'ACCEPTED'),
               (2, user_in_labyrinth_bob_id, user_in_labyrinth_alice_id, 'ACCEPTED');

        ALTER SEQUENCE friend_relation_id_seq RESTART WITH 10;

    END
$$;
