-- ============================================================
-- GOLD FACT TABLE
-- Source: public.stg_crime
-- ============================================================


-- ============================================================
-- 1. FACT TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS fact_crime (
    crime_key SERIAL PRIMARY KEY,
    crime_id BIGINT UNIQUE NOT NULL,
    crime_type_key INT,
    location_key INT,
    date_key INT,
    police_force_key INT,

    FOREIGN KEY (crime_type_key)
        REFERENCES dim_crime_type(crime_type_key),

    FOREIGN KEY (location_key)
        REFERENCES dim_location(location_key),

    FOREIGN KEY (date_key)
        REFERENCES dim_date(date_key),

    FOREIGN KEY (police_force_key)
        REFERENCES dim_police_force(police_force_key)
);


-- ============================================================
-- 2. LOAD FACT TABLE
-- ============================================================

INSERT INTO fact_crime (
    crime_id,
    crime_type_key,
    location_key,
    date_key,
    police_force_key
)
SELECT
    s.crime_id,
    ct.crime_type_key,
    l.location_key,
    d.date_key,
    pf.police_force_key
FROM stg_crime s
JOIN dim_crime_type ct
    ON s.category = ct.category
JOIN dim_location l
    ON s.street_name = l.street_name
    AND s.latitude = l.latitude
    AND s.longitude = l.longitude
JOIN dim_date d
    ON MAKE_DATE(s.year, s.month, 1) = d.month_date
CROSS JOIN dim_police_force pf
WHERE pf.police_force_name = 'Metropolitan Police Service'
ON CONFLICT (crime_id) DO NOTHING;


-- ============================================================
-- 3. VALIDATION
-- ============================================================

SELECT COUNT(*) AS staging_count FROM stg_crime;
SELECT COUNT(*) AS fact_count FROM fact_crime;

SELECT
    COUNT(*) FILTER (WHERE crime_type_key IS NULL) AS missing_crime_type,
    COUNT(*) FILTER (WHERE location_key IS NULL) AS missing_location,
    COUNT(*) FILTER (WHERE date_key IS NULL) AS missing_date,
    COUNT(*) FILTER (WHERE police_force_key IS NULL) AS missing_police_force
FROM fact_crime;