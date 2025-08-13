package database

import (
	"os"

	"go.mongodb.org/mongo-driver/mongo"
)

var (
	ContactCollection   *mongo.Collection
	UserCollection      *mongo.Collection
	AuthTokenCollection *mongo.Collection
	FavouriteCollection *mongo.Collection
)

func Setup(client *mongo.Client) {
	db_name := os.Getenv("DB_NAME")
	ContactCollection = client.Database(db_name).Collection("contacts")
	UserCollection = client.Database(db_name).Collection("users")
	AuthTokenCollection = client.Database(db_name).Collection("auth_tokens")
	FavouriteCollection = client.Database(db_name).Collection("favourites")
}
