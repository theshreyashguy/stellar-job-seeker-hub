package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/idtoken"

	"aiapply/database"
	"aiapply/models"
	"aiapply/utils"
)

func Login(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		dbUser, err := database.GetUserByEmail(db, user.Email)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(dbUser.Password), []byte(user.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Password is incorrect"})
			return
		}

		token, err := utils.CreateToken(dbUser.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
			return
		}

		c.JSON(http.StatusOK, models.Token{Token: token})
	}
}

func GoogleLogin(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var body struct {
			Token string `json:"token"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		payload, err := idtoken.Validate(c.Request.Context(), body.Token, "851068951455-4u7jf9lpg9a646tqe3uffdmouk1cc40e.apps.googleusercontent.com")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid ID token"})
			return
		}

		email, _ := payload.Claims["email"].(string)
		name, _ := payload.Claims["name"].(string)

		user, err := database.GetUserByEmail(db, email)
		if err != nil {
			user = &models.User{
				Email:    email,
				Username: name,
			}
			if _, err := database.CreateUser(db, user); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
				return
			}
		}

		jwtToken, err := utils.CreateToken(user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
			return
		}

		c.JSON(http.StatusOK, models.Token{Token: jwtToken})
	}
}

func Register(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		user.Password = string(hashedPassword)

		if _, err := database.CreateUser(db, &user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}

		token, err := utils.CreateToken(user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
			return
		}

		c.JSON(http.StatusOK, models.Token{Token: token})
	}
}