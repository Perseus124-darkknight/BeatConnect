const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'BeatConnect API Documentation',
    version: '1.0.0',
    description: 'Comprehensive documentation for the BeatConnect AI backend microservices, including user management, chat, and music services.',
    contact: {
      name: 'BeatConnect Development Team'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    "/api/register": {
      "post": {
        "tags": ["Auth"],
        "summary": "Register a new user",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["username", "email", "password"],
                "properties": {
                  "username": { "type": "string" },
                  "email": { "type": "string" },
                  "password": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": { "200": { "description": "User registered successfully" } }
      }
    },
    "/api/login": {
      "post": {
        "tags": ["Auth"],
        "summary": "User Login",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["username", "password"],
                "properties": {
                  "username": { "type": "string" },
                  "password": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": { "200": { "description": "JWT Token returned" } }
      }
    },
    "/api/reset-password": {
      "post": {
        "tags": ["Auth"],
        "summary": "Reset password",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "new_password"],
                "properties": {
                  "email": { "type": "string" },
                  "new_password": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": { "200": { "description": "Password updated" } }
      }
    },
    "/api/user/profile": {
      "get": {
        "tags": ["User"],
        "summary": "Get user profile",
        "security": [{ "BearerAuth": [] }],
        "responses": { "200": { "description": "User profile data" } }
      },
      "put": {
        "tags": ["User"],
        "summary": "Update user profile",
        "security": [{ "BearerAuth": [] }],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "username": { "type": "string" },
                  "email": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": { "200": { "description": "Profile updated" } }
      }
    },
    "/api/user/upgrade": {
      "post": {
        "tags": ["User"],
        "summary": "Upgrade user to BeatConnect PRO",
        "security": [{ "BearerAuth": [] }],
        "responses": { "200": { "description": "Account upgraded to PRO" } }
      }
    },
    "/api/chat": {
      "post": {
        "tags": ["AI Chat"],
        "summary": "Send a message to the AI Chatbot",
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "prompt": { "type": "string", "description": "The user's message" },
                  "context": { "type": "string", "description": "JSON string of conversation history" },
                  "model": { "type": "string", "description": "AI model to use" },
                  "file": { "type": "string", "format": "binary", "description": "Optional image/file" }
                }
              }
            }
          }
        },
        "responses": { "200": { "description": "Success" } }
      }
    },
    "/api/daily/report": {
      "get": {
        "tags": ["Media"],
        "summary": "Get the latest daily music report",
        "responses": { "200": { "description": "Markdown content of the report" } }
      }
    },
    "/api/artists": {
      "get": {
        "tags": ["Media"],
        "summary": "List all legendary artists",
        "responses": { "200": { "description": "Array of artist names" } }
      }
    },
    "/api/artist/{name}": {
      "get": {
        "tags": ["Media"],
        "summary": "Get detailed artist knowledge",
        "parameters": [
          { "in": "path", "name": "name", "required": true, "schema": { "type": "string" } }
        ],
        "responses": { "200": { "description": "Knowledge items" } }
      }
    },
    "/api/user/post": {
      "post": {
        "tags": ["Social"],
        "summary": "Create a post about an artist",
        "security": [{ "BearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["artist_name", "content"],
                "properties": {
                  "artist_name": { "type": "string" },
                  "content": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": { "200": { "description": "Post created" } }
      }
    },
    "/api/posts/{artist}": {
      "get": {
        "tags": ["Social"],
        "summary": "Retrieve posts for a specific artist",
        "parameters": [
          { "in": "path", "name": "artist", "required": true, "schema": { "type": "string" } }
        ],
        "responses": { "200": { "description": "List of posts" } }
      }
    },
    "/api/user/favorite": {
      "post": {
        "tags": ["Interaction"],
        "summary": "Toggle favorite status",
        "security": [{ "BearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["entityType", "entityId"],
                "properties": {
                  "entityType": { "type": "string", "enum": ["artist", "album", "track"] },
                  "entityId": { "type": "integer" }
                }
              }
            }
          }
        },
        "responses": { "200": { "description": "Toggled successfully" } }
      }
    },
    "/api/user/rate": {
      "post": {
        "tags": ["Interaction"],
        "summary": "Submit a star rating (1-5)",
        "security": [{ "BearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["entityType", "entityId", "rating"],
                "properties": {
                  "entityType": { "type": "string", "enum": ["artist", "album", "track"] },
                  "entityId": { "type": "integer" },
                  "rating": { "type": "integer", "minimum": 1, "maximum": 5 }
                }
              }
            }
          }
        },
        "responses": { "200": { "description": "Rating updated" } }
      }
    },
    "/api/user/interactions": {
      "get": {
        "tags": ["Interaction"],
        "summary": "Get all user interactions",
        "security": [{ "BearerAuth": [] }],
        "responses": { "200": { "description": "List of interactions" } }
      }
    },
    "/api/spotify/login": {
      "get": {
        "tags": ["Spotify"],
        "summary": "Initiate Spotify OAuth",
        "security": [{ "BearerAuth": [] }],
        "responses": { "200": { "description": "Redirect URL" } }
      }
    },
    "/api/admin/metrics": {
      "get": {
        "tags": ["Admin"],
        "summary": "Get dashboard metrics",
        "security": [{ "BearerAuth": [] }],
        "responses": { "200": { "description": "Aggregated metrics" } }
      }
    },
    "/api/admin/artist/config": {
      "put": {
        "tags": ["Admin"],
        "summary": "Update artist persona/theme",
        "security": [{ "BearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["artistId", "personaPrompt"],
                "properties": {
                  "artistId": { "type": "integer" },
                  "personaPrompt": { "type": "string" },
                  "themeConfig": { "type": "object" }
                }
              }
            }
          }
        },
        "responses": { "200": { "description": "Config updated" } }
      }
    },
    "/api/analytics/track": {
      "post": {
        "tags": ["Analytics"],
        "summary": "Track frontend events",
        "requestBody": {
          "required": true,
          "description": "Log behavior for analysis",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["event_type"],
                "properties": {
                  "event_type": { "type": "string" },
                  "value": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": { "200": { "description": "Event tracked" } }
      }
    },
    "/health": {
      "get": {
        "tags": ["System"],
        "summary": "Health Check",
        "responses": {
          "200": {
            "description": "API Gateway is healthy",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": { "type": "string" },
                    "service": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default swaggerSpec;
