package handler

import (
	"aiapply/database"
	"aiapply/emailer"
	"aiapply/models"
	"aiapply/utils"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateApplication handles job application creation and analytics tracking
func CreateApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var application models.JobApplication
		if err := c.ShouldBindJSON(&application); err != nil {
			log.Println("Error binding JSON:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		userID, err := utils.GetUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}
		application.UserID = userID

		// Perform core application creation in a transaction
		err = db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&application).Error; err != nil {
				return err
			}

			if application.ApplicationType == "cold_email" {
				coldEmail := models.ColdEmail{
					UserID:        application.UserID,
					ApplicationID: application.ID,
					Status:        "sent",
				}
				if err := tx.Create(&coldEmail).Error; err != nil {
					return err
				}
			}
			return nil
		})

		if err != nil {
			log.Printf("Transaction failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction failed: " + err.Error()})
			return
		}

		// If cold email, send emails in a goroutine
		if application.ApplicationType == "cold_email" {
			var wg sync.WaitGroup
			for _, name := range application.EmployeeNames {
				wg.Add(1)
				go func(name string, app models.JobApplication) {
					defer wg.Done()
					var user models.User
					if err := db.First(&user, app.UserID).Error; err != nil {
						log.Printf("Failed to fetch user for cold email: %v", err)
						return
					}

					parts := strings.Fields(name)
					if len(parts) < 2 {
						log.Printf("Skipping invalid name: %s", name)
						return
					}
					firstName, lastName := parts[0], parts[len(parts)-1]
					permutations := emailer.GeneratePermutations(firstName, lastName, app.Domain)

					for _, email := range permutations {
						if err := emailer.ValidateEmail(email); err == nil {
							log.Printf("Sending cold email to %s for job %s", email, app.JobTitle)

							if err := emailer.SendApplicationEmail(email, app.JobTitle, user); err == nil {
								// Update analytics only after email is successfully sent
								if err := database.UpdateAnalytics(db, int(app.UserID), app.Platform, true); err != nil {
									log.Printf("Failed to update analytics for %s: %v", email, err)
								}
								break // Assuming one valid email per name is enough
							}
						}
					}
				}(name, application)
			}
			go func() {
				wg.Wait()
				log.Println("All cold emails processed.")
			}()
		} else {
			// Update analytics for other application types
			go func() {
				if err := database.UpdateAnalytics(db, int(application.UserID), application.Platform, false); err != nil {
					log.Printf("Failed to update analytics: %v", err)
				}
			}()
		}

		c.JSON(http.StatusOK, application)
	}
}

// GetApplications returns all applications for a given user
func GetApplications(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var applications []models.JobApplication
		userID, err := utils.GetUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		if err := db.Where("user_id = ?", userID).Find(&applications).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching applications"})
			return
		}

		c.JSON(http.StatusOK, applications)
	}
}

// UpdateApplication updates an existing application
func UpdateApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var application models.JobApplication
		if err := c.ShouldBindJSON(&application); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		userID, err := utils.GetUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		var existingApplication models.JobApplication
		if err := db.Where("id = ? AND user_id = ?", c.Param("id"), userID).First(&existingApplication).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
			return
		}

		if err := db.Model(&existingApplication).Updates(application).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update application"})
			return
		}

		c.JSON(http.StatusOK, existingApplication)
	}
}

// DeleteApplication deletes an application
func DeleteApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := utils.GetUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		if err := db.Where("id = ? AND user_id = ?", c.Param("id"), userID).Delete(&models.JobApplication{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete application"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Application deleted successfully"})
	}
}

func GetApplicationByID(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		applicationID := c.Param("id")
		userID, err := utils.GetUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		var application models.JobApplication
		if err := db.Preload("ColdEmail").Where("id = ? AND user_id = ?", applicationID, userID).First(&application).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Application with ID %s not found", applicationID)})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch application"})
			return
		}

		c.JSON(http.StatusOK, application)
	}
}
