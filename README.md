# Blue Ivory - 3.0

## CI Information
### Build Status
[![build status](https://gitlab.com/BlueIvory/blue-ivory-server/badges/master/build.svg)](https://gitlab.com/BlueIvory/blue-ivory-server/commits/master)

[![coverage report](https://gitlab.com/BlueIvory/blue-ivory-server/badges/master/coverage.svg)](https://gitlab.com/BlueIvory/blue-ivory-server/commits/master)

## API Endpoints
### 1. User
| Method 	| Endpoint          	            | Description                    	| Required Permissions  	| Example           	|
|--------	|--------------------------------	|--------------------------------	|-----------------------	|-------------------	|
| GET    	| /api/user         	            | Returns all users (allow search and pagination)             	| EDIT_USER_PERMISSIONS 	| /api/user         	|
| GET    	| /api/user/current 	            | Returns the current user       	| Login required        	| /api/user/current 	|
| GET    	| /api/user/:id                 	| Return specific user if exists 	| EDIT_USER_PERMISSIONS 	| /api/user/5487754 	|
| PUT    	| /api/user/:id/permissions     	| Set user's permission          	| EDIT_USER_PERMISSIONS 	| /api/user/5487754/permissions 	|
| PUT    	| /api/user/:id/organization       	| Change user's organization     	| EDIT_USER_PERMISSIONS 	| /api/user/5487754/organization 	|

### 2. Visitor
| Method 	| Endpoint          	            | Description                    	| Required Permissions  	| Example           	|
|--------	|--------------------------------	|--------------------------------	|-----------------------	|-------------------	|
| GET    	| /api/visitor/:id         	            | Returns visitor by id              	| Login required 	| /api/visitor/145263   |

### 3. Organization
| Method 	| Endpoint          	            | Description                    	| Required Permissions  	| Example           	|
|--------	|--------------------------------	|--------------------------------	|-----------------------	|-------------------	|
| GET    	| /api/organization         	            | Returns all organizations (allow search and pagination)              	| Login required 	| /api/organization        	|
| GET    	| /api/organization/:id/workflow         	            | Returns organization's workflow if exists        	| EDIT_WORKFLOW 	| /api/organization/58e2a2529fb645b158294f91/workflow        	|
| POST    	| /api/organization/:id/workflow         	            | Sets organization's workflow and return updated organization        	| EDIT_WORKFLOW 	| /api/organization/58e2a2529fb645b158294f91/workflow        	|
| POST    	| /api/organization         	            | Create new organization        	| EDIT_WORKFLOW (Should change to Admin) 	| /api/organization        	|