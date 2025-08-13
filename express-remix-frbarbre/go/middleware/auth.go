package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"go_contacts/database"
	"go_contacts/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

// Define a custom type for context keys.
type ctxKey string

// UserKey is the key we'll use to store the user in the context.
const UserKey ctxKey = "user"

// AuthRequired checks if the request is authenticated.
func AuthRequired(c *fiber.Ctx) error {
	// Skip authentication for sign-in and register routes
	if c.Path() == "/api/auth/signin" || c.Path() == "/api/auth/register" {
		return c.Next()
	}

	token := c.Get("Authorization")
	if token == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authorization token is missing",
		})
	}

	// Remove "Bearer " prefix if present
	token = strings.TrimPrefix(token, "Bearer ")

	// Find the auth token in the database
	var authToken models.AuthToken
	err := database.AuthTokenCollection.FindOne(context.Background(), bson.M{
		"token":      token,
		"expires_at": bson.M{"$gt": time.Now()},
	}).Decode(&authToken)

	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid or expired token",
		})
	}

	// Get the user
	var user models.User
	err = database.UserCollection.FindOne(context.Background(), bson.M{"_id": authToken.UserID}).Decode(&user)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Store both user and token in context
	ctx := context.WithValue(c.Context(), UserKey, user)
	c.SetUserContext(ctx)
	c.Locals("token", token)

	return c.Next()
}

// GetUser is a helper to retrieve the user from a context.
func GetUser(ctx context.Context) (models.User, bool) {
	user, ok := ctx.Value(UserKey).(models.User)
	return user, ok
}
