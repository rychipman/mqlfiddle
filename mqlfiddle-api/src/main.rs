use std::collections::HashMap;

use actix_web::{middleware::Logger, post, web, App, HttpServer};
use bson::Document;
use futures::stream::StreamExt;
use mongodb::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct ExecuteResponse {
    result: Vec<Document>,
}

#[derive(Deserialize, Serialize, Clone)]
struct ExecuteRequest {
    schema: HashMap<String, Vec<Document>>,
    query: Query,
}

#[derive(Deserialize, Serialize, Clone)]
struct Query {
    collection: String,
    pipeline: Vec<Document>,
}

#[post("/execute")]
async fn execute(
    info: web::Json<ExecuteRequest>,
    mongo: web::Data<Client>,
) -> web::Json<ExecuteResponse> {
    let db = mongo.database("blahdb");

    for (col, docs) in info.schema.iter() {
        db.collection(col)
            .insert_many(docs.clone(), None)
            .await
            .expect("failed to insert docs");
    }

    let mut cursor = db
        .collection(&info.query.collection)
        .aggregate(info.query.pipeline.clone(), None)
        .await
        .unwrap();

    let mut docs = Vec::new();
    while let Some(doc) = cursor.next().await {
        docs.push(doc.unwrap())
    }

    db.drop(None).await.unwrap();

    let res = ExecuteResponse { result: docs };
    web::Json(res)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();

    let client = Client::with_uri_str("mongodb://localhost:27017")
        .await
        .unwrap();

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .service(execute)
            .data(client.clone())
    })
    .bind("localhost:5000")?
    .run()
    .await
}
