import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle

# load data
df = pd.read_csv("workflow_genome_data.csv")

# split features and target
X = df.drop("success", axis=1)
y = df["success"]

# split train and test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# train model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# accuracy
accuracy = model.score(X_test, y_test)
print("Accuracy:", accuracy)

# save model
with open("success_model.pkl", "wb") as f:
    pickle.dump(model, f)