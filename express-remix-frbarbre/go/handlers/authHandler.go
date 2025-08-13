package handlers

import (
	"context"
	"net/http"
	"time"

	"go_contacts/database"
	"go_contacts/models"
	"go_contacts/utils"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Register(c *fiber.Ctx) error {
	var user models.User
	if violations, err := ValidateAndBindModel(c, &user); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"validation_error": violations})
	}

	// Check if email already exists
	var existingUser models.User
	err := database.UserCollection.FindOne(context.Background(), bson.M{"email": user.Email}).Decode(&existingUser)
	if err == nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Email already registered"})
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process registration"})
	}
	user.Password = hashedPassword

	// Create user
	user.ID = primitive.NewObjectID()
	_, err = database.UserCollection.InsertOne(context.Background(), user)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	// Generate token
	token := utils.GenerateToken()
	authToken := models.AuthToken{
		ID:        primitive.NewObjectID(),
		Token:     token,
		UserID:    user.ID,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(180 * 24 * time.Hour), // Token expires in 6 months
	}

	_, err = database.AuthTokenCollection.InsertOne(context.Background(), authToken)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create auth token"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":    user.ID,
			"email": user.Email,
		},
	})
}

func SignIn(c *fiber.Ctx) error {
	var credentials struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required"`
	}

	if err := c.BodyParser(&credentials); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var user models.User
	err := database.UserCollection.FindOne(context.Background(), bson.M{"email": credentials.Email}).Decode(&user)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if !utils.CheckPasswordHash(credentials.Password, user.Password) {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Generate new token
	token := utils.GenerateToken()
	authToken := models.AuthToken{
		ID:        primitive.NewObjectID(),
		Token:     token,
		UserID:    user.ID,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(180 * 24 * time.Hour), // Token expires in 6 months
	}

	_, err = database.AuthTokenCollection.InsertOne(context.Background(), authToken)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create auth token"})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":    user.ID,
			"email": user.Email,
		},
	})
}

func SignOut(c *fiber.Ctx) error {
	token := c.Locals("token").(string)
	if token == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "No token provided"})
	}

	result, err := database.AuthTokenCollection.DeleteOne(context.Background(), bson.M{"token": token})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to sign out"})
	}

	// Check if a document was actually deleted
	if result.DeletedCount == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Token not found"})
	}

	return c.SendStatus(http.StatusNoContent)
}
