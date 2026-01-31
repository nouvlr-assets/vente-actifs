import pandas as pd
import json
import io
import os


def generate_catalog_json(csv_input_path='CatalogList.csv', json_output_path='catalog.json'):
    """
    Reads the Inventory CSV file and generates a structured JSON file for the web catalog.

    Features:
    - Auto-detects encoding (UTF-8 vs Latin-1).
    - Repairs "bad CSV lines" where descriptions contain extra commas (e.g., "2,2m").
    - flexible column naming (e.g., reads 'price', 'prix', or 'precio').
    - Handles lot IDs as strings to support prefixes (e.g., "A-100").
    """

    print(f"🔄 Reading file: {csv_input_path}...")

    # 1. READ FILE CONTENT (Raw Text Mode)
    # We read raw lines first to fix potential CSV formatting errors before Pandas touches it.
    try:
        with open(csv_input_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        print("⚠️ Legacy encoding detected (Latin-1). Switching encoding...")
        with open(csv_input_path, 'r', encoding='latin-1') as f:
            lines = f.readlines()

    if not lines:
        print("❌ Error: The file is empty.")
        return

    # 2. HEADER CLEANING
    # Strip spaces and lowercase headers to ensure matching works (e.g., " Units " -> "units")
    header_line = lines[0].strip()
    headers = [h.strip().lower() for h in header_line.split(',')]
    num_expected_cols = len(headers)

    # 3. REPAIR BROKEN LINES
    # If a line has more commas than headers (due to text like "2,2m"), we merge the excess into the last column.
    cleaned_lines = [header_line]
    for i in range(1, len(lines)):
        line = lines[i].strip()
        if not line: continue

        parts = line.split(',')

        if len(parts) > num_expected_cols:
            # Merge extra parts into the last column (usually 'details' or similar)
            fixed_part = ",".join(parts[num_expected_cols - 1:])
            parts = parts[:num_expected_cols - 1]
            parts.append(f'"{fixed_part}"')  # Wrap in quotes for safety

        cleaned_lines.append(",".join(parts))

    # Convert cleaned lines into a virtual file object for Pandas
    virtual_file = io.StringIO("\n".join(cleaned_lines))

    # 4. LOAD INTO PANDAS
    try:
        df = pd.read_csv(
            virtual_file,
            names=headers,
            header=0,
            # Force 'lot' to be string to preserve prefixes like 'A-101'
            dtype={'lot': str}
        )
    except Exception as e:
        print(f"❌ Critical Error reading CSV: {e}")
        return

    # Helper function to find a column using multiple aliases
    def get_val(row, aliases, default):
        for alias in aliases:
            if alias in row and pd.notna(row[alias]):
                return row[alias]
        return default

    catalog_data = []

    print(f"📦 Processing {len(df)} items...")

    # 5. ITERATE AND BUILD JSON
    for index, row in df.iterrows():
        try:
            # -- LOT ID --
            # Clean up the ID. If Excel exported "405.0", convert it back to "405".
            raw_lot = str(get_val(row, ['lot', 'id', 'lote'], '0')).strip()
            if raw_lot.endswith('.0'):
                lot_id = raw_lot[:-2]
            else:
                lot_id = raw_lot

            # -- PRICES --
            try:
                price = float(get_val(row, ['prix', 'price', 'precio'], 0))
            except:
                price = 0.0

            try:
                unit_price = float(get_val(row, ['prix_unit', 'unit_price', 'precio_unidad'], 0))
            except:
                unit_price = 0.0

            # -- UNITS --
            try:
                units = int(get_val(row, ['units', 'untits', 'unidades'], 1))
            except:
                units = 1
            if units < 1: units = 1

            # -- IMAGES COUNT --
            try:
                num_imgs = int(get_val(row, ['num_add_img', 'additional_img', 'num_imagenes'], 0))
            except:
                num_imgs = 0

            # -- TEXT FIELDS --
            cat = str(get_val(row, ['category', 'categorie', 'categoria'], 'Divers')).strip()
            desc = str(get_val(row, ['description', 'descripcion'], '')).strip()
            details = str(get_val(row, ['details', 'detalles'], '')).strip()

            # -- MANUAL URL --
            manual = str(get_val(row, ['manuale', 'manual', 'manual_url'], '')).strip()
            if manual.lower() == 'nan': manual = ""

            # -- IMAGE LIST GENERATION --
            # Logic: Base image is "ID.jpg". Extra images are "ID_A.jpg", "ID_B.jpg", etc.
            imgs = [f"{lot_id}.jpg"]
            if num_imgs > 0:
                for n in range(1, num_imgs + 1):
                    suffix = chr(ord('A') + n - 1)  # Generates A, B, C...
                    imgs.append(f"{lot_id}_{suffix}.jpg")

            # -- BUILD ITEM OBJECT --
            item = {
                "lot": lot_id,
                "prix": price,
                "categorie": cat,
                "descripcion": desc,
                "detalles": details,
                "manual_url": manual,
                "imagenes": imgs,
                "units_available": units,
                "unit_price": unit_price
            }
            catalog_data.append(item)

        except Exception as e:
            print(f"⚠️ Error in row {index}: {e}")
            continue

    # 6. SAVE JSON
    # 'ensure_ascii=False' ensures accents (é, à) are readable in the file
    with open(json_output_path, 'w', encoding='utf-8') as f:
        json.dump(catalog_data, f, ensure_ascii=False, indent=4)

    print(f"✅ Success! JSON generated at: {json_output_path}")


if __name__ == "__main__":
    generate_catalog_json()