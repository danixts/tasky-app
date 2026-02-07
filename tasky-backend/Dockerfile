FROM maven:3.9.11-eclipse-temurin-25-noble AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM azul/zulu-openjdk-alpine:25-latest
WORKDIR /app
ENV TZ=America/La_Paz
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/"$TZ" /etc/localtime && \
    addgroup -g 1001 -S app && adduser -u 1001 -S app -G app
COPY --from=build /app/target/*.jar app.jar
RUN chown app:app app.jar
USER app
EXPOSE 9000
ENTRYPOINT ["java", "-jar", "app.jar"]
