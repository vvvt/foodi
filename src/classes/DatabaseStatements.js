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

    CREATE_TABLE_MEALS: `
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY,
            date DATE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL
        )
    `,

    CREATE_TABLE_MEAL_NOTES: `
        CREATE TABLE IF NOT EXISTS mealNotes (
            mealId INTEGER NOT NULL,
            note TEXT NOT NULL,
            FOREIGN KEY (mealId)
                REFERENCES meals (id)
                ON DELETE CASCADE
        )
    `,

    CREATE_TABLE_MEAL_PRICES: `
        CREATE TABLE IF NOT EXISTS mealPrices (
            mealId INTEGER NOT NULL,
            priceGroup TEXT NOT NULL,
            price FLOAT NOT NULL,
            FOREIGN KEY (mealId)
                REFERENCES meals (id)
                ON DELETE CASCADE
        )
    `
});