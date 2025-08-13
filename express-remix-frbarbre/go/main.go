package main

import (
	"context"
	"log"
	"os"

	"go_contacts/database"
	"go_contacts/handlers"
	"go_contacts/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	app := fiber.New()

	// Enable CORS when running in development.
	if os.Getenv("IS_DEV") == "true" {
		// Configure CORS middleware for development.
		app.Use(cors.New(cors.Config{
			AllowOrigins: "http://localhost:3000",
			AllowMethods: "*",
		}))
	}

	// Use the authentication middleware for all routes.
	// app.Use(middleware.ExtractAuthToken)

	// Connect to MongoDB
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_URI"))
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Ensure the connection is established
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal(err)
	}

	// Set up the database
	database.Setup(client)

	// Use authentication middleware for all routes
	app.Use(middleware.AuthRequired)

	// Auth routes
	app.Post("/api/auth/register", handlers.Register)
	app.Post("/api/auth/signin", handlers.SignIn)
	app.Post("/api/auth/signout", handlers.SignOut)

	// Define routes
	app.Get("/api/contacts", handlers.GetContacts)
	app.Get("/api/contacts/search", handlers.SearchContacts)
	app.Get("/api/contacts/:id", handlers.GetContact)
	app.Post("/api/contacts", handlers.CreateContact)
	app.Put("/api/contacts/:id", handlers.UpdateContact)
	app.Delete("/api/contacts/:id", handlers.DeleteContact)
	app.Patch("/api/contacts/:id/favourite", handlers.FavouriteContact)

	log.Fatal(app.Listen(":8000"))
}
