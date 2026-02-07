package com.tasky.common.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.tasky.common.exception.ApiErrorException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("StringTransform")
class StringTransformTest {

    @Test
    void shouldGenerate5CharacterString_whenCodeNanoIdCalled() {
        String result = StringTransform.codeNanoId();
        assertNotNull(result);
        assertEquals(5, result.length());
        assertTrue(result.matches("[0-9A-Z]+"));
    }

    @Test
    void shouldGenerateStringOfGivenSize_whenCodeNanoIdCalledWithSize() {
        String result = StringTransform.codeNanoId(10);
        assertNotNull(result);
        assertEquals(10, result.length());
        assertTrue(result.matches("[0-9A-Z]+"));
    }

    @Test
    void shouldMergeListsKeepingOnlyNewKeysFromRequest_whenFilterMergeCalled() {
        record Item(String id, String name) {}
        List<Item> db = List.of(new Item("1", "A"), new Item("2", "B"));
        List<Item> req = List.of(new Item("2", "B2"), new Item("3", "C"));
        List<Function<Item, Object>> extractors = List.of(Item::id);
        Function<Item, String> order = Item::id;

        List<Item> result = StringTransform.filterMerge(db, req, extractors, order);

        assertEquals(1, result.size());
        assertEquals("3", result.get(0).id());
        assertEquals("C", result.get(0).name());
    }

    @Test
    void shouldDeserializeJson_whenValidJsonProvided() {
        String json = "{\"username\":\"test\",\"email\":\"test@test.com\"}";
        record User(String username, String email) {}

        User result = StringTransform.createObjectMapper(json, User.class);

        assertEquals("test", result.username());
        assertEquals("test@test.com", result.email());
    }

    @Test
    void shouldThrowApiErrorException_whenInvalidJsonProvided() {
        String json = "invalid json {";

        assertThrows(ApiErrorException.class, () ->
                StringTransform.createObjectMapper(json, String.class));
    }

    @Test
    void shouldIgnoreUnknownProperties_whenDeserializingJson() {
        String json = "{\"username\":\"test\",\"extra\":\"ignored\"}";
        record User(String username) {}

        User result = StringTransform.createObjectMapper(json, User.class);

        assertEquals("test", result.username());
    }

    @Test
    void shouldSerializeObjectToJson_whenValidObjectProvided() {
        record User(String name) {}
        User user = new User("test");

        String result = StringTransform.createObjectToJson(user);

        assertNotNull(result);
        assertTrue(result.contains("test"));
    }

    @Test
    void shouldReturnFalse_whenTokenIsNull() {
        assertFalse(StringTransform.isValidJwt(null));
    }

    @Test
    void shouldReturnFalse_whenTokenIsExpired() throws Exception {
        String token = JWT.create()
                .withExpiresAt(Date.from(Instant.now().minusSeconds(3600)))
                .sign(Algorithm.none());

        assertFalse(StringTransform.isValidJwt(token));
    }

    @Test
    void shouldReturnTrue_whenTokenIsNotExpired() throws Exception {
        String token = JWT.create()
                .withExpiresAt(Date.from(Instant.now().plusSeconds(3600)))
                .sign(Algorithm.none());

        assertTrue(StringTransform.isValidJwt(token));
    }

    @Test
    void shouldReturnExpirationDate_whenValidTokenProvided() throws Exception {
        var futureDate = Date.from(Instant.now().plusSeconds(86400));
        String token = JWT.create()
                .withExpiresAt(futureDate)
                .sign(Algorithm.none());

        var result = StringTransform.tokenExpireLocalDate(token);

        assertNotNull(result);
    }

    @Test
    void shouldReturnNull_whenFormatJsonToSingleLineGivenNull() {
        assertNull(StringTransform.formatJsonToSingleLine(null));
    }

    @Test
    void shouldReturnEmptyString_whenFormatJsonToSingleLineGivenEmpty() {
        assertEquals("", StringTransform.formatJsonToSingleLine(""));
    }

    @Test
    void shouldCollapseWhitespace_whenFormatJsonToSingleLineGivenJsonWithSpaces() {
        String json = "{\"a\":  1\n,\"b\":  2}";
        String result = StringTransform.formatJsonToSingleLine(json);

        assertNotNull(result);
        assertFalse(result.contains("\n"));
    }

    @Test
    void shouldThrowApiErrorException_whenConstructorInstantiated() {
        assertThrows(ApiErrorException.class, () -> {
            try {
                var constructor = StringTransform.class.getDeclaredConstructor();
                constructor.setAccessible(true);
                constructor.newInstance();
            } catch (Exception e) {
                throw e.getCause();
            }
        });
    }
}
