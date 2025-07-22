import os
from pathlib import Path
from dotenv import load_dotenv


dotenv_path = Path('.env')
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
SECRET = os.getenv("SECRET")

if not MONGO_URI:
    raise ValueError("MONGO_URI not set in environment variables")
if not SECRET:
    raise ValueError("SECRET not set in environment variables")