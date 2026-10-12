package ma.atlas.erp.bootstrap;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/api/health")
    public HealthResponse health() {
        jdbc.queryForObject("SELECT 1 FROM bootstrap_metadata WHERE id = 1", Integer.class);
        return new HealthResponse("UP");
    }

    public record HealthResponse(String status) {}
}
