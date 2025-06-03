--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

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

INSERT INTO public.labyrinth VALUES ('ab43aa8a-5d4d-4010-823c-ed79a6c8d167', 'edcc5ad9-7620-4133-b4cd-238c1e42ddb0');


--
-- Data for Name: device; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.device VALUES ('c1eda78d-942c-4f81-8c72-a9066bf1c09e', 'ab43aa8a-5d4d-4010-823c-ed79a6c8d167', '\x03edb11001d6d422d340a913ef09314fbf83913f32a916f1f5236141856701d1', '\xa3f2a6cbf0cade8230efe9b4c528a776835fa52cc7f0d543c97312979f286fa5', '\x2cef932eac97faa3b3ecdcda82494b3aeb38acbe3cecdcef89f758416810af3d02065c4568db4a5921f2f23029e3166073f6ca3c0e3769d54fc4fa3f096a020d', '\xb367ca734040e53802a2ce7eddfb30737935aee65dfcf2b9cde97d62c578b674', '\xae192ace9e57c66a7d3c483719fd3f969a253a8c56397fa42fec3642b143d92c993c0ab9ae1ba98f2fb4275c9c8d2f9709906efb0c0f9a740298ab9459680801', '2400-06-03 07:51:07.011349');
INSERT INTO public.device VALUES ('eecf1c50-48ca-401f-8d1c-13bebd218c9b', 'ab43aa8a-5d4d-4010-823c-ed79a6c8d167', '\xa200ef389e09713e4a173c91517484dd9f2c76a27ab8703755c482a35e5b906d', '\xc019ade2e6f3fa67afd400fa2ed09db253e447803ae920598f4da57291619048', '\x27cdb94b40008b1ead27fd8d061c1eb5e17d3e32b0d3ee1e5f1072ba6dafca96d373517a12639d4c2ea92af3f455011d547ccf773c8e1edb04f30f532da9520f', '\x4938dab6d80ec67b96baae8951b8f79f29f62bdc9fad2a40b383225fca7b5ce5', '\x223f7568cac9a4be65b3a208747a6f3cf2bf2f5a290c4f18c94c4ba66fd7b769ea6594489367c28247a33b5a41f99831f8abaa4b238aba175d0b3c7a8e17400a', '2400-06-03 07:51:09.044972');


--
-- Data for Name: epoch; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.epoch VALUES ('79dc2ede-f681-4256-a6a7-5485e50daf13', 'ab43aa8a-5d4d-4010-823c-ed79a6c8d167', '0');


--
-- Data for Name: device_epoch_membership_proof; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.device_epoch_membership_proof VALUES (114, '79dc2ede-f681-4256-a6a7-5485e50daf13', 'c1eda78d-942c-4f81-8c72-a9066bf1c09e', '\x2e9bc370747fe998e4abc2e008435caa4234e7231834e226430c8a98e218e78e');
INSERT INTO public.device_epoch_membership_proof VALUES (115, '79dc2ede-f681-4256-a6a7-5485e50daf13', 'eecf1c50-48ca-401f-8d1c-13bebd218c9b', '\x084bed8d984a5b8556715e6354f873885f6e9cbb31b68963db0dde5ebf5b29ee');


--
-- Data for Name: virtual_device; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.virtual_device VALUES ('\x60d4c947308e95177321e0e2ba7dfe7c', 'ab43aa8a-5d4d-4010-823c-ed79a6c8d167', '\x008cde42b8b6b86f770e167269c5706351a67a8af2d124513db875d1193528e9', '\xceb03ba450cdf2b8293c6e36bc174c8557b3e0f57f2dc2993d78afb4dffbc5a1', '\xde9146d84af29136b7c5ca35a0f0cc2f2d09a177a09f3679d619433261a2b59ba414e1e1ff1b3e4507495a522d727a81c27fb491ccb2af38347f00a8b64cec04');


--
-- Data for Name: virtual_device_encrypted_recovery_secrets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.virtual_device_encrypted_recovery_secrets VALUES (69, '\x60d4c947308e95177321e0e2ba7dfe7c', '79dc2ede-f681-4256-a6a7-5485e50daf13', '\x8b4a3d3258a378d79fec505469424c8523bc27c5451f1b2bb6cdfd02ace4f22becc8eb940f62ffe763f50e4296cbe1356448ff9f5ce47fd9a3e0bfe5e7d71f22ef2a817c65f08486', '\xead75edb20e81ca84f0529675158fa02282ceba5fd577ec54688e841e19980bb1f7a1afdbadc12ebf56456dd6f076988165850371fafd411c6ff94bf', '\x3b7e582f10ac84007abd3b508be44cbaf7ba5c3f2cbcfac6a7a96f8db9', '\x90934905b45b07ad7b4fe870bcd2027b3ae564a20fe653e5cdd1bd60647b0fb8a07cb70a303bac070a2a2b0c0dce7bc6802b1149d94bf4a1d13f74e8dbb95978bb6f2dbc0ba92e6f');


--
-- Data for Name: virtual_device_epoch_membership_proof; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.virtual_device_epoch_membership_proof VALUES (70, '79dc2ede-f681-4256-a6a7-5485e50daf13', '\x0ae61d91ffa73fd1ac572eaff0d6137bc0d1fdb4b2ed7f2b328f09f19b358ccc');


--
-- Name: device_epoch_membership_proof_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.device_epoch_membership_proof_id_seq', 115, true);


--
-- Name: virtual_device_encrypted_recovery_secrets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.virtual_device_encrypted_recovery_secrets_id_seq', 69, true);


--
-- Name: virtual_device_epoch_membership_proof_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.virtual_device_epoch_membership_proof_id_seq', 70, true);


--
-- PostgreSQL database dump complete
--

