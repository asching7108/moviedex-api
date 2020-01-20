require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const MOVIEDEX = require('./movies-data.json');
const app = express();

// middlewares
const morganSetting = process.env.NODE_DEV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    next();
});
// error handling middleware
app.use((error, req, res, next) => {
    let response;
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' }};
    } else {
        response = { error };
    }
    res.status(500).json(response);
  })

app.get('/movies', (req, res) => {
    let response = MOVIEDEX;
    const { genre, country, avg_vote } = req.query;

    // query validation
    if (avg_vote && isNaN(parseFloat(avg_vote))) {
        return res
            .status(400)
            .send('avg_vote must be a numeric value');
    }

    // filters response to include the given genre
    if (genre) {
        response = response.filter(movie => 
            movie.genre.toLowerCase().includes(genre.toLowerCase())
        );
    }

    // filters response to include the given country
    if (country) {
        response = response.filter(movie => 
            movie.country.toLowerCase().includes(country.toLowerCase())
        );
    }

    // filters response to be greater than or equal to the given avg_vote
    if (avg_vote) {
        response = response.filter(movie => 
            movie.avg_vote >= Number(avg_vote)
        );
    }

    res.json(response);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {});