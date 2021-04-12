use std::collections::HashMap;

use actix_web::{middleware::Logger, post, web, App, HttpServer};
use bson::Bson;
use mongodb::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct ExecuteResponse {
    result: Bson,
}

#[derive(Deserialize, Serialize, Clone)]
struct ExecuteRequest {
    schema: HashMap<String, Vec<bson::Document>>,
    query: Query,
}

#[derive(Deserialize, Serialize, Clone)]
struct Query {
    collection: String,
    pipeline: Bson,
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
        result: bson::bson!({"requestBody": bson::to_bson(&info.0).unwrap(), "a": 1, "b": 2}),
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
