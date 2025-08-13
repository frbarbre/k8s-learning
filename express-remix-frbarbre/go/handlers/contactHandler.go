package handlers

import (
	"context"
	"net/http"

	"go_contacts/database"
	"go_contacts/middleware"
	"go_contacts/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetContacts(c *fiber.Ctx) error {
	user, ok := middleware.GetUser(c.UserContext())
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found in context"})
	}

	background := context.Background()
	cursor, err := database.ContactCollection.Find(background, bson.M{"user_id": user.ID})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch contacts"})
	}
	defer cursor.Close(background)

	var contacts []models.Contact
	if err = cursor.All(background, &contacts); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse contacts"})
	}

	if contacts == nil {
		contacts = []models.Contact{}
	}

	return c.JSON(contacts)
}

func GetContact(c *fiber.Ctx) error {
	user, ok := middleware.GetUser(c.UserContext())
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found in context"})
	}

	idParam := c.Params("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var contact models.Contact
	err = database.ContactCollection.FindOne(context.Background(), bson.M{
		"_id":     id,
		"user_id": user.ID,
	}).Decode(&contact)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Contact not found"})
	}

	return c.JSON(contact)
}

func CreateContact(c *fiber.Ctx) error {
	user, ok := middleware.GetUser(c.UserContext())
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found in context"})
	}

	var contact models.Contact
	if violations, err := ValidateAndBindModel(c, &contact); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"validation_error": violations})
	}

	contact.ID = primitive.NewObjectID()
	contact.UserID = user.ID
	_, err := database.ContactCollection.InsertOne(context.Background(), contact)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create contact"})
	}

	return c.Status(http.StatusCreated).JSON(contact)
}

func UpdateContact(c *fiber.Ctx) error {
	user, ok := middleware.GetUser(c.UserContext())
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found in context"})
	}

	idParam := c.Params("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	// Check if contact exists and belongs to user
	var existingContact models.Contact
	err = database.ContactCollection.FindOne(context.Background(), bson.M{
		"_id":     id,
		"user_id": user.ID,
	}).Decode(&existingContact)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Contact not found"})
	}

	var contact models.Contact
	if violations, err := ValidateAndBindModel(c, &contact); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"validation_error": violations})
	}

	contact.ID = id
	contact.UserID = user.ID

	_, err = database.ContactCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": id, "user_id": user.ID},
		bson.M{"$set": contact},
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update contact"})
	}

	return c.JSON(contact)
}

func DeleteContact(c *fiber.Ctx) error {
	user, ok := middleware.GetUser(c.UserContext())
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found in context"})
	}

	idParam := c.Params("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	result, err := database.ContactCollection.DeleteOne(context.Background(), bson.M{
		"_id":     id,
		"user_id": user.ID,
	})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete contact"})
	}

	if result.DeletedCount == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Contact not found"})
	}

	return c.SendStatus(http.StatusNoContent)
}

func SearchContacts(c *fiber.Ctx) error {
	user, ok := middleware.GetUser(c.UserContext())
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found in context"})
	}

	query := c.Query("query")

	filter := bson.M{
		"user_id": user.ID,
		"$or": []bson.M{
			{"first": bson.M{"$regex": query, "$options": "i"}},
			{"last": bson.M{"$regex": query, "$options": "i"}},
			{"twitter": bson.M{"$regex": query, "$options": "i"}},
		},
	}

	cursor, err := database.ContactCollection.Find(context.Background(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to search contacts"})
	}
	defer cursor.Close(context.Background())

	var contacts []models.Contact
	if err = cursor.All(context.Background(), &contacts); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse contacts"})
	}

	if contacts == nil {
		contacts = []models.Contact{}
	}

	return c.JSON(contacts)
}

func FavouriteContact(c *fiber.Ctx) error {
	user, ok := middleware.GetUser(c.UserContext())
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "User not found in context"})
	}

	idParam := c.Params("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	// Check if contact exists and belongs to user
	var contact models.Contact
	err = database.ContactCollection.FindOne(context.Background(), bson.M{
		"_id":     id,
		"user_id": user.ID,
	}).Decode(&contact)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Contact not found"})
	}

	// Toggle the favorite status
	_, err = database.ContactCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": id, "user_id": user.ID},
		bson.M{"$set": bson.M{"favorite": !contact.Favorite}},
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update favorite status"})
	}

	// Get the updated contact
	err = database.ContactCollection.FindOne(context.Background(), bson.M{
		"_id":     id,
		"user_id": user.ID,
	}).Decode(&contact)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch updated contact"})
	}

	return c.JSON(contact)
}
