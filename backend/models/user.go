package models

import (
	"time"
)

type User struct {
	ID        uint      `json:"-" gorm:"primaryKey;autoIncrement"`
	Username  string    `json:"-" gorm:"size:32;not null;unique" validate:"required,min=3"`
	Password  string    `json:"-" gorm:"not null"`
	CreatedAt time.Time `json:"-" gorm:"not null"`
	UpdatedAt time.Time `json:"-" gorm:"not null"`
}

type HandleUser struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type GetUser struct {
	Username string `json:"username"`
}
