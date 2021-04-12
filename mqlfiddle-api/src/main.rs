use actix_web::{middleware::Logger, post, web, App, HttpServer};
use mongodb::{options::ClientOptions, Client};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct ExecuteResponse {
    result: String,
}

#[derive(Deserialize)]
struct ExecuteRequest {
    mql: String,
}

async fn listdbs() -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let client = Client::with_uri_str("mongodb://localhost:27017").await?;
    let dbs = client.list_database_names(None, None).await?;
    Ok(dbs)
}

#[post("/mqltest")]
async fn mqltest() -> String {
    let dbs = listdbs().await.unwrap();
    dbs.join(", ")
}

#[post("/execute")]
async fn execute(info: web::Json<ExecuteRequest>) -> web::Json<ExecuteResponse> {
    let res = ExecuteResponse {
        result: format!(
            "I am a placeholder for the actual result docs. Your mql input was: {}",
            info.mql
        ),
    };
    web::Json(res)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();

    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .service(execute)
            .service(mqltest)
    })
    .bind("localhost:5000")?
    .run()
    .await
}
