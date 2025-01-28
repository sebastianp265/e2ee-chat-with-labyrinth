-- Labyrinth module
DELETE
FROM chat_message;
DELETE
FROM device_epoch_membership_proof;
DELETE
FROM encrypted_epoch_entropy_for_device;
DELETE
FROM encrypted_epoch_entropy_for_virtual_device;
DELETE
FROM device;
DELETE
FROM virtual_device_encrypted_recovery_secrets;
DELETE
FROM virtual_device_epoch_membership_proof;
DELETE
FROM virtual_device;
DELETE
FROM chat_inbox;
DELETE
FROM epoch;
DELETE
FROM labyrinth;
-- User module
DELETE
FROM friend_relation;
DELETE
FROM chat_user;
-- Chat module
DELETE
FROM chat_thread_member;
DELETE
FROM chat_thread;
DELETE
FROM chat_inbox;
