-- ============================================================
-- FACT TABLE
-- ============================================================

CREATE TABLE fact_crime (
    crime_key SERIAL PRIMARY KEY,
    crime_id BIGINT UNIQUE NOT NULL,
    crime_type_key INT,
    location_key INT,
    date_key INT,
    outcome_key INT,
    police_force_key INT,

    FOREIGN KEY (crime_type_key)
        REFERENCES dim_crime_type(crime_type_key),

    FOREIGN KEY (location_key)
        REFERENCES dim_location(location_key),

    FOREIGN KEY (date_key)
        REFERENCES dim_date(date_key),

    FOREIGN KEY (outcome_key)
        REFERENCES dim_outcome(outcome_key),

    FOREIGN KEY (police_force_key)
        REFERENCES dim_police_force(police_force_key)
);


-- ============================================================
-- LOAD FACT TABLE
-- ============================================================

INSERT INTO fact_crime (
    crime_id,
    crime_type_key,
    location_key,
    date_key,
    outcome_key,
    police_force_key
)
SELECT
    s.crime_id,
    ct.crime_type_key,
    l.location_key,
    d.date_key,
    o.outcome_key,
    pf.police_force_key

FROM stg_crime s

LEFT JOIN dim_crime_type ct
    ON s.category = ct.category

LEFT JOIN dim_location l
    ON s.street_name = l.street_name
    AND s.latitude = l.latitude
    AND s.longitude = l.longitude
    AND s.location_type = l.location_type

LEFT JOIN dim_date d
    ON s.month = d.month_date

LEFT JOIN dim_outcome o
    ON s.outcome_status = o.outcome_status

CROSS JOIN dim_police_force pf

WHERE pf.police_force_name = 'Metropolitan Police Service';


-- ============================================================
-- VALIDATION
-- ============================================================

SELECT COUNT(*) FROM stg_crime;
SELECT COUNT(*) FROM dim_crime_type;
SELECT COUNT(*) FROM dim_location;
SELECT COUNT(*) FROM dim_date;
SELECT COUNT(*) FROM dim_outcome;
SELECT COUNT(*) FROM dim_police_force;
SELECT COUNT(*) FROM fact_crime;



