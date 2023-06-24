const express = require("express");
const path = require("path");
const { open } = require("sqlite");

const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseObject1 = (dbObject1) => {
  return {
    directorId: dbObject1.director_id,
    directorName: dbObject1.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieDetails = `SELECT movie_name FROM movie ;`;
  const movieArray = await db.all(getMovieDetails);
  response.send(
    movieArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

// add movie name
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movie = await db.get(getMovieDetails);
  response.send(convertDbObjectToResponseObject(movie));
});
// post movie name
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const getMovieDetails = `
   INSERT INTO 
   movie (director_id,movie_name,lead_actor)
   VALUES
   ( ${directorId},'${movieName}','${leadActor}');`;

  const movie = await db.run(getMovieDetails);
  response.send("Movie Successfully Added");
});

//put movie table
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const getMovieDetails = `
  UPDATE 
  movie
  SET
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
  WHERE movie_id=${movieId}`;

  await db.run(getMovieDetails);
  response.send("Movie Details Updated");
});
// delete movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const getMovieDetails = `
  DELETE FROM movie
  WHERE movie_id=${movieId};`;
  await db.run(getMovieDetails);
  response.send("Movie Removed");
});
// get all director

app.get("/directors/", async (request, response) => {
  const getMovieDetails = `SELECT * FROM director ;`;
  const directorArray = await db.all(getMovieDetails);
  response.send(
    directorArray.map((eachDirector) =>
      convertDbObjectToResponseObject1(eachDirector)
    )
  );
});

// put director details
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieDetails = `SELECT movie_name FROM director INNER JOIN movie ON 
   director.director_id=movie.director_id
   WHERE
   director.director_id=${directorId};`;
  const directorArray = await db.all(getMovieDetails);
  response.send(
    directorArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});
module.exports = app;
