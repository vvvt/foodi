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
    INSERT_INTO_CANTEENS: `INSERT OR IGNORE INTO canteens (id, name, city, address, lat, lng) VALUES (?,?,?,?,?,?)`,
    UPDATE_CANTEEN: `UPDATE canteens SET name=?, city=?, address=?, lat=?, lng=? WHERE id=?`,
    LOAD_ALL_CANTEENS: `SELECT * FROM canteens`,
    LOAD_CANTEENS_BETWEEN_COORDINATES: `SELECT * FROM canteens WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?`,

    CREATE_TABLE_MEALS: `
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY,
            canteenId INTEGER NOT NULL,
            date DATE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            imageUrl TEXT,
            FOREIGN KEY (canteenId)
                REFERENCES canteens (id)
                ON DELETE CASCADE
        )
    `,
    DROP_TABLE_MEALS: `DROP TABLE IF EXISTS meals`,
    INSERT_INTO_MEALS: `REPLACE INTO meals (id, canteenId, name, date, category) VALUES (?,?,?,date(?),?)`,
    LOAD_ALL_MEALS: `SELECT * FROM meals`,
    LOAD_MEALS_OF_CANTEEN: `SELECT * FROM meals WHERE canteenId=?`,
    DELETE_MEALS_BEFORE_LAST_WEEK: `DELETE FROM fetchedDays WHERE date(date) < date('now', '-7 days')`,

    CREATE_TABLE_MEAL_NOTES: `
        CREATE TABLE IF NOT EXISTS mealNotes (
            id INTEGER PRIMARY KEY,
            mealId INTEGER NOT NULL,
            note TEXT NOT NULL,
            FOREIGN KEY (mealId)
                REFERENCES meals (id)
                ON DELETE CASCADE,
            UNIQUE (mealId, note)
        )
    `,
    DROP_TABLE_MEAL_NOTES: `DROP TABLE IF EXISTS mealNotes`,
    INSERT_INTO_MEAL_NOTES: `REPLACE INTO mealNotes (mealId, note) VALUES (?,?)`,
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
    INSERT_INTO_MEAL_PRICES: `REPLACE INTO mealPrices (mealId, priceGroup, price) VALUES (?,?,?)`,
    LOAD_MEAL_PRICES_OF_MEAL: `SELECT priceGroup, price FROM mealPrices WHERE mealId=?`,

    CREATE_TABLE_FETCHED_DAYS: `
        CREATE TABLE IF NOT EXISTS fetchedDays (
            canteenId INTEGER NOT NULL,
            date DATE NOT NULL,
            PRIMARY KEY (canteenId, date),
            FOREIGN KEY (canteenId)
                REFERENCES canteens (id)
                ON DELETE CASCADE
        )
    `,
    DROP_TABLE_FETCHED_DAYS: `DROP TABLE IF EXISTS fetchedDays`,
    INSERT_INTO_FETCHED_DAYS: `REPLACE INTO fetchedDays (canteenId, date) VALUES (?,?)`,
    LOAD_ALL_FETCHED_DAYS: `SELECT canteenId, date FROM fetchedDays`,
    DELETE_FETCHED_DAYS_BEFORE_LAST_WEEK: `DELETE FROM meals WHERE date(date) < date('now', '-7 days')`
});