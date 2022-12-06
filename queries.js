require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;


console.log("DATABASE_URL", DATABASE_URL);
const pool = new Pool({
    DATABASE_URL
});

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

const getUserById = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    })
}

const createUser = (request, response) => {
    const { name, email } = request.body;

    pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
      if (error) {
        throw error;
      }  
      response.status(201).send(`User added with ID: ${results.rows[0].id}`);
    })
}

module.exports = {
    getUsers,
    getUserById,
    createUser
}