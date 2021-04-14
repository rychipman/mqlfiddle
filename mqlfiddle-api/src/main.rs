use std::collections::HashMap;

use actix_web::{get, middleware::Logger, post, web, App, HttpServer};
use bson::{doc, Document};
use crypto::digest::Digest;
use futures::stream::StreamExt;
use mongodb::{options::UpdateOptions, Client};
use rand::{distributions::Alphanumeric, thread_rng, Rng};
use serde::{Deserialize, Serialize};

// http://entoweb.okstate.edu/ddd/insects/brownrecluse.htm
const SAVE_DB: &str = "fiddleback";
const SAVE_COL: &str = "spider";

const DEFAULT_SCHEMA: &str = "{\n  \"foo\": [\n    {\n      \"a\": 1\n    },\n    {\n      \"a\": \
                              2\n    }\n  ],\n  \"bar\": [\n    {\n      \"b\": 1\n    },\n    \
                              {\n      \"b\": 2\n    }\n  ]\n}";
const DEFAULT_QUERY: &str = "{\n  \"collection\": \"foo\",\n  \"pipeline\": [\n    {\n      \
                             \"$lookup\": {\n        \"from\": \"bar\",\n        \"as\": \
                             \"bar\",\n        \"pipeline\": []\n      }\n    },\n    {\n      \
                             \"$addFields\": {\n        \"c\": \"abc\"\n      }\n    }\n  ]\n}";

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

#[derive(Debug, Serialize, Deserialize)]
struct SaveData {
    schema: String,
    query: String,
}

#[derive(Serialize, Deserialize)]
struct SaveResponse {
    code: String,
}

fn get_hash(sd: &SaveData) -> String {
    let mut hasher = crypto::sha1::Sha1::new();
    hasher.input_str(&sd.query);
    hasher.input_str(&sd.schema);
    hasher.result_str()
}

#[post("/save")]
async fn save(info: web::Json<SaveData>, mongo: web::Data<Client>) -> web::Json<SaveResponse> {
    let db = mongo.database(SAVE_DB);
    let col = db.collection_with_type::<SaveData>(SAVE_COL);

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

#[get("/{hash}")]
async fn load(path: web::Path<String>, mongo: web::Data<Client>) -> web::Json<SaveData> {
    let db = mongo.database(SAVE_DB);
    let col = db.collection_with_type::<SaveData>(SAVE_COL);

    let doc = col
        .find_one(doc! {"code": path.into_inner()}, None)
        .await
        .expect("couldn't query MongoDB");

    if let Some(doc) = doc {
        return web::Json(SaveData {
            query: doc.query,
            schema: doc.schema,
        });
    };

    web::Json(SaveData {
        query: DEFAULT_QUERY.into(),
        schema: DEFAULT_SCHEMA.into(),
    })
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

#[get("/")]
async fn index() -> String {
    "Welcome to MQLFiddle!".into()
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
            .service(load)
            .service(index)
            .data(client.clone())
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
