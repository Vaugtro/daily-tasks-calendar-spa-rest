package models

type Tag struct {
	ID      uint   `json:"-" gorm:"primaryKey;autoIncrement"`
	Name    string `json:"name" gorm:"size:32;not null" validate:"required,min=3"`
	UserRef uint   `json:"-" gorm:"not null"`
	User    User   `json:"-" gorm:"foreignKey:UserRef"`
	TaskRef uint   `json:"-"`
}

type CreateTagInput struct {
	Name    string `json:"name" binding:"required"`
	UserRef uint   `json:"-" binding:"required"`
	TaskRef uint   `json:"-" binding:"required"`
}
