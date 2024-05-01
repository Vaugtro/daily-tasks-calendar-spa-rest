package main

import (
	"backend/daily-tasks-rest/config"
	"backend/daily-tasks-rest/controllers"
	"backend/daily-tasks-rest/middleware"

	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// Environment configuration
	config.Environment()

	// Database connection
	config.DatabaseConnection()

	// Configuring CORS
	router.ForwardedByClientIP = true
	router.SetTrustedProxies([]string{"localhost"})

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"PUT", "PATCH", "GET", "POST", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Routes
	routing := router.Group("/task", middleware.AccessTokenHandler)
	{
		routing.POST("", controllers.CreateTask)
	}

	routing = router.Group("/auth")
	{
		routing.POST("/signup", controllers.SignUp)
		routing.POST("/login", controllers.Login)
		routing.POST("/logout", controllers.Logout)
	}

	routing = router.Group("/user", middleware.AccessTokenHandler)
	{
		routing.GET("/profile", controllers.GetProfile)
	}

	// Server startup
	router.Run(":" + config.ENV.GetString("REST_API_PORT"))
}
