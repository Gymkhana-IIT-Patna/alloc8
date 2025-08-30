"""
# Junior Data Preprocessing
Expects "smp_juniors.json" with columns:
  - Roll
  - Branch
  - Languages
  - Phys/Chem Sem
  - Core/Non-Core
  - Tech Interests
  - Sports Interests
  - Cult Interests
  - Num Tech Interests
  - Num Sports Interests
  - Num Cult Interests
  - Num_Software
  - Num_Electronics
  - Num_IndoorGames
  - Num_OutdoorGames
  - Num_Cultural
  - Goal
  - Hobbies
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MultiLabelBinarizer, MinMaxScaler

from scipy.optimize import linear_sum_assignment
from scipy.spatial.distance import cdist
from sklearn.cluster import KMeans
from sklearn.metrics import pairwise_distances
from scipy.spatial.distance import cdist

df_juniors = pd.read_json("data/smp_juniors.json")
df_juniors.head()

# Assign Weights to decide priorities
weights = {
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

def split_multi_values(series):
    """
    Accepts a pandas Series where each item is either:
     - a comma-separated string "a, b, c"
     - a Python list ['a','b']
     - empty / NaN
    Returns list-of-lists suitable for MultiLabelBinarizer.
    """
    def to_list(x):
        if isinstance(x, list):
            return [s.strip() for s in x if str(s).strip()]
        if pd.isna(x):
            return []
        # string case
        s = str(x)
        if not s.strip():
            return []
        return [i.strip() for i in s.split(",") if i.strip()]
    return series.fillna("").apply(to_list)

# Columns to One-Hot Encode
one_hot_cols = ["Branch", "Phys/Chem Sem", "Core/Non-Core", "Goal"]
df_juniors_onehot = pd.get_dummies(df_juniors[one_hot_cols].fillna(""), prefix=one_hot_cols)

# Columns to Multi-Hot Encode
multi_cols = ["Languages", "Tech Interests", "Sports Interests", "Cult Interests", "Hobbies"]
multi_encoded = []
for col in multi_cols:
    if col not in df_juniors.columns:
        df_juniors[col] = ""
    mlb = MultiLabelBinarizer()
    lists = split_multi_values(df_juniors[col])
    if len(lists) == 0:
        encoded = pd.DataFrame([], index=df_juniors.index)  # empty df_juniors
    else:
        arr = mlb.fit_transform(lists)
        if arr.size == 0:
            encoded = pd.DataFrame([], index=df_juniors.index)
        else:
            col_names = [f"{col}_{c}" for c in mlb.classes_]
            encoded = pd.DataFrame(arr, columns=col_names, index=df_juniors.index)
    multi_encoded.append(encoded)

df_juniors_multi = pd.concat(multi_encoded, axis=1) if multi_encoded else pd.DataFrame(index=df_juniors.index)


# Columns for Min-Max Scaling
num_cols = [
    "Num Tech Interests", "Num Sports Interests", "Num Cult Interests",
    "Num_Software", "Num_Electronics", "Num_IndoorGames", "Num_OutdoorGames", "Num_Cultural"
]
for nc in num_cols:
    if nc not in df_juniors.columns:
        df_juniors[nc] = 0
    df_juniors[nc] = pd.to_numeric(df_juniors[nc], errors="coerce").fillna(0)

scaler = MinMaxScaler()
df_juniors_scaled = pd.DataFrame(
    scaler.fit_transform(df_juniors[num_cols]),
    columns=num_cols,
    index=df_juniors.index
)

# Merged X
X = pd.concat([df_juniors_onehot, df_juniors_multi, df_juniors_scaled], axis=1).fillna(0)

for key, w in weights.items():
    for col in X.columns:
        if col.startswith(key):
            X[col] = X[col] * w

print("Final feature matrix shape:", X.shape)
X.head()

"""
Cluster Processing
Saves Junior Clusters to "smp_clusters.csv"
Saves Cluster Means to "smp_cluster_feature_means.csv"
"""

num_students = df_juniors.shape[0]

# Set Fixed Group Size Here
group_size = 5
num_clusters = num_students // group_size

if num_clusters == 0:
    raise ValueError("group_size is larger than number of students")

# Assign size of each cluster as group size, if there are remaining students, increase cluster size
cluster_sizes = [group_size] * num_clusters
remainder = num_students - sum(cluster_sizes)
for i in range(remainder):
    cluster_sizes[i % num_clusters] += 1

X_mat = X.values if isinstance(X, pd.DataFrame) else np.asarray(X)

# K-Means with fixed Cluster Size (instead of fixed Number of Clusters)
kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=50)
kmeans.fit(X_mat)
centers = kmeans.cluster_centers_

dist_to_centers = cdist(X_mat, centers, metric="euclidean")

slot_list = []
slot_to_cluster = []
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

# Checking Paiwise Distance as Performance Matric
pairwise_distances_list = []
total_pairs = 0

for cluster_id in range(num_clusters):
    points_in_cluster = X[cluster_labels == cluster_id]
    if points_in_cluster.shape[0] > 1:
        distances = pairwise_distances(points_in_cluster)
        pairwise_distances_list.append(np.sum(np.triu(distances, 1)))  # only upper triangle
        total_pairs += (points_in_cluster.shape[0] * (points_in_cluster.shape[0] - 1)) / 2

pairwise_distances_list = np.array(pairwise_distances_list)
print("Average total distance in all pairs in cluster:", pairwise_distances_list.mean())
print("Max Distance:", pairwise_distances_list.max())
print("Min Distance:", pairwise_distances_list.min())

# Mapping with Roll Number
roll_cluster_map = pd.DataFrame({
    "Roll": df_juniors["Roll"],
    "Cluster": cluster_labels
})

# Save to CSV
output_file = "data/smp_clusters.csv"
roll_cluster_map.to_csv(output_file, index=False)

print(f"Cluster assignments saved to {output_file}")
print(roll_cluster_map.head())

# Finding the column-wise mean of each cluster and saving to csv
if not isinstance(X, pd.DataFrame):
    X = pd.DataFrame(X, columns=[f"f_{i}" for i in range(X.shape[1])])

unique_labels = np.unique(cluster_labels)
clusters = sorted(unique_labels.tolist())

cols_to_skip = [c for c in X.columns if "Phys/Chem Sem" in c]

means = []
for label in clusters:
    mask = (cluster_labels == label)
    if mask.sum() == 0:
        mean_row = pd.Series([np.nan] * X.shape[1], index=X.columns)
    else:
        mean_row = X.loc[mask].mean(axis=0)
    means.append(mean_row)

cluster_means_df_juniors = pd.DataFrame(means)
cluster_means_df_juniors = cluster_means_df_juniors.drop(columns=cols_to_skip, errors="ignore")
cluster_means_df_juniors.insert(0, "Cluster", clusters)
cluster_means_df_juniors.to_csv("data/smp_cluster_feature_means.csv", index=False, float_format="%.6f")
print("Saved smp_cluster_feature_means.csv")
cluster_means_df_juniors.tail()

"""
Senior Data Preprocessing
Expects "smp_juniors.json" with columns:
  - Roll
  - Branch
  - Languages
  - Core/Non-Core
  - Tech Interests
  - Sports Interests
  - Cult Interests
  - Num Tech Interests
  - Num Sports Interests
  - Num Cult Interests
  - Num_Software
  - Num_Electronics
  - Num_IndoorGames
  - Num_OutdoorGames
  - Num_Cultural
  - Goal
  - Hobbies
"""

# Same as Juniors, Skipped Column: Phy/Chem Sem
df_seniors = pd.read_json("data/smp_2nd_years.json")

weights = {
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

one_hot_cols = ["Branch", "Core/Non-Core", "Goal"]
df_seniors_onehot = pd.get_dummies(df_seniors[one_hot_cols].fillna(""), prefix=one_hot_cols)

multi_cols = ["Languages", "Tech Interests", "Sports Interests", "Cult Interests", "Hobbies"]
multi_encoded = []
for col in multi_cols:
    if col not in df_seniors.columns:
        df_seniors[col] = ""
    mlb = MultiLabelBinarizer()
    lists = split_multi_values(df_seniors[col])
    if len(lists) == 0:
        encoded = pd.DataFrame([], index=df_seniors.index)  # empty df_seniors
    else:
        arr = mlb.fit_transform(lists)
        if arr.size == 0:
            encoded = pd.DataFrame([], index=df_seniors.index)
        else:
            col_names = [f"{col}_{c}" for c in mlb.classes_]
            encoded = pd.DataFrame(arr, columns=col_names, index=df_seniors.index)
    multi_encoded.append(encoded)

df_seniors_multi = pd.concat(multi_encoded, axis=1) if multi_encoded else pd.DataFrame(index=df_seniors.index)

num_cols = [
    "Num Tech Interests", "Num Sports Interests", "Num Cult Interests",
    "Num_Software", "Num_Electronics", "Num_IndoorGames", "Num_OutdoorGames", "Num_Cultural"
]

for nc in num_cols:
    if nc not in df_seniors.columns:
        df_seniors[nc] = 0
    df_seniors[nc] = pd.to_numeric(df_seniors[nc], errors="coerce").fillna(0)

scaler = MinMaxScaler()
df_seniors_scaled = pd.DataFrame(
    scaler.fit_transform(df_seniors[num_cols]),
    columns=num_cols,
    index=df_seniors.index
)

X = pd.concat([df_seniors_onehot, df_seniors_multi, df_seniors_scaled], axis=1).fillna(0)

for key, w in weights.items():
    for col in X.columns:
        if col.startswith(key):
            X[col] = X[col] * w

X['Roll'] = df_seniors.Roll
print("Final feature matrix shape:", X.shape)

"""# Final Clustering
Outputs final Clusters (Seniors with Cluster IDs) to "senior_to_cluster_assignment.csv"
"""

# Cluster 2 seniors with each cluster based on cluster mean
k = 2  # set how many seniors you want per cluster (change as needed)

seniors = X
cluster_means = pd.read_csv("data/smp_cluster_feature_means.csv")
cluster_cols = [c for c in cluster_means.columns if c != "Cluster"]

if "Roll" not in seniors.columns:
    raise ValueError("seniors.csv must contain a 'Roll' column")

missing_cols = [c for c in cluster_cols if c not in seniors.columns]
if missing_cols:
    raise ValueError(f"seniors.csv is missing these feature columns required for distance computation: {missing_cols}")

seniors_feats = seniors[cluster_cols].apply(pd.to_numeric, errors="coerce").fillna(0).to_numpy()
clusters_feats = cluster_means[cluster_cols].apply(pd.to_numeric, errors="coerce").fillna(0).to_numpy()
n_seniors = seniors_feats.shape[0]
n_clusters = clusters_feats.shape[0]

# Calculating Weighted Distance with cdist
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

unassigned_idxs = [i for i, a in enumerate(assigned) if a == -1]
if unassigned_idxs:
    for i in unassigned_idxs:
        nearest = int(np.argmin(dist_matrix[i]))
        assigned[i] = nearest
        cluster_count[nearest] += 1

# Appending Roll Numbers with cluster
result_df = pd.DataFrame({
    "Roll": seniors["Roll"].astype(str).values,
    "Cluster": assigned
})

out_path = "data/senior_to_cluster_assignment.csv"
result_df.to_csv(out_path, index=False)
print(f"Saved senior assignments to {out_path}")
print("Counts per cluster (after assignment):")
print(pd.Series(assigned).value_counts().sort_index())