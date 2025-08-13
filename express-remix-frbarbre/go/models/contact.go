package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Contact struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID   primitive.ObjectID `bson:"user_id" json:"-"`
	Avatar   string             `json:"avatar" validate:"omitempty,url"`
	First    string             `json:"first" validate:"required,min=3"`
	Last     string             `json:"last" validate:"required"`
	Twitter  string             `json:"twitter" validate:"omitempty"`
	Favorite bool               `json:"favorite" bson:"favorite" default:"false"`
}
