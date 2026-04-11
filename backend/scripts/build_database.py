import csv
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")

# Create processed dir if not exists
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)

CITY_STATE_MAP = {
    # UP
    "Agra": "Uttar Pradesh", "Allahabad": "Uttar Pradesh", "Bahraich": "Uttar Pradesh",
    "Bareilly": "Uttar Pradesh", "Gorakhpur": "Uttar Pradesh", "Jhansi": "Uttar Pradesh",
    "Kanpur": "Uttar Pradesh", "Lucknow": "Uttar Pradesh", "Moradabad": "Uttar Pradesh",
    "Varanasi": "Uttar Pradesh", "Roorkee": "Uttarakhand", # Roorkee is in UK now
    
    # Gujarat
    "Ahmedabad": "Gujarat", "Bhuj": "Gujarat", "Rajkot": "Gujarat",
    "Surat": "Gujarat", "Vadodara": "Gujarat",
    
    # Rajasthan
    "Ajmer": "Rajasthan", "Bikaner": "Rajasthan", "Jaipur": "Rajasthan",
    "Jodhpur": "Rajasthan", "Udaipur": "Rajasthan",
    
    # Uttarakhand
    "Almora": "Uttarakhand", "Dehradun": "Uttarakhand", "Nainital": "Uttarakhand",
    
    # Haryana / Punjab / Chandigarh
    "Ambala": "Haryana", "Amritsar": "Punjab", "Bhatinda": "Punjab",
    "Chandigarh": "Chandigarh", "Ludhiana": "Punjab", "Patiala": "Punjab",
    
    # West Bengal
    "Asansol": "West Bengal", "Darjeeling": "West Bengal",
    "Durgapur": "West Bengal", "Kolkata": "West Bengal",
    
    # Maharashtra
    "Aurangabad": "Maharashtra", "Mumbai": "Maharashtra",
    "Nagpur": "Maharashtra", "Nasik": "Maharashtra", "Pune": "Maharashtra",
    
    # Odisha
    "Bhubaneswar": "Odisha", "Bhubaneshwar": "Odisha", "Cuttack": "Odisha",
    "Rourkela": "Odisha",
    
    # Delhi
    "Delhi": "Delhi",
    
    # Assam
    "Guwahati": "Assam",
    
    # Telangana
    "Hyderabad": "Telangana",
    
    # Karnataka
    "Bengaluru": "Karnataka", "Mangalore": "Karnataka", "Mysore": "Karnataka",
    
    # Bihar
    "Barauni": "Bihar", "Darbhanga": "Bihar", "Gaya": "Bihar", "Patna": "Bihar",
    
    # Chhattisgarh
    "Bhilai": "Chhattisgarh", "Raipur": "Chhattisgarh",
    
    # Madhya Pradesh
    "Bhopal": "Madhya Pradesh", "Jabalpur": "Madhya Pradesh",
    
    # Jharkhand
    "Bokaro": "Jharkhand", "Jamshedpur": "Jharkhand", "Ranchi": "Jharkhand",
    
    # Tamil Nadu
    "Chennai": "Tamil Nadu", "Coimbatore": "Tamil Nadu",
    "Madurai": "Tamil Nadu", "Tiruchirappalli": "Tamil Nadu",
    
    # Sikkim
    "Gangtok": "Sikkim",
    
    # Manipur
    "Imphal": "Manipur",
    
    # Nagaland
    "Kohima": "Nagaland",
    
    # Kerala
    "Kozhikode": "Kerala", "Trivandrum": "Kerala",
    
    # Lakshadweep
    "Lakshadweep": "Lakshadweep",
    
    # Himachal Pradesh
    "Mandi": "Himachal Pradesh", "Shimla": "Himachal Pradesh",
    
    # Goa
    "Panjim": "Goa",
    
    # Puducherry
    "Puducherry": "Puducherry",
    
    # J&K
    "Srinagar": "Jammu and Kashmir",
    
    # A&N
    "Port Blair": "Andaman and Nicobar Islands",
    
    # Andhra Pradesh (from wind file)
    "Kurnool": "Andhra Pradesh", "Nellore": "Andhra Pradesh",
    "Vijayawada": "Andhra Pradesh", "Vishakapatnam": "Andhra Pradesh",
}

def build_db():
    database = {}

    def get_or_create_district(state, district):
        if state not in database:
            database[state] = {}
        if district not in database[state]:
            database[state][district] = {
                "wind": "N/A",
                "seismic_zone": "N/A",
                "zone_factor": "N/A",
                "min_temp": "N/A",
                "max_temp": "N/A"
            }
        return database[state][district]

    # 1. Parse Wind Table
    wind_file = os.path.join(RAW_DATA_DIR, "wind_table_full.csv")
    if os.path.exists(wind_file):
        with open(wind_file, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                city = row.get("City/Town", "").strip()
                wind_speed = row.get("Basic wind Speed", "").strip()
                if not city or not wind_speed:
                    continue
                    
                state = CITY_STATE_MAP.get(city)
                if not state:
                    # Fallback if unknown
                    state = "Other"
                
                # fix names
                if city == "Bhubaneshwar": city = "Bhubaneswar"
                if city == "Vishakapatnam": city = "Visakhapatnam"
                
                dist_data = get_or_create_district(state, city)
                dist_data["wind"] = f"{wind_speed} m/sec"

    # 2. Parse Seismic Table
    seismic_file = os.path.join(RAW_DATA_DIR, "seismic_table_full.csv")
    if os.path.exists(seismic_file):
        with open(seismic_file, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                city = row.get("Town", "").strip()
                zone = row.get("Zone", "").strip()
                z_factor = row.get("Z", "").strip()
                if not city:
                    continue
                    
                state = CITY_STATE_MAP.get(city)
                if not state:
                    state = "Other"
                    
                if city == "Bhubaneshwar": city = "Bhubaneswar"
                if city == "Vishakapatnam": city = "Visakhapatnam"
                
                if zone.startswith("Zone"):
                    pass # already formatted
                else:
                    zone = f"Zone {zone}"

                dist_data = get_or_create_district(state, city)
                dist_data["seismic_zone"] = zone
                dist_data["zone_factor"] = z_factor

    # 3. Parse Temperature Table
    temp_file = os.path.join(RAW_DATA_DIR, "temperature_table_full.csv")
    if os.path.exists(temp_file):
        with open(temp_file, "r") as f:
            reader = csv.DictReader(f)
            current_state = ""
            for row in reader:
                st = row.get("State", "").strip()
                if st:
                    current_state = st
                
                city = row.get("Station", "").strip()
                if not city:
                    continue
                    
                max_t = row.get("Max.", "").strip()
                min_t = row.get("Min.", "").strip()
                
                if current_state == "Andaman and Nicobar Island":
                    state_norm = "Andaman and Nicobar Islands"
                else:
                    state_norm = current_state
                    
                # Fix visakhapatnam variants
                if "Visakhapatnam" in city or "Vishakhapatnam" in city:
                    city = "Visakhapatnam"
                    
                dist_data = get_or_create_district(state_norm, city)
                if max_t: dist_data["max_temp"] = f"{max_t}°C"
                if min_t: dist_data["min_temp"] = f"{min_t}°C"

    # Save to JSON
    out_path = os.path.join(PROCESSED_DATA_DIR, "location_database.json")
    with open(out_path, "w") as f:
        json.dump(database, f, indent=4)
        
    print(f"Database successfully generated at {out_path}")

if __name__ == "__main__":
    build_db()
