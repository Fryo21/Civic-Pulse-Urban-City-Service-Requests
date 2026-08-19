
-- ============================================================
-- 1. CRIME TYPE DIMENSION
-- ============================================================

CREATE TABLE dim_crime_type (crime_type_key SERIAL PRIMARY KEY, category VARCHAR(100) UNIQUE NOT NULL);

INSERT INTO dim_crime_type (category)
SELECT DISTINCT category
FROM stg_crime
WHERE category IS NOT NULL;

-- Validate
SELECT * FROM dim_crime_type;


-- ============================================================
-- 2. LOCATION DIMENSION
-- ============================================================

CREATE TABLE dim_location (
    location_key SERIAL PRIMARY KEY,
    street_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_type VARCHAR(100)
);


INSERT INTO dim_location (
    street_name,
    latitude,
    longitude,
    location_type
)
SELECT DISTINCT
    street_name,
    latitude,
    longitude,
    location_type
FROM stg_crime;



-- ============================================================
-- 3. DATE DIMENSION
-- ============================================================

CREATE TABLE dim_date (
    date_key SERIAL PRIMARY KEY,
    month_date DATE UNIQUE NOT NULL,
    year INT NOT NULL,
    month_number INT NOT NULL,
    month_name VARCHAR(20) NOT NULL
);


INSERT INTO dim_date (
    month_date,
    year,
    month_number,
    month_name
)
SELECT DISTINCT
    month,
    EXTRACT(YEAR FROM month)::INT,
    EXTRACT(MONTH FROM month)::INT,
    TO_CHAR(month, 'FMMonth')
FROM stg_crime
WHERE month IS NOT NULL;


-- ============================================================
-- 4. OUTCOME DIMENSION
-- ============================================================

CREATE TABLE dim_outcome (
    outcome_key SERIAL PRIMARY KEY,
    outcome_status VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO dim_outcome (outcome_status)
SELECT DISTINCT outcome_status
FROM stg_crime
WHERE outcome_status IS NOT NULL
  AND outcome_status <> '';

SELECT * FROM dim_outcome;


-- ============================================================
-- 5. POLICE FORCE DIMENSION
-- ============================================================

CREATE TABLE dim_police_force (
    police_force_key SERIAL PRIMARY KEY,
    police_force_name VARCHAR(150) UNIQUE NOT NULL
);


INSERT INTO dim_police_force (police_force_name)
VALUES ('Metropolitan Police Service');

-- ============================================================
-- VALIDATION
-- ============================================================

SELECT * FROM stg_crime;
SELECT * FROM dim_crime_type;
SELECT * FROM dim_location;
SELECT * FROM dim_date;
SELECT * FROM dim_outcome;
SELECT * FROM dim_police_force;