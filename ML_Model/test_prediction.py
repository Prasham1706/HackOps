import pickle

with open("success_model.pkl", "rb") as f:
    model = pickle.load(f)

sample = [[3, 2, 2, 0, 1.8]]

prob = model.predict_proba(sample)[0][1]

print("Success Probability:", round(prob * 100, 2), "%")