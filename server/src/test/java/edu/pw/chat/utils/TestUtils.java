package edu.pw.chat.utils;

import java.util.Random;

public class TestUtils {

    private static final Random random = new Random();

    public static byte[] get32RandomBytes() {
        byte[] result = new byte[32];
        random.nextBytes(result);

        return result;
    }

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int LENGTH = 40;

    public static String get40RandomCharactersString() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            sb.append(CHARACTERS.charAt(index));
        }
        return sb.toString();
    }

    public static long getRandomLong() {
        return random.nextLong();
    }
}
