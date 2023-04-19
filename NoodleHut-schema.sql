CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    phone CHAR(10) NOT NULL,
        CHECK (phone ~ '^[0-9]{10}$'),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    category_name TEXT NOT NULL
);

CREATE TABLE items (
    category_id INT NOT NULL
        REFERENCES categories,
    id SERIAL PRIMARY KEY,
    item_name TEXT NOT NULL,
    item_desc TEXT NOT NULL,
    item_price NUMERIC(4,2) NOT NULL
);

CREATE TABLE favorites (
    username TEXT NOT NULL
        REFERENCES users ON DELETE CASCADE,
    item_id INT NOT NULL
        REFERENCES items ON DELETE CASCADE,
    PRIMARY KEY (username, item_id)
);