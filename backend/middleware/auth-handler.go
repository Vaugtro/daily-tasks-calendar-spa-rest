package middleware

import (
	"time"

	"fmt"

	"net/http"

	"backend/daily-tasks-rest/config"
	"backend/daily-tasks-rest/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Middleware to clean up the cookies
func AuthCookieCleanup(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "", "", false, true)
	c.SetCookie("refresh_token", "", -1, "", "", false, true)
}

func AccessTokenHandler(c *gin.Context) {

	// Get the access token from the cookie
	tokenString, errA := c.Cookie("access_token")
	_, errR := c.Cookie("refresh_token")

	// If there is an error getting the access token from the cookie, try to get it from the header
	if errA != nil {
		tokenString = c.GetHeader("Authorization")
	}

	// If there is an error getting both tokens from the cookie, proceed to the refresh token handler
	if errR != nil {
		RefreshTokenHandler(c)
		return
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {

		// Validates the signing method and algorithm
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// If the token is valid, return the secret key
		return []byte(config.ENV.GetString("JWT_ACCESS_SECRET")), nil
	})

	// If there is an error parsing the token
	if err != nil {
		RefreshTokenHandler(c)
		return
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Check the expiration time
		if time.Now().Unix() > int64(claims["exp"].(float64)) {
			// If the token is expired, go to the refresh token handler
			RefreshTokenHandler(c)
			return
		}

		// Lookup the user in the database
		var user models.User
		config.DB.First(&user, "id = ?", claims["sub"])

		// If the user does not exist, go to the refresh token handler
		if user.ID == 0 {
			RefreshTokenHandler(c)
			return
		}

		// If the user exists, attach the user to the context
		c.Set("user", user)

		// Proceed to the request
		c.Next()
		return
	}

	// If the token is invalid, go to the refresh token handler
	RefreshTokenHandler(c)
}

func RefreshTokenHandler(c *gin.Context) {

	// Get the refresh token from the cookie
	tokenString, err := c.Cookie("refresh_token")

	// If there is an error getting the token from the cookie, abort the request and clear the cookies
	if err != nil {
		AuthCookieCleanup(c)
		c.AbortWithStatusJSON(401, gin.H{"message": "Unauthorized"})
		return
	}

	// Parse the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {

		// Validates the signing method and algorithm
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// If the token is valid, return the secret key
		return []byte(config.ENV.GetString("JWT_REFRESH_SECRET")), nil
	})

	// If there is an error parsing the token
	if err != nil {
		AuthCookieCleanup(c)
		c.AbortWithStatusJSON(401, gin.H{"message": "Token expired"})
		return
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Check the expiration time
		if time.Now().Unix() > int64(claims["exp"].(float64)) {
			// If the token is expired, return an error message
			AuthCookieCleanup(c)
			c.AbortWithStatusJSON(401, gin.H{"message": "Token expired"})
			return
		}

		// Lookup the user in the database
		var user models.User
		config.DB.First(&user, "id = ?", claims["sub"])

		// If the user does not exist, return an error message
		if user.ID == 0 {
			AuthCookieCleanup(c)
			c.AbortWithStatusJSON(401, gin.H{"message": "Token expired"})
			return
		}

		// If the user exists, attach the user to the context
		c.Set("user", user)

		// Create a new access token object
		accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub": user.ID,
			"exp": time.Now().Add(time.Minute * 15).Unix(),
			"iat": time.Now().Unix(),
			"typ": "access",
		})

		// Sign and get the complete encoded token as a string using the secret
		accessTokenString, err := accessToken.SignedString([]byte(config.ENV.GetString("JWT_ACCESS_SECRET")))

		// Check if there was an error generating the token
		if err != nil {
			AuthCookieCleanup(c)
			c.AbortWithStatusJSON(401, gin.H{"message": "Unauthorized"})
			return
		}

		// Set the access token cookie into the response
		c.SetSameSite(http.SameSiteLaxMode)
		c.SetCookie("access_token", accessTokenString, 60*15, "", "", false, true)
		c.Header("Authorization", "Bearer "+accessTokenString)

		// Proceed to the request
		c.Next()
		return
	}

	// If the token is invalid, abort the request and clear the cookies
	AuthCookieCleanup(c)
	c.AbortWithStatusJSON(401, gin.H{"message": "Unauthorized"})
}
