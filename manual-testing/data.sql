DO
$$
    DECLARE
        -- chat_user
        alice_id uuid := '14c6d51b-1d4a-4be9-a5e2-df771ebf2051'::uuid;
        bob_id   uuid := 'cb563237-a662-4e07-9396-511cdbe84159'::uuid;
        carol_id uuid := 'c9b7d33c-ea52-4068-98e7-fbf114ca1262'::uuid;
    BEGIN
        INSERT INTO chat_user(id, username, visible_name)
        VALUES (alice_id, 'alice', 'Alice'),
               (bob_id, 'bob', 'Bob'),
               (carol_id, 'carol', 'Carol');

        INSERT INTO chat_inbox(user_id)
        VALUES (alice_id),
               (bob_id),
               (carol_id);

        INSERT INTO friend_relation(id, chat_user_friend_id, chat_user_id, status)
        VALUES (1, alice_id, bob_id, 'ACCEPTED'),
               (2, bob_id, alice_id, 'ACCEPTED'),
               (3, alice_id, carol_id, 'ACCEPTED'),
               (4, carol_id, alice_id, 'ACCEPTED'),
               (5, bob_id, carol_id, 'ACCEPTED'),
               (6, carol_id, bob_id, 'ACCEPTED');

        ALTER SEQUENCE friend_relation_id_seq RESTART WITH 10;

    END
$$;
