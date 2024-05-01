package controllers

import (
	"net/http"

	"backend/daily-tasks-rest/config"
	"backend/daily-tasks-rest/models"

	"github.com/gin-gonic/gin"
)

// GET /task
// Get all tasks
func FindTasks(c *gin.Context) {
	var tasks []models.Task
	config.DB.Find(&tasks)

	c.JSON(http.StatusOK, gin.H{"tasks": tasks})
}

// POST /task
// Create new task
func CreateTask(c *gin.Context) {

	user, _ := c.Get("user")

	// Validate input
	var input models.CreateTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()}) //TODO: change the error message to a custom message, show the error only in logs
		return
	}

	// Create Task
	task := models.Task{Title: input.Title, Description: input.Description, DateStart: input.DateStart, Duration: (input.Duration * 1e9), UserRef: user.(models.User).ID}

	var tags []models.Tag // Fix: Change the declaration to an empty slice of strings

	//TODO: Set error handling for the creation of the task
	config.DB.Create(&task)

	for len(input.Tags) > 0 {
		// TODO: Add logic for processing tags
		tags = append(tags, models.Tag{TaskRef: task.ID, UserRef: user.(models.User).ID, Name: input.Tags[0]})

		input.Tags = input.Tags[1:]
	}

	// Create the tags in a single batch
	config.DB.CreateInBatches(&tags, len(tags))

	c.JSON(http.StatusOK, gin.H{"data": task})
}
