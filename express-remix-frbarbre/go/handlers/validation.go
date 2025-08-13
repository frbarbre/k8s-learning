package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

// bindModelFromMap dynamically binds JSON data (decoded into a map)
// into any model struct based on its json and validate tags.
// It returns a map of field errors if found.
func bindModelFromMap(rawData map[string]interface{}, model interface{}) map[string]string {
	errorsMap := make(map[string]string)
	// Expect model to be a pointer to a struct.
	t := reflect.TypeOf(model).Elem()
	v := reflect.ValueOf(model).Elem()

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		jsonKey := field.Tag.Get("json")
		// Skip fields without a JSON tag or those explicitly ignored.
		if jsonKey == "" || jsonKey == "-" {
			continue
		}
		// Skip the "id" field (we generate it later).
		if jsonKey == "id" {
			continue
		}

		// Determine if the field is required from the "validate" tag.
		validateTag := field.Tag.Get("validate")
		required := false
		if validateTag != "" && strings.Contains(validateTag, "required") {
			required = true
		}

		// Look up the raw JSON value by the jsonKey.
		value, exists := rawData[jsonKey]
		if !exists {
			if required {
				errorsMap[jsonKey] = "is required"
			}
			continue
		}

		// Type-check and set the value based on the field kind.
		switch field.Type.Kind() {
		case reflect.String:
			str, ok := value.(string)
			if !ok {
				errorsMap[jsonKey] = "should be a string"
			} else {
				v.Field(i).SetString(str)
			}
		case reflect.Bool:
			b, ok := value.(bool)
			if !ok {
				errorsMap[jsonKey] = "should be a boolean"
			} else {
				v.Field(i).SetBool(b)
			}
		// Add additional cases if your model contains other types.
		default:
			// Unsupported field types can be handled here if needed.
		}
	}
	return errorsMap
}

// ValidateAndBindModel handles reading the request body, binding the JSON payload
// into the provided model (via reflection) and performing extra validation using the
// validator tags. It returns a map of field errors or nil if validation passes.
func ValidateAndBindModel(c *fiber.Ctx, model interface{}) (map[string]string, error) {
	var rawData map[string]interface{}
	// Unmarshal the request body into a map.
	if err := json.Unmarshal(c.Body(), &rawData); err != nil {
		var syntaxError *json.SyntaxError
		errMsg := err.Error()
		if errors.As(err, &syntaxError) {
			errMsg = fmt.Sprintf("malformed JSON at position %d", syntaxError.Offset)
		}
		return map[string]string{"body": errMsg}, err
	}

	// Use reflection to bind the payload into the model.
	fieldErrors := bindModelFromMap(rawData, model)
	if len(fieldErrors) > 0 {
		return fieldErrors, errors.New("field binding errors")
	}

	// Use the validator package for any further validation (e.g. URL format).
	validate := validator.New()
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := fld.Tag.Get("json")
		if name == "-" {
			return fld.Name
		}
		return name
	})
	if err := validate.Struct(model); err != nil {
		validationErrors := err.(validator.ValidationErrors)
		errMap := make(map[string]string)
		for _, vErr := range validationErrors {
			var msg string
			switch vErr.Tag() {
			case "required":
				msg = "is required"
			case "url":
				msg = "must be a valid URL"
			default:
				msg = fmt.Sprintf("failed on the '%s' tag", vErr.Tag())
			}
			errMap[vErr.Field()] = msg
		}
		return errMap, errors.New("struct validation errors")
	}

	return nil, nil
}
