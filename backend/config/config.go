package config

import (
	"backend/daily-tasks-rest/models"

	"github.com/spf13/viper"
	"gorm.io/driver/postgres"

	"gorm.io/gorm"
)

var DB *gorm.DB
var ENV *viper.Viper

func Environment() {
	viper.SetConfigFile(".env")
	viper.ReadInConfig()

	ENV = viper.GetViper()
}

func DatabaseConnection() {

	dsn := "host=192.168.1.16 user=postgres password=12345678 dbname=daily-tasks-calendar port=5450 sslmode=disable TimeZone=America/Sao_Paulo"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("Failed to connect to database!")
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.Task{},
		&models.Tag{},
	)
	if err != nil {
		return
	}

	// Create a trigger on the tags table
	db.Exec(`
		CREATE OR REPLACE FUNCTION max_tags_trigger() RETURNS TRIGGER AS $$
	DECLARE
		tag_count INTEGER;
	BEGIN
		-- Get the count of tags for the corresponding task_ref
		SELECT COUNT(*) INTO tag_count
		FROM tags
		WHERE task_ref = NEW.task_ref;

		-- Check if the count exceeds the limit
		IF tag_count > 5 THEN
			RAISE EXCEPTION 'Maximum number of tags exceeded for this task';
		END IF;

		-- If the count is within the limit, allow the operation to proceed
		RETURN NEW;
	END;
	$$ LANGUAGE plpgsql;

	-- Create the trigger
	CREATE TRIGGER enforce_max_tags
	BEFORE INSERT OR UPDATE ON tags
	FOR EACH ROW EXECUTE FUNCTION max_tags_trigger();
		`)

	DB = db
}
