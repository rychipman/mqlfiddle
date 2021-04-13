use std::collections::hash_map::DefaultHasher;
use std::collections::HashMap;

use actix_web::{middleware::Logger, post, web, App, HttpServer};
use bson::{doc, Document};
use futures::stream::StreamExt;
use mongodb::{options::UpdateOptions, Client};
use rand::{distributions::Alphanumeric, thread_rng, Rng};
use serde::{Deserialize, Serialize};
use std::hash::{Hash, Hasher};

// http://entoweb.okstate.edu/ddd/insects/brownrecluse.htm
const SAVE_DB: &str = "fiddleback";
const SAVE_COL: &str = "spider";

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

#[derive(Serialize, Deserialize, Hash)]
struct SaveRequest {
    schema: String,
    query: String,
}

#[derive(Serialize, Deserialize)]
struct SaveResponse {
    code: String,
}

fn get_hash<T: Hash>(t: &T) -> String {
    let mut s = DefaultHasher::new();
    t.hash(&mut s);
    s.finish().to_string()
}

#[post("/save")]
async fn save(info: web::Json<SaveRequest>, mongo: web::Data<Client>) -> web::Json<SaveResponse> {
    let db = mongo.database(SAVE_DB);
    let col = db.collection(SAVE_COL);

    let code = get_hash(&info.0);

    col.update_one(
        doc! { "code": &code },
        doc! { "$set": doc! { "query": &info.query, "schema": &info.schema}},
        UpdateOptions::builder().upsert(true).build(),
    )
    .await
    .expect("failed to save");

    web::Json(SaveResponse { code })
}

#[post("/execute")]
async fn execute(
    info: web::Json<ExecuteRequest>,
    mongo: web::Data<Client>,
) -> web::Json<ExecuteResponse> {
    let dbname: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from)
        .collect();

    let db = mongo.database(&dbname);

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
            .service(save)
            .data(client.clone())
    })
    .bind("localhost:5000")?
    .run()
    .await
}
