package ma.atlas.erp.identity;

import ma.atlas.erp.bootstrap.ApiErrors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class WebSecurityConfiguration {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, ApiErrors errors) throws Exception {
        return http
            .csrf(Customizer.withDefaults())
            .authorizeHttpRequests(routes -> routes
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll())
            .requestCache(cache -> cache.disable())
            .formLogin(login -> login.disable())
            .httpBasic(basic -> basic.disable())
            .logout(logout -> logout.disable())
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) -> errors.write(request, response,
                    HttpStatus.UNAUTHORIZED, "AUTHENTICATION_REQUIRED", "Authentification requise."))
                .accessDeniedHandler((request, response, exception) -> errors.write(request, response,
                    HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Accès refusé.")))
            .build();
    }
}
