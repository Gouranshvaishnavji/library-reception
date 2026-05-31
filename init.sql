CREATE TABLE IF NOT EXISTS member (
    mem_id SERIAL PRIMARY KEY,
    mem_name VARCHAR(255) NOT NULL,
    mem_phone VARCHAR(50),
    mem_email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS membership (
    membership_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES member(mem_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS collection (
    collection_id SERIAL PRIMARY KEY,
    collection_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS category (
    cat_id SERIAL PRIMARY KEY,
    cat_name VARCHAR(255) NOT NULL,
    sub_cat_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS book (
    book_id SERIAL PRIMARY KEY,
    book_name VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    book_cat_id INTEGER REFERENCES category(cat_id) ON DELETE SET NULL,
    book_collection_id INTEGER REFERENCES collection(collection_id) ON DELETE SET NULL,
    book_launch_date TIMESTAMP,
    book_publisher VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS issuance (
    issuance_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES book(book_id) ON DELETE CASCADE,
    issuance_member INTEGER NOT NULL REFERENCES member(mem_id) ON DELETE CASCADE,
    issued_by VARCHAR(255),
    issuance_date TIMESTAMP NOT NULL,
    target_return_date TIMESTAMP NOT NULL,
    issuance_status VARCHAR(50) NOT NULL
);