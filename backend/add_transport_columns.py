import sqlite3


DATABASE = "farmer_saathi.db"


conn = sqlite3.connect(DATABASE)

cursor = conn.cursor()


# ==========================================
# CHECK CURRENT COLUMNS
# ==========================================

cursor.execute(
    "PRAGMA table_info(transport_bookings)"
)

columns = cursor.fetchall()

column_names = [
    column[1]
    for column in columns
]


print(
    "Current columns:",
    column_names
)


# ==========================================
# ADD BUYER ID
# ==========================================

if "buyer_id" not in column_names:

    cursor.execute(
        """
        ALTER TABLE transport_bookings
        ADD COLUMN buyer_id INTEGER
        """
    )

    print(
        "buyer_id column added successfully."
    )

else:

    print(
        "buyer_id already exists."
    )


# ==========================================
# ADD BUYER PRICE
# ==========================================

if "buyer_price" not in column_names:

    cursor.execute(
        """
        ALTER TABLE transport_bookings
        ADD COLUMN buyer_price FLOAT
        """
    )

    print(
        "buyer_price column added successfully."
    )

else:

    print(
        "buyer_price already exists."
    )


# ==========================================
# SAVE
# ==========================================

conn.commit()


# Check again

cursor.execute(
    "PRAGMA table_info(transport_bookings)"
)

updated_columns = [
    column[1]
    for column in cursor.fetchall()
]


print()
print(
    "Updated columns:",
    updated_columns
)


conn.close()


print()
print(
    "Database migration completed successfully."
)