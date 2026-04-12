import pandas as pd
import numpy as np
import random
import math

random.seed(42)
np.random.seed(42)

rows = []

for i in range(130):
    num_services = random.randint(2, 5)
    dag_depth = random.randint(1, 4)
    parallel_steps = random.randint(1, min(3, num_services))
    retry_count = np.random.choice([0, 1, 2, 3], p=[0.5, 0.25, 0.15, 0.10])
    avg_latency = round(np.random.uniform(0.8, 6.5), 2)

    score = 0
    score += 1.5 if num_services <= 3 else -0.8 * (num_services - 3)
    score += 1.2 if dag_depth <= 2 else -0.7 * (dag_depth - 2)
    score += 0.8 * parallel_steps
    score += -1.1 * retry_count
    score += -0.45 * avg_latency

    prob = 1 / (1 + math.exp(-score))

    success = 1 if random.random() < prob else 0

    rows.append([
        num_services,
        dag_depth,
        parallel_steps,
        int(retry_count),
        avg_latency,
        success
    ])

df = pd.DataFrame(rows, columns=[
    "num_services",
    "dag_depth",
    "parallel_steps",
    "retry_count",
    "avg_latency",
    "success"
])

df.to_csv("workflow_genome_data.csv", index=False)

print("CSV created successfully")
print(df.head())