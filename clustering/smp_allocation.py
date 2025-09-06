"""
Branchwise Junior & Senior clustering
Outputs:
 - data/smp_clusters.csv (Roll, Branch, Cluster)
 - data/smp_cluster_feature_means.csv (Cluster means per branch)
 - data/senior_to_cluster_assignment.csv
 - data/skipped_seniors.csv
"""

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import MultiLabelBinarizer, MinMaxScaler
from scipy.optimize import linear_sum_assignment
from scipy.spatial.distance import cdist
from sklearn.cluster import KMeans
from sklearn.metrics import pairwise_distances


def split_multi_values(series):
    def to_list(x):
        if isinstance(x, list):
            return [s.strip() for s in x if str(s).strip()]
        if pd.isna(x):
            return []
        s = str(x)
        if not s.strip():
            return []
        return [i.strip() for i in s.split(",") if i.strip()]
    return series.fillna("").apply(to_list)

# Common settings
group_size = 6
weights_juniors = {
    "Branch": 20,
    "Languages": 10,
    "Phys/Chem Sem": 7,
    "Core/Non-Core": 5,
    "Tech Interests": 3,
    "Sports Interests": 3,
    "Cult Interests": 3,
    "Num Tech Interests": 2,
    "Num Sports Interests": 2,
    "Num Cult Interests": 2,
    "Num_Software": 2,
    "Num_Electronics": 2,
    "Num_IndoorGames": 2,
    "Num_OutdoorGames": 2,
    "Num_Cultural": 2,
    "Goal": 1,
    "Hobbies": 1
}

weights_seniors = {
    "Branch": 20,
    "Languages": 6,
    "Core/Non-Core": 5,
    "Tech Interests": 3,
    "Sports Interests": 3,
    "Cult Interests": 3,
    "Num Tech Interests": 2,
    "Num Sports Interests": 2,
    "Num Cult Interests": 2,
    "Num_Software": 2,
    "Num_Electronics": 2,
    "Num_IndoorGames": 2,
    "Num_OutdoorGames": 2,
    "Num_Cultural": 2,
    "Goal": 1,
    "Hobbies": 1
}

# ---------- Juniors: branchwise clustering ----------
df_juniors = pd.read_json("data/smp_juniors.json")
all_roll_cluster = []
all_cluster_means = []

# global counter to ensure unique cluster IDs across branches
global_cluster_id_counter = 0
branches = df_juniors["Branch"].fillna("Unknown").unique()
for branch in branches:
    df_b = df_juniors[df_juniors["Branch"].fillna("Unknown") == branch].copy()
    num_students = df_b.shape[0]

    num_clusters = num_students // group_size
    if num_clusters == 0:
        raise ValueError(f"group_size is larger than number of students in branch {branch}")

    # One-hot (exclude Branch since we run per-branch)
    one_hot_cols = ["Phys/Chem Sem", "Core/Non-Core", "Goal"]
    df_onehot = pd.get_dummies(df_b[one_hot_cols].fillna(""), prefix=one_hot_cols)

    # Multi-hot
    multi_cols = ["Languages", "Tech Interests", "Sports Interests", "Cult Interests", "Hobbies"]
    multi_encoded = []
    for col in multi_cols:
        if col not in df_b.columns:
            df_b[col] = ""
        mlb = MultiLabelBinarizer()
        lists = split_multi_values(df_b[col])
        if len(lists) == 0:
            encoded = pd.DataFrame([], index=df_b.index)
        else:
            arr = mlb.fit_transform(lists)
            if arr.size == 0:
                encoded = pd.DataFrame([], index=df_b.index)
            else:
                col_names = [f"{col}_{c}" for c in mlb.classes_]
                encoded = pd.DataFrame(arr, columns=col_names, index=df_b.index)
        multi_encoded.append(encoded)

    df_multi = pd.concat(multi_encoded, axis=1) if multi_encoded else pd.DataFrame(index=df_b.index)

    # Numeric columns
    num_cols = [
        "Num Tech Interests", "Num Sports Interests", "Num Cult Interests",
        "Num_Software", "Num_Electronics", "Num_IndoorGames", "Num_OutdoorGames", "Num_Cultural"
    ]
    for nc in num_cols:
        if nc not in df_b.columns:
            df_b[nc] = 0
        df_b[nc] = pd.to_numeric(df_b[nc], errors="coerce").fillna(0)

    scaler = MinMaxScaler()
    df_scaled = pd.DataFrame(
        scaler.fit_transform(df_b[num_cols]),
        columns=num_cols,
        index=df_b.index
    )

    X = pd.concat([df_onehot, df_multi, df_scaled], axis=1).fillna(0)

    for key, w in weights_juniors.items():
        for col in X.columns:
            if col.startswith(key):
                X[col] = X[col] * w

    X_mat = X.values if isinstance(X, pd.DataFrame) else np.asarray(X)

    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=50)
    kmeans.fit(X_mat)
    centers = kmeans.cluster_centers_

    dist_to_centers = cdist(X_mat, centers, metric="euclidean")

    slot_list = []
    slot_to_cluster = []
    cluster_sizes = [group_size] * num_clusters
    remainder = num_students - sum(cluster_sizes)
    for i in range(remainder):
        cluster_sizes[i % num_clusters] += 1

    for cid, size in enumerate(cluster_sizes):
        col = dist_to_centers[:, cid]
        for _ in range(size):
            slot_list.append(col.reshape(-1, 1))
            slot_to_cluster.append(cid)
    cost_matrix = np.hstack(slot_list)

    row_ind, col_ind = linear_sum_assignment(cost_matrix)

    assigned = np.empty(num_students, dtype=int)
    for r, c in zip(row_ind, col_ind):
        assigned[r] = slot_to_cluster[c]

    cluster_labels = assigned

    # pairwise distances (performance)
    pairwise_distances_list = []
    for cluster_id in range(num_clusters):
        points_in_cluster = X[cluster_labels == cluster_id]
        if points_in_cluster.shape[0] > 1:
            distances = pairwise_distances(points_in_cluster)
            pairwise_distances_list.append(np.sum(np.triu(distances, 1)))

    # compute WCSS (within-cluster sum of squared distances to center) per local cluster
    wcss_list = []
    for cid in range(num_clusters):
        mask = (cluster_labels == cid)
        members = X_mat[mask]
        if members.shape[0] == 0:
            wcss_c = 0.0
        else:
            diff = members - centers[cid]  # same feature space as kmeans
            wcss_c = np.sum(np.square(diff))
        wcss_list.append(float(wcss_c))

    # normalize WCSS to [0,1] by dividing by max WCSS within this branch (avoid division by zero)
    max_wcss = max(wcss_list) if len(wcss_list) > 0 else 0.0
    if max_wcss > 0:
        wcss_norm = [w / max_wcss for w in wcss_list]
    else:
        wcss_norm = [1.0 for _ in wcss_list]

    # score as (1 - normalized_wcss) * 100
    scores = [(1.0 - wn) * 100.0 for wn in wcss_norm]

    # compute clusters and assign a unique global cluster ID per cluster
    if not isinstance(X, pd.DataFrame):
        X = pd.DataFrame(X, columns=[f"f_{i}" for i in range(X.shape[1])])

    clusters = sorted(np.unique(cluster_labels).tolist())
    # mapping local cluster label -> unique global cluster id
    cluster_mapping = {label: (global_cluster_id_counter + i) for i, label in enumerate(clusters)}

    # prepare roll-cluster map for this branch (use global unique cluster ids)
    mapped_labels = [cluster_mapping[int(l)] for l in cluster_labels]
    roll_cluster_map = pd.DataFrame({
        "Roll": df_b["Roll"].astype(str).values,
        "Branch": branch,
        "Cluster": mapped_labels
    })
    all_roll_cluster.append(roll_cluster_map)

    cols_to_skip = [c for c in X.columns if "Phys/Chem Sem" in c]

    means = []
    for idx_in_list, label in enumerate(clusters):
        mask = (cluster_labels == label)
        if mask.sum() == 0:
            mean_row = pd.Series([np.nan] * X.shape[1], index=X.columns)
        else:
            mean_row = X.loc[mask].mean(axis=0)
        mean_row = mean_row.drop(labels=cols_to_skip, errors="ignore")
        row_dict = mean_row.to_dict()
        row_dict["Branch"] = branch
        # use global id here
        row_dict["Cluster"] = int(cluster_mapping[int(label)])
        # add score corresponding to this local cluster label
        local_index = clusters.index(label)
        row_dict["score"] = scores[local_index]
        means.append(pd.Series(row_dict))

    cluster_means_df = pd.DataFrame(means)
    all_cluster_means.append(cluster_means_df)

    # advance global counter
    global_cluster_id_counter += len(clusters)

# write combined juniors outputs
if all_roll_cluster:
    combined_rolls = pd.concat(all_roll_cluster, axis=0, ignore_index=True)
    combined_rolls.to_csv("data/smp_clusters.csv", index=False)

if all_cluster_means:
    combined_means = pd.concat(all_cluster_means, axis=0, ignore_index=True)
    combined_means.to_csv("data/smp_cluster_feature_means.csv", index=False, float_format="%.6f")

print("Saved junior clusters and cluster feature means.")

# ---------- Seniors: branchwise assignment ----------
df_seniors = pd.read_json("data/smp_2nd_years.json")

# read cluster means produced above
cluster_means_all = pd.read_csv("data/smp_cluster_feature_means.csv")
# ensure we ignore the score column when selecting feature columns for matching seniors
cluster_cols = [c for c in cluster_means_all.columns if c not in ("Cluster", "Branch", "score")]

k = 2  # seniors per cluster limit
all_senior_assignments = []
skipped_seniors = []

branches_s = df_seniors["Branch"].fillna("Unknown").unique()
for branch in branches_s:
    df_b = df_seniors[df_seniors["Branch"].fillna("Unknown") == branch].copy()
    if df_b.shape[0] == 0:
        continue

    # Preprocess seniors same as before (exclude Branch in one-hot)
    one_hot_cols = ["Core/Non-Core", "Goal", "Branch"]
    # We will drop Branch column afterwards; keep it to avoid missing-column issues but not use it for matching
    one_hot_cols = [c for c in ["Core/Non-Core", "Goal"] if c in df_b.columns]
    df_onehot = pd.get_dummies(df_b[one_hot_cols].fillna(""), prefix=one_hot_cols)

    multi_cols = ["Languages", "Tech Interests", "Sports Interests", "Cult Interests", "Hobbies"]
    multi_encoded = []
    for col in multi_cols:
        if col not in df_b.columns:
            df_b[col] = ""
        mlb = MultiLabelBinarizer()
        lists = split_multi_values(df_b[col])
        if len(lists) == 0:
            encoded = pd.DataFrame([], index=df_b.index)
        else:
            arr = mlb.fit_transform(lists)
            if arr.size == 0:
                encoded = pd.DataFrame([], index=df_b.index)
            else:
                col_names = [f"{col}_{c}" for c in mlb.classes_]
                encoded = pd.DataFrame(arr, columns=col_names, index=df_b.index)
        multi_encoded.append(encoded)

    df_multi = pd.concat(multi_encoded, axis=1) if multi_encoded else pd.DataFrame(index=df_b.index)

    num_cols = [
        "Num Tech Interests", "Num Sports Interests", "Num Cult Interests",
        "Num_Software", "Num_Electronics", "Num_IndoorGames", "Num_OutdoorGames", "Num_Cultural"
    ]
    for nc in num_cols:
        if nc not in df_b.columns:
            df_b[nc] = 0
        df_b[nc] = pd.to_numeric(df_b[nc], errors="coerce").fillna(0)

    scaler = MinMaxScaler()
    df_scaled = pd.DataFrame(
        scaler.fit_transform(df_b[num_cols]),
        columns=num_cols,
        index=df_b.index
    )

    Xs = pd.concat([df_onehot, df_multi, df_scaled], axis=1).fillna(0)

    for key, w in weights_seniors.items():
        for col in Xs.columns:
            if col.startswith(key):
                Xs[col] = Xs[col] * w

    # Make sure seniors have all columns required by cluster means
    cluster_means_branch = cluster_means_all[cluster_means_all["Branch"] == branch]
    if cluster_means_branch.empty:
        # no clusters for this branch; mark all seniors as skipped
        skipped_seniors.extend(list(df_b["Roll"].astype(str).values))
        continue

    # ignore score when selecting columns for matching seniors
    cluster_cols = [c for c in cluster_means_branch.columns if c not in ("Cluster", "Branch", "score")]

    missing_cols = [c for c in cluster_cols if c not in Xs.columns]
    if missing_cols:
        for c in missing_cols:
            Xs[c] = 0

    seniors_feats = Xs[cluster_cols].apply(pd.to_numeric, errors="coerce").fillna(0).to_numpy()
    clusters_feats = cluster_means_branch[cluster_cols].apply(pd.to_numeric, errors="coerce").fillna(0).to_numpy()

    n_seniors = seniors_feats.shape[0]
    n_clusters = clusters_feats.shape[0]

    dist_matrix = cdist(seniors_feats, clusters_feats, metric="euclidean")
    pairs = []
    for i in range(n_seniors):
        for j in range(n_clusters):
            pairs.append((dist_matrix[i, j], i, j))
    pairs.sort(key=lambda x: x[0])

    assigned = [-1] * n_seniors
    cluster_count = [0] * n_clusters

    for dist, s_idx, c_idx in pairs:
        if assigned[s_idx] != -1:
            continue
        if cluster_count[c_idx] < k:
            assigned[s_idx] = c_idx
            cluster_count[c_idx] += 1

    # any remaining unassigned seniors are skipped (do not assign to nearest)
    for i, a in enumerate(assigned):
        if a == -1:
            skipped_seniors.append(str(df_b.iloc[i]["Roll"]))

    # prepare assigned dataframe rows
    assigned_rows = []
    cluster_list = list(cluster_means_branch["Cluster"].astype(int).values)
    for i, a in enumerate(assigned):
        if a == -1:
            continue
        assigned_rows.append({
            "Roll": str(df_b.iloc[i]["Roll"]),
            "Branch": branch,
            "Cluster": int(cluster_list[a])
        })

    if assigned_rows:
        all_senior_assignments.append(pd.DataFrame(assigned_rows))

# write senior outputs
if all_senior_assignments:
    seniors_combined = pd.concat(all_senior_assignments, axis=0, ignore_index=True)
    seniors_combined.to_csv("data/senior_to_cluster_assignment.csv", index=False)
else:
    # write empty file if none
    pd.DataFrame(columns=["Roll", "Branch", "Cluster"]).to_csv("data/senior_to_cluster_assignment.csv", index=False)

if skipped_seniors:
    pd.DataFrame({"Roll": skipped_seniors}).to_csv("data/skipped_seniors.csv", index=False)
else:
    pd.DataFrame(columns=["Roll"]).to_csv("data/skipped_seniors.csv", index=False)

print("Saved senior assignments and skipped seniors file.")
