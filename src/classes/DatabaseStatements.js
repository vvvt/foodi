export default Object.freeze({
    ENABLE_FOREIGN_KEYS: `PRAGMA foreign_keys = ON`,

    CREATE_TABLE_CANTEENS: `
        CREATE TABLE IF NOT EXISTS canteens (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            city TEXT NOT NULL,
            address TEXT NOT NULL,
            lat DOUBLE,
            lng DOUBLE 
        )
    `,
    DROP_TABLE_CANTEENS: `DROP TABLE IF EXISTS canteens`,
    INSERT_INTO_CANTEENS: `INSERT OR REPLACE INTO canteens (id, name, city, address, lat, lng) VALUES (?,?,?,?,?,?)`,
    LOAD_ALL_CANTEENS: `SELECT * FROM canteens`,

    CREATE_TABLE_MEALS: `
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY,
            canteenId INTEGER NOT NULL,
            date DATE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            FOREIGN KEY (canteenId)
                REFERENCES canteens (id)
                ON DELETE CASCADE
        )
    `,
    DROP_TABLE_MEALS: `DROP TABLE IF EXISTS meals`,
    INSERT_INTO_MEALS: `INSERT OR REPLACE INTO meals (id, canteenId, name, date, category) VALUES (?,?,?,?,?)`,
    LOAD_ALL_MEALS: `SELECT * FROM meals`,

    CREATE_TABLE_MEAL_NOTES: `
        CREATE TABLE IF NOT EXISTS mealNotes (
            id INTEGER PRIMARY KEY,
            mealId INTEGER NOT NULL,
            note TEXT NOT NULL,
            FOREIGN KEY (mealId)
                REFERENCES meals (id)
                ON DELETE CASCADE
        )
    `,
    DROP_TABLE_MEAL_NOTES: `DROP TABLE IF EXISTS mealNotes`,
    INSERT_INTO_MEAL_NOTES: `INSERT OR REPLACE INTO mealNotes (mealId, note) VALUES (?,?)`,
    LOAD_MEAL_NOTES_OF_MEAL: `SELECT note FROM mealNotes WHERE mealId=?`,

    CREATE_TABLE_MEAL_PRICES: `
        CREATE TABLE IF NOT EXISTS mealPrices (
            id INTEGER PRIMARY KEY,
            mealId INTEGER NOT NULL,
            priceGroup TEXT NOT NULL,
            price FLOAT NOT NULL,
            FOREIGN KEY (mealId)
                REFERENCES meals (id)
                ON DELETE CASCADE
        )
    `,
    DROP_TABLE_MEAL_PRICES: `DROP TABLE IF EXISTS mealPrices`,
    INSERT_INTO_MEAL_PRICES: `INSERT OR REPLACE INTO mealPrices (mealId, priceGroup, price) VALUES (?,?,?)`,
    LOAD_MEAL_PRICES_OF_MEAL: `SELECT priceGroup, price FROM mealPrices WHERE mealId=?`
});