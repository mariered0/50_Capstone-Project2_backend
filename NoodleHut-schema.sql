CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    phone CHAR(10) NOT NULL,
    CONSTRAINT check_phone  CHECK (phone not like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
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
    user_id INTEGER NOT NULL
        REFERENCES users ON DELETE CASCADE,
    item_name TEXT NOT NULL
        REFERENCES items ON DELETE CASCADE
);