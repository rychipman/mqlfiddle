use actix_web::{middleware::Logger, post, web, App, HttpServer};
use serde::Serialize;

#[derive(Serialize)]
struct ExecuteResponse {
    result: String,
}

#[post("/execute")]
async fn execute() -> web::Json<ExecuteResponse> {
    let res = ExecuteResponse {
        result: "I am a placeholder for the actual result docs".into(),
    };
    web::Json(res)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();

    HttpServer::new(|| App::new().wrap(Logger::default()).service(execute))
        .bind("localhost:4000")?
        .run()
        .await
}
