package controllers

import (
	"net/http"
	"time"

	"backend/daily-tasks-rest/config"
	"backend/daily-tasks-rest/models"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// SignUp handles the user sign-up functionality.
// It receives a JSON payload containing the user's username and password,
// validates the input, hashes the password, and creates a new user in the database.
// If there are any errors during the sign-up process, appropriate error responses are returned.
func SignUp(c *gin.Context) {

	// Set up the input model
	var input models.HandleUser

	// Bind the JSON payload to the input model
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	// Use bcrypt package to hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to hash password"})
		return
	}

	// Create a new user model
	user := models.User{Username: input.Username, Password: string(hashedPassword)}

	validator := validator.New()
	if err := validator.Struct(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "The username must be at least 3 characters long"})
		return
	}

	// Create the user in the database
	if res := config.DB.Create(&user); res.Error != nil {
		c.JSON(http.StatusConflict, gin.H{"message": "User already exists!"})
		return
	}

	// Return empty response with status OK
	c.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
}

func Login(c *gin.Context) {

	// Set up the input model
	var input models.HandleUser

	// Bind the JSON payload to the input model
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	// Lookup the user in the database
	var user models.User
	config.DB.First(&user, "username = ?", input.Username)

	// Check if the user exists and the password is correct
	if user.ID == 0 || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid username or password"})
		return
	}

	// Create a new access token object
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Minute * 15).Unix(),
		"iat": time.Now().Unix(),
		"typ": "access",
	})

	// Create a new refresh token object
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(),
		"iat": time.Now().Unix(),
		"typ": "refresh",
	})

	// Sign and get the complete encoded token as a string using the secret
	accessTokenString, errA := accessToken.SignedString([]byte(config.ENV.GetString("JWT_ACCESS_SECRET")))
	refreshTokenString, errR := refreshToken.SignedString([]byte(config.ENV.GetString("JWT_REFRESH_SECRET")))

	// Check if there was an error generating the token
	if errA != nil || errR != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
		return
	}

	// Return the token in the header
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("access_token", accessTokenString, 60*15, "", "", false, true)
	c.SetCookie("refresh_token", refreshTokenString, 3600*24*7, "", "", false, true)
	c.Header("Authorization", "Bearer "+accessTokenString)

	c.JSON(http.StatusOK, gin.H{"message": "User logged in successfully"})
}

func Logout(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "", "", false, true)
	c.SetCookie("refresh_token", "", -1, "", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "User logged out successfully"})
}

func GetProfile(c *gin.Context) {
	user, _ := c.Get("user")
	var output models.GetUser

	output.Username = user.(models.User).Username

	c.JSON(http.StatusOK, gin.H{"data": output})
}
