-- ============================================================
-- GOLD LAYER FINAL VALIDATION
-- ============================================================

-- Compare staging and fact table row counts
SELECT
    (SELECT COUNT(*) FROM stg_crime) AS staging_count,
    (SELECT COUNT(*) FROM fact_crime) AS fact_count;


-- Check for missing dimension relationships
SELECT
    COUNT(*) FILTER (WHERE crime_type_key IS NULL) AS missing_crime_type,
    COUNT(*) FILTER (WHERE location_key IS NULL) AS missing_location,
    COUNT(*) FILTER (WHERE date_key IS NULL) AS missing_date,
    COUNT(*) FILTER (WHERE police_force_key IS NULL) AS missing_police_force
FROM fact_crime;


-- Check for duplicate crime IDs
SELECT
    crime_id,
    COUNT(*)
FROM fact_crime
GROUP BY crime_id
HAVING COUNT(*) > 1;



-- ============================================================
-- GOLD LAYER INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_fact_crime_type
ON fact_crime(crime_type_key);

CREATE INDEX IF NOT EXISTS idx_fact_location
ON fact_crime(location_key);

CREATE INDEX IF NOT EXISTS idx_fact_date
ON fact_crime(date_key);

CREATE INDEX IF NOT EXISTS idx_fact_police_force
ON fact_crime(police_force_key);



-- ============================================================
-- GOLD REPORTING VIEW
-- ============================================================

CREATE OR REPLACE VIEW vw_crime_gold AS

SELECT
    f.crime_id,

    ct.category,

    d.month_date,
    d.year,
    d.month_number,
    d.month_name,

    l.street_name,
    l.latitude,
    l.longitude,
    l.location_type,

    pf.police_force_name

FROM fact_crime f

LEFT JOIN dim_crime_type ct
    ON f.crime_type_key = ct.crime_type_key

LEFT JOIN dim_location l
    ON f.location_key = l.location_key

LEFT JOIN dim_date d
    ON f.date_key = d.date_key

LEFT JOIN dim_police_force pf
    ON f.police_force_key = pf.police_force_key;



-- Validate reporting view
SELECT *
FROM vw_crime_gold
LIMIT 10;