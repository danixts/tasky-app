package com.tasky.common.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.aventrix.jnanoid.jnanoid.NanoIdUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tasky.common.exception.ApiErrorException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
public class StringTransform {
    private StringTransform() {
        throw new ApiErrorException("StringTransform Error");
    }

    static char[] alphabet = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
            'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'};

    public static String codeNanoId() {
        SecureRandom random = new SecureRandom();
        return NanoIdUtils.randomNanoId(random, alphabet, 5);
    }

    public static String codeNanoId(int size) {
        SecureRandom random = new SecureRandom();
        return NanoIdUtils.randomNanoId(random, alphabet, size);
    }

    public static <T> List<T> filterMerge(
            List<T> db,
            List<T> req,
            List<Function<T, Object>> keyExtractors,
            Function<T, String> orderFunction
    ) {
        Set<List<Object>> seenKeys = db.stream()
                .map(item -> keyExtractors.stream()
                        .map(extractor -> extractor.apply(item))
                        .toList())
                .collect(Collectors.toSet());

        return Stream.concat(db.stream(), req.stream())
                .filter(item -> {
                    List<Object> compositeKey = keyExtractors.stream()
                            .map(extractor -> extractor.apply(item))
                            .toList();
                    return seenKeys.add(compositeKey);
                })
                .sorted(Comparator.comparing(orderFunction))
                .toList();
    }

    public static <T> T createObjectMapper(String json, Class<T> object) {
        try {
            ObjectMapper map = new ObjectMapper();
            map.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            return map.readValue(json, object);
        } catch (JsonProcessingException ex) {
            log.error("ERROR JSON NOT PROCESSING {}", ex.getMessage());
            throw new ApiErrorException("ERROR JSON NOT PROCESSING", HttpStatus.BAD_REQUEST, null, false);
        }
    }

    public static String createObjectToJson(Object invoice) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(invoice);
        } catch (JsonProcessingException e) {
            throw new ApiErrorException("ERROR JSON OBJECT TO JSON", HttpStatus.BAD_REQUEST, null, false);
        }
    }

    public static boolean isValidJwt(String token) {
        if (token == null) return false;
        DecodedJWT jwt = JWT.decode(token);
        Date now = new Date();
        return jwt.getExpiresAt().compareTo(now) > 0;
    }


    public static LocalDate tokenExpireLocalDate(String token) {
        DecodedJWT jwt = JWT.decode(token);
        return dateToLocalDate(jwt.getExpiresAt());
    }


    private static LocalDate dateToLocalDate(Date date) {
        return date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }

    public static String formatJsonToSingleLine(String json) {
        if (json == null || json.trim().isEmpty()) {
            return json;
        }

        try {
            return json.replaceAll("\\s+", " ").trim();
        } catch (Exception e) {
            return json;
        }
    }
}

