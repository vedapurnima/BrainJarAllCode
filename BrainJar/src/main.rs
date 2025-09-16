mod db;
mod routes;
mod models;
mod middleware;

use actix_web::{web, App, HttpServer, middleware::Logger, http};
use actix_cors::Cors;
use dotenv::dotenv;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables
    dotenv().ok();

    // Set default JWT_SECRET if not provided
    if std::env::var("JWT_SECRET").is_err() {
        unsafe {
            std::env::set_var("JWT_SECRET", "brainjar_secret_key_2025");
        }
        println!("Using default JWT_SECRET");
    }

    // Initialize logging
    tracing_subscriber::fmt::init();

    // Try to create database connection pool (optional for now)
    let pool = match db::create_db_pool().await {
        Ok(pool) => {
            println!("Database connected successfully");
            Some(web::Data::new(pool))
        }
        Err(e) => {
            println!("Warning: Failed to connect to database: {}. Running in offline mode.", e);
            None
        }
    };

    println!("Server running on http://localhost:7000");

    HttpServer::new(move || {
        // Read environment
        let env = std::env::var("RUST_ENV").unwrap_or_else(|_| "development".into());

        // Configure CORS
        let cors = if env == "production" {
            // Allowed origins from ENV (comma-separated)
            let allowed_origins = std::env::var("ALLOWED_ORIGINS")
                .unwrap_or_else(|_| "https://yourdomain.com".into());

            let mut cors = Cors::default()
                .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
                .allowed_headers(vec![
                    http::header::AUTHORIZATION,
                    http::header::ACCEPT,
                    http::header::CONTENT_TYPE,
                ])
                .supports_credentials()
                .max_age(3600);

            for origin in allowed_origins.split(',') {
                cors = cors.allowed_origin(origin.trim());
            }
            cors
        } else {
            // Development: allow all
            Cors::permissive()
        };

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .configure(|cfg| {
                if let Some(pool) = pool.clone() {
                    cfg.app_data(pool);
                }
                routes::configure(cfg);
            })
    })
    .bind(("0.0.0.0", 7000))?
    .run()
    .await
}
