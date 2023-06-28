const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");

const databaseFile = "./database/appdata.db";
let db;

// Set up our database
const existingDatabase = fs.existsSync(databaseFile);

const createUsersTableSQL = 
    "CREATE TABLE users(id TEXT PRIMARY KEY, username TEXT NOT NULL)";
const createItemsTableSQL = 
    "CREATE TABLE items (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, " +
    "access_token TEXT NOT NULL, transaction_cursor TEXT, bank_name TEXT, " +
    "is_active INTEGER NOT_NULL DEFAULT 1, " +
    "FOREIGN KEY(user_id) REFERENCES users(id))";
const createAccountsTable = 
    "CREATE TABLE accounts (id TEXT PRIMARY KEY, item_id TEXT NOT NULL, " +
    "name TEXT, FOREIGN KEY(item_id) REFERENCES items(id))";
const createTransactionsTableSQL =
    "CREATE TABLE transactions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, " +
    "account_id TEXT NOT NULL, category TEXT, date TEXT, " +
    "authorized_date TEXT, name TEXT, amount REAL, currency_code TEXT, " +
    "is_removed INTEGER NOT_NULL DEFAULT 0, " +
    "FOREIGN KEY(user_id) REFERENCES users(id), " +
    "FOREIGN KEY(account_id) REFERENCES accounts(id))";

dbWrapper
    .open({ filename: databaseFile, driver: sqlite3.Database })
    .then(async (dBase) => {
        db = dBase;
        try {
            if (!existingDatabase) {
                // Database doesn't exist yet -- let's create it!
                await db.run(createUsersTableSQL);
                await db.run(createItemsTableSQL);
                await db.run(createAccountsTable);
                await db.run(createTransactionsTableSQL);
                console.log("Database has been created!")
            } else {
                // Avoids a rare bug where the database gets created but the tables don't
                const tableNames = await db.all(
                    "SELECT name FROM sqlite_master WHERE type='table'"
                );
                const tableNamesToCreationSQL = {
                    users: createUsersTableSQL,
                    items: createItemsTableSQL,
                    accounts: createAccountsTable,
                    transactions: createAccountsTable
                };
                for (const [tableName, creationSQL] of Object.entries(
                    tableNamesToCreationSQL
                )) {
                    if (!tableNames.some((table) => table.name === tableName)) {
                        console.log(`Creating ${tableName} table`);
                        await db.run(creationSQL);
                    }
                }
                console.log("Database is up and running!");
                sqlite3.verbose();
            }
        } catch (dbError) {
            console.error(dbError);
        }
    });

    const getUserRecord = async function (userId) {
        const result = await db.get(`SELECT * FROM users WHERE id=?`, userId);
        return result;
    }

    module.exports = {
        getUserRecord
    }