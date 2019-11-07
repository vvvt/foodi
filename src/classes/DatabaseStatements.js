export default Object.freeze({
    CREATE_TABLE_CANTEENS: `
        CREATE TABLE IF NOT EXIST canteens (
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
            name TEXT NOT NULL,
            notes TEXT NOT NULL,
            prices TEXT NOT NULL,
            category TEXT NOT NULL
        )
    `,

    CREATE_TABLE_MEAL_NOTES: `
        CREATE TABLE IF NOT EXISTS mealNotesMapping (
            id INTEGER PRIMARY KEY,
            mealId INTEGER NOT NULL,
            note TEXT NOT NULL,
            FOREIGN KEY (mealId) REFERENCES meals (id)
        )
    `
});