CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    phone TEXT NOT NULL,
        -- CHECK (phone like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE categories (
    category_name TEXT PRIMARY KEY
);

CREATE TABLE items (
    category TEXT NOT NULL
        REFERENCES categories,
    item_name TEXT PRIMARY KEY,
    item_desc TEXT NOT NULL,
    item_price NUMERIC(4,2) NOT NULL
);

CREATE TABLE favorites (
    user_name TEXT NOT NULL
        REFERENCES users ON DELETE CASCADE,
    item_name TEXT NOT NULL
        REFERENCES items ON DELETE CASCADE
);