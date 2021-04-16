use std::collections::HashMap;

use actix_files::Files;
use actix_web::{
    dev,
    error::{ErrorForbidden, ResponseError},
    get, guard, http,
    middleware::Logger,
    post, web, App, FromRequest, HttpMessage, HttpRequest, HttpResponse, HttpServer,
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
use thiserror::Error;

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

#[derive(Error, Debug)]
enum Error {
    #[error("MongoDB {0} not available")]
    VersionNotAvailable(String),
    #[error(transparent)]
    MongoDB(#[from] mongodb::error::Error),
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl ResponseError for Error {}

type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AggregateOp {
    aggregate: String,
    pipeline: Vec<Document>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct FindOp {
    find: String,
    filter: Document,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
enum Query {
    Aggregate(AggregateOp),
    Find(FindOp),
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

struct User {
    sso_username: String,
}

impl FromRequest for User {
    type Error = actix_web::Error;
    type Future = Ready<std::result::Result<Self, Self::Error>>;
    type Config = ();

    fn from_request(req: &HttpRequest, _payload: &mut dev::Payload) -> Self::Future {
        let res = req
            .cookie("auth_user")
            .map(|c| c.value().to_string())
            .ok_or(ErrorForbidden("no auth cookie"))
            .or_else(|_| Ok(std::env::var("DEFAULT_AUTH_USER").unwrap_or("Guest".into())))
            .map(|sso_username| User { sso_username });
        ready(res)
    }
}

#[post("/api/save")]
async fn save(
    info: web::Json<SaveData>,
    mongo: web::Data<MongoClients>,
    user: User,
) -> Result<web::Json<SaveResponse>> {
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
    .await?;

    Ok(web::Json(SaveResponse { code }))
}

#[derive(Serialize)]
struct GetMongodbVersionsResponse {
    versions: Vec<String>,
}

#[get("/api/mongodb_versions")]
async fn get_mongodb_versions(
    mongo: web::Data<MongoClients>,
) -> web::Json<GetMongodbVersionsResponse> {
    let versions = vec!["4.4", "4.2", "4.0", "3.6"]
        .into_iter()
        .map(String::from)
        .filter(|v| mongo.get_client(v).is_some())
        .collect();
    web::Json(GetMongodbVersionsResponse { versions })
}

#[derive(Serialize)]
struct GetMyFiddlesResponse {
    fiddle_codes: Vec<String>,
}

#[get("/api/current_user/my_fiddles")]
async fn get_my_fiddles(
    user: User,
    mongo: web::Data<MongoClients>,
) -> Result<web::Json<GetMyFiddlesResponse>> {
    #[derive(Debug, Serialize, Deserialize)]
    struct Fiddle {
        code: String,
    }

    let db = mongo.api_client.database(SAVE_DB);
    let col = db.collection_with_type::<Fiddle>(SAVE_COL);

    let mut cursor = col.find(doc! {"user": user.sso_username}, None).await?;

    let mut fiddle_codes = Vec::new();
    while let Some(fiddle) = cursor.next().await {
        fiddle_codes.push(fiddle?.code);
    }

    Ok(web::Json(GetMyFiddlesResponse { fiddle_codes }))
}

#[derive(Serialize)]
struct GetCurrentUserResponse {
    username: String,
}

#[get("/api/current_user")]
async fn get_current_user(user: User) -> web::Json<GetCurrentUserResponse> {
    web::Json(GetCurrentUserResponse {
        username: user.sso_username,
    })
}

#[get("/api/fiddle/{hash}")]
async fn load(
    path: web::Path<String>,
    mongo: web::Data<MongoClients>,
) -> Result<web::Json<SaveData>> {
    let db = mongo.api_client.database(SAVE_DB);
    let col = db.collection_with_type::<SaveData>(SAVE_COL);

    let res = col.find_one(doc! {"code": path.into_inner()}, None).await?;
    let data = match res {
        Some(doc) => SaveData {
            query: doc.query,
            schema: doc.schema,
            version: doc.version,
        },
        None => SaveData {
            query: DEFAULT_QUERY.into(),
            schema: DEFAULT_SCHEMA.into(),
            version: DEFAULT_VERSION.into(),
        },
    };

    Ok(web::Json(data))
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct ExecuteRequest {
    schema: HashMap<String, Vec<Document>>,
    query: Query,
    version: String,
}

#[derive(Serialize)]
struct ExecuteResponse {
    result: Vec<Document>,
    execution_stats: Document,
}

#[post("/api/execute")]
async fn execute(
    info: web::Json<ExecuteRequest>,
    mongo: web::Data<MongoClients>,
) -> Result<web::Json<ExecuteResponse>> {
    let dbname: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from)
        .collect();

    let client = mongo
        .get_client(&info.version)
        .ok_or_else(|| Error::VersionNotAvailable(info.version.clone()))?;

    let db = client.database(&dbname);

    for (col, docs) in info.schema.iter() {
        db.collection(col).insert_many(docs.clone(), None).await?;
    }

    let mut result = vec![];
    let execution_stats;

    match &info.query {
        Query::Aggregate(op) => {
            let mut cursor = db
                .collection(&op.aggregate)
                .aggregate(op.pipeline.clone(), None)
                .await?;

            while let Some(doc) = cursor.next().await {
                result.push(doc?)
            }

            let explain_doc = doc! {
                "explain": doc! {
                    "aggregate": &op.aggregate,
                    "pipeline": &op.pipeline,
                    "cursor": doc! {}
                },
                "verbosity": "executionStats"
            };

            execution_stats = db.run_command(explain_doc, None).await?;
        }
        Query::Find(op) => {
            let mut cursor = db
                .collection(&op.find)
                .find(op.filter.clone(), None)
                .await?;

            while let Some(doc) = cursor.next().await {
                result.push(doc?)
            }

            let explain_doc = doc! {
                "explain": doc! {
                    "find": &op.find,
                    "filter": &op.filter,
                },
                "verbosity": "executionStats"
            };

            execution_stats = db.run_command(explain_doc, None).await?;
        }
    }

    db.drop(None).await?;

    let res = ExecuteResponse {
        result,
        execution_stats,
    };
    Ok(web::Json(res))
}

#[derive(Clone)]
struct MongoClients {
    three_six: Option<Client>,
    four_zero: Option<Client>,
    four_two: Option<Client>,
    four_four: Option<Client>,
    api_client: Client,
}

impl MongoClients {
    fn get_client(&self, version: &str) -> Option<&Client> {
        match version {
            "3.6" => self.three_six.as_ref(),
            "4.0" => self.four_zero.as_ref(),
            "4.2" => self.four_two.as_ref(),
            "4.4" => self.four_four.as_ref(),
            _ => None,
        }
    }
}

#[actix_web::main]
async fn main() -> Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();

    let three_six = match std::env::var("MDB_THREE_SIX") {
        Ok(uri) => Some(Client::with_uri_str(&uri).await?),
        Err(_) => None,
    };

    let four_zero = match std::env::var("MDB_FOUR_ZERO") {
        Ok(uri) => Some(Client::with_uri_str(&uri).await?),
        Err(_) => None,
    };

    let four_two = match std::env::var("MDB_FOUR_TWO") {
        Ok(uri) => Some(Client::with_uri_str(&uri).await?),
        Err(_) => None,
    };

    let four_four = match std::env::var("MDB_FOUR_FOUR") {
        Ok(uri) => Some(Client::with_uri_str(&uri).await?),
        Err(_) => None,
    };

    let api_db_uri = std::env::var("MDB_API").unwrap_or("mongodb://localhost:27017".into());
    let api_client = Client::with_uri_str(&api_db_uri).await?;

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
            .service(get_current_user)
            .service(get_my_fiddles)
            .service(get_mongodb_versions)
            .service(Files::new("/", &static_file_dir).index_file("index.html"))
            .data(mongo_clients.clone())
            .default_service(
                web::resource("")
                    .route(web::get().to(|| {
                        web::HttpResponse::Found()
                            .header(http::header::LOCATION, "/")
                            .finish()
                    }))
                    .route(web::route().guard(guard::Not(guard::Get())))
                    .to(HttpResponse::MethodNotAllowed),
            )
    })
    .bind(addr)?
    .run()
    .await?;

    Ok(())
}
