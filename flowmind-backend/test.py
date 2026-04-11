import traceback

try:
    import app.main
    print("ok")
except Exception as e:
    with open("err5.txt", "w", encoding="utf-8") as f:
        f.write(traceback.format_exc())
