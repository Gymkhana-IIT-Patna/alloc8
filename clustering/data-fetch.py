import os
import csv
import json
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("DATABASE_URL")
if not uri:
    raise ValueError("DATABASE_URL not found in environment variables")

# Connect to MongoDB
client = MongoClient(uri, server_api=ServerApi("1"))

# Extract database name from the URI
db_name = uri.split("/")[-1].split("?")[0]
if not db_name:
    raise ValueError("Could not determine database name from DATABASE_URL")
db = client[db_name]
collection = db["smpDetails"]

# Fetch all documents
docs = list(collection.find({}))
data_dir = os.path.join(os.getcwd(), "data")
os.makedirs(data_dir, exist_ok=True)

csv_file = os.path.join(data_dir, "smp-data.csv")
if docs:
    fieldnames_set = set()
    for d in docs:
        fieldnames_set.update(k for k in d.keys() if k != "_id")

    preferred = ["rollnum", "name", "branch", "domain", "active_sem", "goals", "languages",
                 "tech_interests", "sports", "cult_interests", "hobbies"]
    fieldnames = [f for f in preferred if f in fieldnames_set] + sorted(fieldnames_set - set(preferred))

    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for doc in docs:
            out = {}
            for key in fieldnames:
                value = doc.get(key, "")
                if isinstance(value, list):
                    out[key] = ", ".join(map(str, value))
                else:
                    out[key] = value
            writer.writerow(out)

    print(f"Exported {len(docs)} documents to {csv_file}")
else:
    print("No documents found in smpDetails collection")


def safe_list(x):
    """Return a list for array/string/None inputs"""
    if x is None:
        return []
    if isinstance(x, list):
        return [str(i) for i in x]
    if isinstance(x, str):
        if "," in x:
            return [part.strip() for part in x.split(",") if part.strip()]
        return [x]
    return [str(x)]

juniors = []
seniors = []

for doc in docs:
    roll = doc.get("rollnum") or ""
    if not isinstance(roll, str):
        roll = str(roll)

    branch = doc.get("branch", "")
    phys_chem_sem = doc.get("active_sem") or ""
    core_nonCore = doc.get("domain")
    languages_list = safe_list(doc.get("languages"))
    tech_list = safe_list(doc.get("tech_interests"))
    sports_list = safe_list(doc.get("sports"))
    cult_list = safe_list(doc.get("cult_interests"))
    hobbies_list = safe_list(doc.get("hobbies"))
    goals = doc.get("goals", "") or ""
    num_tech = len(tech_list)
    num_sports = len(sports_list)
    num_cult = len(cult_list)
    num_cultural = num_cult
    num_software = 0
    num_electronics = 0
    num_indoor = 0
    num_outdoor = 0

    entry = {
        "Roll": roll,
        "Branch": branch,
        "Phys/Chem Sem": phys_chem_sem,
        "Languages": ", ".join(languages_list),
        "Core/Non-Core": core_nonCore,
        "Tech Interests": ", ".join(tech_list),
        "Sports Interests": ", ".join(sports_list),
        "Cult Interests": ", ".join(cult_list),
        "Num Tech Interests": num_tech,
        "Num Sports Interests": num_sports,
        "Num Cult Interests": num_cult,
        "Num_Software": num_software,
        "Num_Electronics": num_electronics,
        "Num_IndoorGames": num_indoor,
        "Num_OutdoorGames": num_outdoor,
        "Num_Cultural": num_cultural,
        "Goal": goals if goals else "Didn’t Figure Yet",
        "Hobbies": ", ".join(hobbies_list)
    }

    prefix = roll.strip()[:2]
    if prefix == "25":
        juniors.append(entry)
    elif prefix == "24":
        seniors.append(entry)
    else:
        # Skip non-24/25 rolls for these JSON files (if they remain in CSV)
        pass

# Write JSON files
juniors_file = os.path.join(data_dir, "smp_juniors.json")
seniors_file = os.path.join(data_dir, "smp_2nd_years.json")

with open(juniors_file, "w", encoding="utf-8") as f:
    json.dump(juniors, f, indent=4, ensure_ascii=False)

with open(seniors_file, "w", encoding="utf-8") as f:
    json.dump(seniors, f, indent=4, ensure_ascii=False)

print(f"Wrote {len(juniors)} juniors to {juniors_file}")
print(f"Wrote {len(seniors)} 2nd years to {seniors_file}")
