FROM eclipse-temurin:21-jdk-jammy AS builder
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY ./src ./src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-jammy
ARG JAR_NAME=safechat.jar
COPY --from=builder target/$JAR_NAME /opt/app/$JAR_NAME
ENTRYPOINT ["java", "-jar", "opt/app/safechat.jar"]