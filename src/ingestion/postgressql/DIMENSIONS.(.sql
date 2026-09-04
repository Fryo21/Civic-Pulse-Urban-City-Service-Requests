-- ============================================================
-- GOLD DIMENSIONS
-- Source: public.stg_crime
-- ============================================================


-- ============================================================
-- 1. CRIME TYPE DIMENSION
-- ============================================================

CREATE TABLE IF NOT EXISTS dim_crime_type (
    crime_type_key SERIAL PRIMARY KEY,
    category VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO dim_crime_type (category)
SELECT DISTINCT s.category
FROM stg_crime s
WHERE s.category IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM dim_crime_type d
      WHERE d.category = s.category
  );


-- ============================================================
-- 2. LOCATION DIMENSION
-- ============================================================

CREATE TABLE IF NOT EXISTS dim_location (
    location_key SERIAL PRIMARY KEY,
    street_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- Remove legacy field from the previous Gold design
ALTER TABLE dim_location
DROP COLUMN IF EXISTS location_type;

INSERT INTO dim_location (
    street_name,
    latitude,
    longitude
)
SELECT DISTINCT
    s.street_name,
    s.latitude,
    s.longitude
FROM stg_crime s
WHERE NOT EXISTS (
    SELECT 1
    FROM dim_location d
    WHERE d.street_name = s.street_name
      AND d.latitude = s.latitude
      AND d.longitude = s.longitude
);


-- ============================================================
-- 3. DATE DIMENSION
-- ============================================================

CREATE TABLE IF NOT EXISTS dim_date (
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
    MAKE_DATE(s.year, s.month, 1),
    s.year,
    s.month,
    TO_CHAR(MAKE_DATE(s.year, s.month, 1), 'FMMonth')
FROM stg_crime s
WHERE NOT EXISTS (
    SELECT 1
    FROM dim_date d
    WHERE d.month_date = MAKE_DATE(s.year, s.month, 1)
);


-- ============================================================
-- 4. POLICE FORCE DIMENSION
-- ============================================================

CREATE TABLE IF NOT EXISTS dim_police_force (
    police_force_key SERIAL PRIMARY KEY,
    police_force_name VARCHAR(150) UNIQUE NOT NULL
);

INSERT INTO dim_police_force (police_force_name)
SELECT 'Metropolitan Police Service'
WHERE NOT EXISTS (
    SELECT 1
    FROM dim_police_force
    WHERE police_force_name = 'Metropolitan Police Service'
);


-- ============================================================
-- VALIDATION
-- ============================================================

SELECT COUNT(*) AS crime_types FROM dim_crime_type;
SELECT COUNT(*) AS locations FROM dim_location;
SELECT COUNT(*) AS dates FROM dim_date;
SELECT COUNT(*) AS police_forces FROM dim_police_force;