use std::collections::HashMap;

use actix_files::Files;
use actix_web::{
    dev, error::ErrorForbidden, get, middleware::Logger, post, web, App, Error, FromRequest,
    HttpMessage, HttpRequest, HttpServer,
};
use bson::{doc, Document};
use crypto::digest::Digest;
use futures::{
    future::{ready, Ready},
    stream::StreamExt,
};
use mongodb::{options::UpdateOptions, Client};
use rand::{distributions::Alphanumeric, thread_rng, Rng};
use serde::{Deserialize, Serialize};

// http://entoweb.okstate.edu/ddd/insects/brownrecluse.htm
const SAVE_DB: &str = "fiddleback";
const SAVE_COL: &str = "spider";

const DEFAULT_SCHEMA: &str = "{\n  \"foo\": [\n    {\n      \"a\": 1\n    },\n    {\n      \"a\": \
                              2\n    }\n  ],\n  \"bar\": [\n    {\n      \"b\": 1\n    },\n    \
                              {\n      \"b\": 2\n    }\n  ]\n}";
const DEFAULT_QUERY: &str =
    "{\n  \"collection\": \"foo\",\n  \"query\": {\n    \"pipeline\": [\n      {\n        \
     \"$lookup\": {\n          \"from\": \"bar\",\n          \"as\": \"bar\",\n          \
     \"pipeline\": []\n        }\n      },\n      {\n        \"$addFields\": {\n          \"c\": \
     \"abc\"\n        }\n      }\n    ]\n  }\n}";
const DEFAULT_VERSION: &str = "4.4";

#[derive(Serialize)]
struct ExecuteResponse {
    result: Vec<Document>,
    execution_stats: Document,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
enum QueryOperation {
    #[serde(rename = "pipeline")]
    Aggregation(Vec<Document>),
    #[serde(rename = "filter")]
    Find(Document),
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct ExecuteRequest {
    schema: HashMap<String, Vec<Document>>,
    query: Query,
    version: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct Query {
    collection: String,
    #[serde(rename = "query")]
    operation: QueryOperation,
}

#[derive(Debug, Serialize, Deserialize)]
struct SaveData {
    schema: String,
    query: String,
    version: String,
}

#[derive(Serialize, Deserialize)]
struct SaveResponse {
    code: String,
}

fn get_hash(sd: &SaveData) -> String {
    let mut hasher = crypto::sha1::Sha1::new();
    let input_str = String::from(&sd.query) + &sd.schema + &sd.version;
    hasher.input_str(&input_str);
    hasher.result_str()
}

fn get_client<'a>(version: &str, clients: &'a MongoClients) -> &'a Client {
    match version {
        "3.6" => &clients.three_six,
        "4.0" => &clients.four_zero,
        "4.2" => &clients.four_two,
        "4.4" => &clients.four_four,
        _ => &clients.four_four,
    }
}

struct User {
    sso_username: String,
}

impl FromRequest for User {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;
    type Config = ();

    fn from_request(req: &HttpRequest, _payload: &mut dev::Payload) -> Self::Future {
        let res = req
            .cookie("auth_user")
            .map(|c| c.value().to_string())
            .ok_or(ErrorForbidden("no auth cookie"))
            .or_else(|e| std::env::var("DEFAULT_AUTH_USER").map_err(|_| e))
            .map(|sso_username| User { sso_username });
        ready(res)
    }
}

#[post("/api/save")]
async fn save(
    info: web::Json<SaveData>,
    mongo: web::Data<MongoClients>,
    user: User,
) -> web::Json<SaveResponse> {
    let db = mongo.api_client.database(SAVE_DB);
    let col = db.collection_with_type::<SaveData>(SAVE_COL);

    let code = get_hash(&info.0);

    col.update_one(
        doc! { "code": &code },
        doc! { "$set": doc! {
            "user": &user.sso_username,
            "query": &info.query,
            "schema": &info.schema,
            "version": &info.version,
        }},
        UpdateOptions::builder().upsert(true).build(),
    )
    .await
    .expect("failed to save");

    web::Json(SaveResponse { code })
}

#[get("/api/fiddle/{hash}")]
async fn load(path: web::Path<String>, mongo: web::Data<MongoClients>) -> web::Json<SaveData> {
    let db = mongo.api_client.database(SAVE_DB);
    let col = db.collection_with_type::<SaveData>(SAVE_COL);

    let doc = col
        .find_one(doc! {"code": path.into_inner()}, None)
        .await
        .expect("couldn't query MongoDB");

    if let Some(doc) = doc {
        return web::Json(SaveData {
            query: doc.query,
            schema: doc.schema,
            version: doc.version,
        });
    };

    web::Json(SaveData {
        query: DEFAULT_QUERY.into(),
        schema: DEFAULT_SCHEMA.into(),
        version: DEFAULT_VERSION.into(),
    })
}

#[post("/api/execute")]
async fn execute(
    info: web::Json<ExecuteRequest>,
    mongo: web::Data<MongoClients>,
) -> web::Json<ExecuteResponse> {
    let dbname: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from)
        .collect();

    let client = get_client(&info.version, &mongo);

    let db = client.database(&dbname);
    let col = info.schema.iter().nth(0).unwrap().0;

    for (col, docs) in info.schema.iter() {
        db.collection(col)
            .insert_many(docs.clone(), None)
            .await
            .expect("failed to insert docs");
    }

    let mut result = vec![];
    let execution_stats;

    match &info.query.operation {
        QueryOperation::Aggregation(pipeline) => {
            let mut cursor = db
                .collection(&info.query.collection)
                .aggregate(pipeline.clone(), None)
                .await
                .unwrap();

            while let Some(doc) = cursor.next().await {
                result.push(doc.unwrap())
            }

            let explain_doc = doc! {
                "explain": doc! {
                    "aggregate": &col,
                    "pipeline": pipeline,
                    "cursor": doc! {}
                },
                "verbosity": "executionStats"
            };

            execution_stats = db.run_command(explain_doc, None).await.unwrap();
        }
        QueryOperation::Find(filter) => {
            let mut cursor = db
                .collection(&info.query.collection)
                .find(filter.clone(), None)
                .await
                .unwrap();

            while let Some(doc) = cursor.next().await {
                result.push(doc.unwrap())
            }

            let explain_doc = doc! {
                "explain": doc! {
                    "find": &col,
                    "filter": filter,
                },
                "verbosity": "executionStats"
            };

            execution_stats = db.run_command(explain_doc, None).await.unwrap();
        }
    }

    db.drop(None).await.unwrap();

    let res = ExecuteResponse {
        result,
        execution_stats,
    };
    web::Json(res)
}

#[derive(Clone)]
struct MongoClients {
    three_six: Client,
    four_zero: Client,
    four_two: Client,
    four_four: Client,
    api_client: Client,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();

    let three_six_uri =
        std::env::var("MDB_THREE_SIX").unwrap_or("mongodb://localhost:27017".into());
    let four_zero_uri =
        std::env::var("MDB_FOUR_ZERO").unwrap_or("mongodb://localhost:27017".into());
    let four_two_uri = std::env::var("MDB_FOUR_TWO").unwrap_or("mongodb://localhost:27017".into());
    let four_four_uri =
        std::env::var("MDB_FOUR_FOUR").unwrap_or("mongodb://localhost:27017".into());
    let api_db_uri = std::env::var("MDB_API_URI").unwrap_or("mongodb://localhost:27017".into());

    let three_six = Client::with_uri_str(&three_six_uri).await.unwrap();
    let four_zero = Client::with_uri_str(&four_zero_uri).await.unwrap();
    let four_two = Client::with_uri_str(&four_two_uri).await.unwrap();
    let four_four = Client::with_uri_str(&four_four_uri).await.unwrap();
    let api_client = Client::with_uri_str(&api_db_uri).await.unwrap();

    let mongo_clients = MongoClients {
        three_six,
        four_zero,
        four_two,
        four_four,
        api_client,
    };

    let addr = std::env::var("MQLFIDDLE_API_ADDR").unwrap_or("0.0.0.0:5000".to_string());
    let static_file_dir =
        std::env::var("MQLFIDDLE_STATIC_FILE_DIR").unwrap_or("../mqlfiddle-fe/build".to_string());

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .service(execute)
            .service(save)
            .service(load)
            .service(Files::new("/", &static_file_dir).index_file("index.html"))
            .data(mongo_clients.clone())
            .route("/", web::get().to(|| web::HttpResponse::Ok().body("/")))
    })
    .bind(addr)?
    .run()
    .await
}
