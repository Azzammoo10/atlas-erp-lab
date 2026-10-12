package ma.atlas.erp.bootstrap;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(DataAccessException.class)
    ProblemDetail databaseUnavailable() {
        return ApiErrors.problem(HttpStatus.SERVICE_UNAVAILABLE, "SERVICE_UNAVAILABLE", "Service temporairement indisponible.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail invalidRequest() {
        return ApiErrors.problem(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "Requête invalide.");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ProblemDetail notFound() {
        return ApiErrors.problem(HttpStatus.NOT_FOUND, "NOT_FOUND", "Ressource introuvable.");
    }
}
