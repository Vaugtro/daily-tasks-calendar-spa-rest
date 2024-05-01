package models

import (
	"time"

	"github.com/google/uuid"
)

type Task struct {
	ID          uint          `json:"-" gorm:"primaryKey;autoIncrement"`
	UUID        uuid.UUID     `json:"uuid" gorm:"type:uuid;unique;not null;default:gen_random_uuid()"`
	Title       string        `json:"title" gorm:"size:256;not null"`
	Description string        `json:"description"`
	DateStart   time.Time     `json:"date_start" gorm:"not null"`
	Duration    time.Duration `json:"duration" gorm:"not null"`
	Status      bool          `json:"status" gorm:"default:false"`
	UserRef     uint          `json:"-" gorm:"not null"`
	User        User          `json:"-" gorm:"foreignKey:UserRef"`
	Tag         []Tag         `json:"tags" gorm:"foreignKey:TaskRef"`
	CreatedAt   time.Time     `json:"-" gorm:"not null"`
	UpdatedAt   time.Time     `json:"-" gorm:"not null"`
}

type CreateTaskInput struct {
	Title       string        `json:"title" binding:"required"`
	Description string        `json:"description"`
	DateStart   time.Time     `json:"date_start" binding:"required"`
	Duration    time.Duration `json:"duration" binding:"required"`
	Tags        []string      `json:"tags"`
	UserRef     uint          `json:"-"`
}
