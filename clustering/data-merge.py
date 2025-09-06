import os
import json
import pandas as pd

# file paths
DATA_DIR = "data"
SMP_DATA_FILE = os.path.join(DATA_DIR, "smp-data.csv")
JUNIORS_FILE = os.path.join(DATA_DIR, "smp_clusters.csv")
CLUSTER_MEANS_FILE = os.path.join(DATA_DIR, "smp_cluster_feature_means.csv")
SENIORS_FILE = os.path.join(DATA_DIR, "senior_to_cluster_assignment.csv")
OUT_JSON = os.path.join(DATA_DIR, "clusters.json")


def normalize_roll(x):
    if pd.isna(x):
        return ""
    return str(x).strip().upper()

# --- Load files (use try/except for helpful error messages) ---
try:
    smp_df = pd.read_csv(SMP_DATA_FILE, dtype=str).fillna("")
except FileNotFoundError:
    raise FileNotFoundError(f"Could not find {SMP_DATA_FILE}")

try:
    juniors_df = pd.read_csv(JUNIORS_FILE, dtype=str).fillna("")
except FileNotFoundError:
    raise FileNotFoundError(f"Could not find {JUNIORS_FILE}")

try:
    cluster_means_df = pd.read_csv(CLUSTER_MEANS_FILE, dtype=str).fillna("")
except FileNotFoundError:
    raise FileNotFoundError(f"Could not find {CLUSTER_MEANS_FILE}")

try:
    seniors_df = pd.read_csv(SENIORS_FILE, dtype=str).fillna("")
except FileNotFoundError:
        raise FileNotFoundError(f"Could not find {SENIORS_FILE}")


roll_col_candidates = ["rollnum", "roll", "Roll", "RollNum", "roll_num"]
name_col_candidates = ["name"]

roll_col = next((c for c in roll_col_candidates if c in smp_df.columns), None)
name_col = next((c for c in name_col_candidates if c in smp_df.columns), None)

if roll_col is None:
    raise ValueError(f"Could not find a roll-number column in {SMP_DATA_FILE}. Checked: {roll_col_candidates}")

if name_col is None:
    smp_df["__name__"] = ""
    name_col = "__name__"

roll_to_name = {
    normalize_roll(row[roll_col]): row[name_col]
    for _, row in smp_df.iterrows()
}

# --- Normalize cluster columns to ints where possible ---
def extract_cluster_id(val):
    if val is None or val == "":
        return None
    return int(val)


# normalize cluster_means clusters and scores
cluster_score_map = {}
if not cluster_means_df.empty:
    if "Cluster" not in cluster_means_df.columns:
        # try lower-case variants
        c_candidates = [c for c in cluster_means_df.columns if c.lower() == "cluster"]
        if c_candidates:
            cluster_means_df = cluster_means_df.rename(columns={c_candidates[0]: "Cluster"})
    if "score" not in cluster_means_df.columns:
        # try case-insensitive
        s_candidates = [c for c in cluster_means_df.columns if c.lower() == "score"]
        if s_candidates:
            cluster_means_df = cluster_means_df.rename(columns={s_candidates[0]: "score"})

    for _, r in cluster_means_df.iterrows():
        cid = extract_cluster_id(r.get("Cluster"))
        if cid is None:
            continue
        # attempt numeric score
        raw_score = r.get("score", "")
        try:
            score_val = float(raw_score) if raw_score != "" else None
        except Exception:
            score_val = None
        cluster_score_map[cid] = score_val


clusters_set = set(cluster_score_map.keys())

def find_roll_column(df):
    for c in ["Roll", "roll", "rollnum", "RollNum", "roll_num"]:
        if c in df.columns:
            return c
    return None

def find_cluster_column(df):
    for c in ["Cluster", "cluster", "cluster_id", "ClusterId", "clusterId"]:
        if c in df.columns:
            return c
    return None

j_roll_col = find_roll_column(juniors_df)
j_cluster_col = find_cluster_column(juniors_df)
s_roll_col = find_roll_column(seniors_df)
s_cluster_col = find_cluster_column(seniors_df)

# add cluster ids from juniors
if j_cluster_col is not None:
    for _, r in juniors_df.iterrows():
        cid = extract_cluster_id(r.get(j_cluster_col))
        if cid is not None:
            clusters_set.add(cid)

# add cluster ids from seniors
if s_cluster_col is not None:
    for _, r in seniors_df.iterrows():
        cid = extract_cluster_id(r.get(s_cluster_col))
        if cid is not None:
            clusters_set.add(cid)

# --- Build cluster -> members structure ---
clusters_list = sorted(list(clusters_set), key=lambda x: (float(x) if isinstance(x, int) or str(x).isdigit() else str(x)))

output = {}

for cid in clusters_list:
    # fetch score if present else null
    score = cluster_score_map.get(cid, None)

    members = []

    # juniors
    if j_roll_col and j_cluster_col:
        mask = juniors_df[j_cluster_col].apply(lambda v: extract_cluster_id(v) == cid)
        for _, r in juniors_df[mask].iterrows():
            roll_raw = r.get(j_roll_col, "")
            roll_norm = normalize_roll(roll_raw)
            name = roll_to_name.get(roll_norm, "")
            members.append({"roll": str(roll_raw).strip(), "name": name})

    # seniors
    if s_roll_col and s_cluster_col:
        mask = seniors_df[s_cluster_col].apply(lambda v: extract_cluster_id(v) == cid)
        for _, r in seniors_df[mask].iterrows():
            roll_raw = r.get(s_roll_col, "")
            roll_norm = normalize_roll(roll_raw)
            name = roll_to_name.get(roll_norm, "")
            members.append({"roll": str(roll_raw).strip(), "name": name})

    # optional: deduplicate same roll within a cluster (keep first)
    seen = set()
    dedup_members = []
    for m in members:
        key = normalize_roll(m["roll"])
        if key in seen:
            continue
        seen.add(key)
        dedup_members.append(m)

    output[str(cid)] = {
        "score": score,
        "members": dedup_members
    }

# --- Write JSON out ---
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"Wrote {OUT_JSON} with {len(output)} clusters.")
