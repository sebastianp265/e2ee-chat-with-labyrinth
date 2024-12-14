DO
$$
    DECLARE
        -- chat_user
        user_for_logging_in_id           uuid := '9a33b3bc-12c4-4741-b928-e24e28215cfd'::uuid;
        user_not_in_labyrinth_id         uuid := '6c84fbad-12c4-11ec-82a8-0242ac130003'::uuid;
        user_in_labyrinth_alice_id       uuid := '14c6d51b-1d4a-4be9-a5e2-df771ebf2051'::uuid;
        user_in_labyrinth_bob_id         uuid := 'cb563237-a662-4e07-9396-511cdbe84159'::uuid;
        user_in_labyrinth_carol_id       uuid := 'c9b7d33c-ea52-4068-98e7-fbf114ca1262'::uuid;

        -- chat_inboxes
        chat_inbox_not_in_labyrinth_id   uuid := 'c075e418-d1b3-4228-8217-eeccbdea26ac'::uuid;
        chat_inbox_in_labyrinth_alice_id uuid := 'edcc5ad9-7620-4133-b4cd-238c1e42ddb0'::uuid;
        chat_inbox_in_labyrinth_bob_id   uuid := 'e107b609-d92a-4615-9556-04211d4e5da1'::uuid;
        chat_inbox_in_labyrinth_carol_id uuid := 'a72f06ae-75c5-46e4-9469-c3791d77f0df'::uuid;
    BEGIN
        INSERT INTO chat_inbox(id, user_id)
        VALUES (chat_inbox_not_in_labyrinth_id, user_not_in_labyrinth_id),
               (chat_inbox_in_labyrinth_alice_id, user_in_labyrinth_alice_id),
               (chat_inbox_in_labyrinth_bob_id, user_in_labyrinth_bob_id),
               (chat_inbox_in_labyrinth_carol_id, user_in_labyrinth_carol_id);
    END
$$;
