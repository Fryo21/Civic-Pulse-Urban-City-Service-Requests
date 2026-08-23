-- ============================================================
-- STAGING TABLE
-- ============================================================
CREATE TABLE stg_crime (
    crime_id BIGINT,
    category VARCHAR(100),
    year INT,
    month INT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    street_id BIGINT,
    street_name VARCHAR(255)
);

