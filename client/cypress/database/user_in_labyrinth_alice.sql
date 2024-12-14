--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: labyrinth; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.labyrinth VALUES ('7639e349-2420-41d3-8ed4-2199bb110285', 'edcc5ad9-7620-4133-b4cd-238c1e42ddb0');


--
-- Data for Name: device; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.device VALUES ('c6b3ff0d-4e15-43d3-8882-6d77e2621fda', '7639e349-2420-41d3-8ed4-2199bb110285', '\xfee354a0d4142f05f1eafcd64ecdd20561c7090adb835f263f0f4e97520b738d', '\xea2ff487733b436c4392ed921eb8ea196f1414b0980411bc2ffd61c6c7cbab5e', '\x9c7c15a17cc83d655ec0d7b6ac2168bf8331d10777712886762e88afaf52121015645494d4c860828ba94f427c9f328ec00e526cbef8414b7fb902daade8cd0a', '\xa23707882dd474f288afdeb01f11d8dcbaf4a682a1b57ff2c09533c3d3f3f427', '\x6a64518a8fedd1cf538747e3085795cf5d6770b2c29a0c5adb10e0b23dc69a24f62f6612b73603fcf809a14b22bff7213591723f961e7db0e511ccc5718d7209');
INSERT INTO public.device VALUES ('7cc8dbc4-74c9-4de1-ad1b-5d4bbe2a4fd4', '7639e349-2420-41d3-8ed4-2199bb110285', '\xe8ab1a42d270ccf464af41f5fa1f16b3b12240c5dda1542f996ccfb43ed7fc27', '\x80f83b070b0cfa164db131962ce2c1453fc3bae4d2ff0ebf70b663484444ca87', '\xd2b182d4d7172f4d115af3313ed6c61701b75d9f4a94e6ac62d769248db6e9bc91445e9d0289ae1e9b5c398b0ac86b4d72da38149d4bf89536132a77891c5002', '\xf9fcfb71cfef8940951b29123bcaa1c9d938fe26e6e225fd6911478c79c0f3f4', '\x31b81b49ef9d4106f731f4e1146811537f574249a4853cac72942460b68224937bfa55cb73769d843168d8e74ce3acb3a8f1b2ded8aa1ccecda80bc31180b302');


--
-- Data for Name: epoch; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.epoch VALUES ('f67ff2c0-39b1-49db-a7c3-2f18ae046cd0', '7639e349-2420-41d3-8ed4-2199bb110285', '0');


--
-- Data for Name: device_epoch_membership_proof; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.device_epoch_membership_proof VALUES (26, 'f67ff2c0-39b1-49db-a7c3-2f18ae046cd0', 'c6b3ff0d-4e15-43d3-8882-6d77e2621fda', '\xa6c77f1a98b1c219503d71bd36e84b75c9b4efccbbd26b4d42d0ffd4ecb34f4e');
INSERT INTO public.device_epoch_membership_proof VALUES (27, 'f67ff2c0-39b1-49db-a7c3-2f18ae046cd0', '7cc8dbc4-74c9-4de1-ad1b-5d4bbe2a4fd4', '\x89e65f260eed0df8f229674adb7f43082ce6faba86ec8e8ec5ddb42762fa5348');


--
-- Data for Name: virtual_device; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.virtual_device VALUES ('\xe52af25a853a1dc5c77e365524886419', '7639e349-2420-41d3-8ed4-2199bb110285', '\xe7a0bd7ac9dad716ada2977f131a15b86c681536e5a3da35c8b634aa7c10df9c', '\x205e045e951487128e1ecd08293bd293527ebfc8b705532f78b73ba17e5434f6', '\x919ceb5996c0ca093922ae3e28beb64f62117d0132904134f7cdc961e5b944c5326cae959ad29a18e379514f51a21a665e88f9aceb402015c9ceba339e57da0c');


--
-- Data for Name: virtual_device_encrypted_recovery_secrets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.virtual_device_encrypted_recovery_secrets VALUES (19, '7639e349-2420-41d3-8ed4-2199bb110285', '\xe52af25a853a1dc5c77e365524886419', 'f67ff2c0-39b1-49db-a7c3-2f18ae046cd0', '\xc818efce0902f801e9f39b616cab87fe03d4e4d97b4e8a303f16233fef7f54f79f889e8b02596a66f7297a2e8afdab4e2311c6476f3a1d991f9645e9a7ebb35e40c55a2e17975245', '\xe0aab4bf3e60f986171c8e2254c0033b74f4df28d33a3fe41507bd6ed172e000175068dd03da8674334af36da442a0a4755d253813f4794370e31cb4', '\xde986f28f685d3454f5ebeb6fe777be9194a4f6184eb7aab2dea6222c3', '\x942cca7919b135d9fc9565c5fa5dfc94dcbe14ead827a6fcd7ab4281eccb924d34e953c5ed32562b3caa72a5cc1dffd240a319458bb3af317a03f5d415d8cd57ab6b7661ee499f01');


--
-- Data for Name: virtual_device_epoch_membership_proof; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.virtual_device_epoch_membership_proof VALUES (19, 'f67ff2c0-39b1-49db-a7c3-2f18ae046cd0', '\x47395e88d805b639ebc2f1482f98daeab7b0d2e133c6ee02e7d3ca7faf7ee5eb');


--
-- Name: device_epoch_membership_proof_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.device_epoch_membership_proof_id_seq', 27, true);


--
-- Name: virtual_device_encrypted_recovery_secrets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.virtual_device_encrypted_recovery_secrets_id_seq', 19, true);


--
-- Name: virtual_device_epoch_membership_proof_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.virtual_device_epoch_membership_proof_id_seq', 19, true);


--
-- PostgreSQL database dump complete
--

