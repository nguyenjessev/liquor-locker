CREATE TABLE mixers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    opened BOOLEAN NOT NULL DEFAULT FALSE,
    open_date DATETIME,
    purchase_date DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
