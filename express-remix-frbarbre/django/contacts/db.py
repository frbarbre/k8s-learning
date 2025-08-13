from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

def get_database():
    # When running in Docker, use the container name as host
    if os.environ.get('DOCKER_ENV'):
        host = os.getenv('DB_HOST')
    else:
        host = 'localhost'
    
    client = MongoClient(
        f"mongodb://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{host}:27017/",
        authSource="admin"
    )
    return client[os.getenv('DB_NAME')]

def get_contacts_collection():
    db = get_database()
    return db.contacts