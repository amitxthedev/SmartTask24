FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

RUN apk add --no-cache unzip && \
    unzip -o app.jar BOOT-INF/classes/aiven-ca.pem && \
    keytool -importcert -noprompt -cacerts \
      -alias aiven-ca -storepass changeit \
      -file BOOT-INF/classes/aiven-ca.pem

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]