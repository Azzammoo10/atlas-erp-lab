# syntax=docker/dockerfile:1.7
FROM eclipse-temurin:21.0.8_9-jdk-jammy AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY src src
# Optional cloud proxy CA is mounted for this step only, never copied to the image.
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then \
      export CURL_CA_BUNDLE=/run/secrets/proxy_ca; \
      cp "$JAVA_HOME/lib/security/cacerts" /tmp/atlas-cacerts; \
      keytool -importcert -noprompt -alias codex-proxy -file /run/secrets/proxy_ca -keystore /tmp/atlas-cacerts -storepass changeit; \
      export MAVEN_OPTS="-Djavax.net.ssl.trustStore=/tmp/atlas-cacerts -Djavax.net.ssl.trustStorePassword=changeit"; \
    fi; \
    if [ -n "$HTTPS_PROXY" ]; then \
      atlas_proxy="${HTTPS_PROXY#*://}"; \
      export MAVEN_OPTS="$MAVEN_OPTS -Dhttps.proxyHost=${atlas_proxy%:*} -Dhttps.proxyPort=${atlas_proxy##*:}"; \
      printf '<settings><proxies><proxy><id>build</id><active>true</active><protocol>http</protocol><host>%s</host><port>%s</port><nonProxyHosts>localhost|127.0.0.1</nonProxyHosts></proxy></proxies></settings>' "${atlas_proxy%:*}" "${atlas_proxy##*:}" > /tmp/atlas-settings.xml; \
    else printf '<settings/>' > /tmp/atlas-settings.xml; fi; \
    ./mvnw -s /tmp/atlas-settings.xml -B -DskipTests package && rm -f /tmp/atlas-cacerts /tmp/atlas-settings.xml

FROM eclipse-temurin:21.0.8_9-jre-jammy
WORKDIR /app
RUN groupadd --gid 10001 atlas && useradd --uid 10001 --gid atlas --no-create-home atlas
COPY --from=build --chown=atlas:atlas /app/target/atlas-erp-lab-0.0.1-SNAPSHOT.jar app.jar
USER atlas
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
