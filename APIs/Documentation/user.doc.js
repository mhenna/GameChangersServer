/**
 * @apiDefine UserNotFoundError
 * @apiError UserNotFound The id of the User was not found.
 * @apiErrorExample UserNotFound-Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */
/**
 * @apiDefine UnAuthorized
 * @apiError Unauthorized User is unauthorized to perform this request due to missing/invalid token.
 * @apiErrorExample Invalid-Token-Error
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "name": "UnauthorizedError",
 *       "message": "invalid signature",
 *       "code": "invalid_token",
 *       "status": 401,
 *       "inner": {
 *           "name": "JsonWebTokenError",
 *           "message": "invalid signature"
 *       }
 *   }
 * @apiErrorExample Missing-Token-Error
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "name": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "code": "credentials_required",
 *       "status": 401,
 *       "inner": {
 *           "message": "No authorization token was found"
 *       }
 *   }
 */
/**
 * @apiDefine UnAuthorizedLogin
 * @apiError Unauthorized User is unauthorized to perform login request.
 * @apiErrorExample User-Unauthorized-Error
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "status": "401",
 *       "statustext": "Unauthorized",
 *        "errors": [
 *           {
 *               "messages": [
 *                   "Wrong email or password"
 *               ]
 *           }
 *       ]
 *     }
 */
/**
 * @apiDefine MissingField
 * @apiError MissingField A required field is not in the request body.
 * @apiErrorExample Missing-Field-Error
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "status": 400,
 *       "statustext": "Bad Request",
 *         "errors": [
 *               {
 *                   "field": [
 *                       "Field Name"
 *                   ],
 *                   "location": "body",
 *                   "messages": [
 *                       "\"Field Name\" is required"
 *                   ],
 *                   "types": [
 *                       "any.required"
 *                   ]
 *               }
 *           ]
 *     }
 */
/**
 * @api {post} /users/login Login
 * @apiGroup User
 * @apiParam {String} email  User's email.
 * @apiParam {String} password  User's password.
 * @apiSuccess {Boolean} success Request status.
 * @apiSuccess {String} message Response description.
 * @apiSuccess {String} token User's token.
 * @apiSuccess {Boolean} isJudge User is a Judge?.
 * @apiSuccess {Boolean} isAdmin User is an Admin?.
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "success": true,
 *      "message": "Authentication successfull",
 *      "data" {
 *          "token": "[TOKEN]",
 *          "isJudge": false,
 *          "isAdmin": true
 *      }
 *    }
 * @apiUse UnAuthorizedLogin
 * @apiUse MissingField
 */
/**
 * @api {post} /users/signup Register
 * @apiGroup User
 * @apiParam {String} email  User's email.
 * @apiParam {String} password  User's password.
 * @apiParam {String} passConf  User's password conformation.
 * @apiParam {String} location User's location.
 * @apiParam {Boolean} previousParticipation User has participated before?.
 * @apiParam {String} [region] User's region.
 * @apiParam {String} [brief]  Brief info about User.
 * @apiParam {String} [careerLevel] User's career level.
 * @apiParam {Boolean} [isRemote] User is remote?.
 * @apiParam {Boolean} [genNextMember] User is a gen next memeber?.
 * @apiSuccess {String} status Request http status.
 * @apiSuccess {String} message Response description.
 * @apiSuccess {String} body User's ID.
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "status": "200",
 *      "message": "Success",
 *      "data": "5b4c9fa694ec1f2632c3b6d0"
 *    }
 * @apiUse MissingField
 * @apiErrorExample {json} Uniqness-Error
 *     HTTP/1.1 409 Conflict
 *     {
 *       "status": "409",
 *       "message": "User already exists"
 *     }
 * @apiErrorExample {json} Internal-Server-Error
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "status": "500",
 *       "message": "Internal server error"
 *     }
 */
/**
 * @api {get} /users/user User's info
 * @apiGroup User
 * @apiHeader Authorization Basic Access Authentication token.
 * @apiHeaderExample {String} Authorization
 *  Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJicmllZiI6InRlc3RpbmciLCJ0ZWFtTWVtYmVyIjoiLTEiLCJjcmVhdG9yT2YiOiItMSIsImlzSnVkZ2UiOmZhbHNlLCJpc0FkbWluIjp0cnVlLCJpZGVhc09yZGVy
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *{
    "status": 200,
    "message": "OK",
    "data": {
        "brief": "",
        "teamMember": "-1",
        "creatorOf": "-1",
        "isJudge": true,
        "isAdmin": true,
        "ideasOrder": [
            "1",
            "2",
            "3"
        ],
        "isAuthenticated": false,
        "_id": "5ae0479ace7b7b5b7f6eae7a",
        "name": "Test",
        "email": "h5@dell.com",
        "password": "$2a$10$qDMVFQU6RXfVGaXzSzZPxe.pRWwv8rwzA4tLBsxBDvPDRfOEry.6e",
        "region": "EMEA",
        "isRemote": false,
        "location": "Others",
        "otherLocation": "",
        "position": "Eng",
        "careerLevel": "true",
        "previousParticipation": false,
        "genNextMember": false,
        "__v": 0,
        "resetPasswordExpires": "2018-08-13T10:42:15.184Z",
        "resetPasswordToken": "b7349e0b1317fd40ff0ef6eabc743df61c2a6dc5"
    }
}
 * @apiUse UnAuthorized
 */
/**
 * @api {post} /users/fetch/user Another User's details
 * @apiGroup User
 * @apiHeader Authorization Basic Access Authentication token.
 * @apiHeaderExample {String} Authorization
 *  Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJicmllZiI6InRlc3RpbmciLCJ0ZWFtTWVtYmVyIjoiLTEiLCJjcmVhdG9yT2YiOiItMSIsImlzSnVkZ2UiOmZhbHNlLCJpc0FkbWluIjp0cnVlLCJpZGVhc09yZGVy
 * @apiParam {String} id  required User's id.
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *       "success": true,
 *       "message": "Authentication successfull",
 *       "user": {
 *           "brief": "This user did not add any bio",
 *           "teamMember": "CC-EMEA_14",
 *           "creatorOf": "-1",
 *           "isJudge": false,
 *           "isAdmin": false,
 *           "ideasOrder": [],
 *           "isAuthenticated": false,
 *           "_id": "5ac38ffe7e85396812c708d8",
 *           "name": "Ahmed Osama",
 *           "previousParticipation": true,
 *           "location": "Cairo, Egypt",
 *           "position": "Manager",
 *           "password": "$2a$10$7c3e8ms6YPZYKJ/NW87P2ep2yFB7aB.H56z.N1XlPE8zL2pb8ci5e",
 *           "email": "ahmed.osama@emc.com",
 *           "__v": 0,
 *           "resetPasswordExpires": "2018-04-12T14:03:10.725Z",
 *           "resetPasswordToken": "39902e74315066e820e37067ed6b3a2b17111177"
 *           }
 *       }
 * @apiUse UnAuthorized
 */
/**
 * @api {post} /users/authenticate Authenticate User
 * @apiGroup User
 * @apiParam {String} userId  required User's id.
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "status": "200",
 *      "body": null
 *    }
 */
/**
 * @api {post} /users/forgot-password Forgot Password
 * @apiGroup User
 * @apiParam {String} email  User's email.
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 * {
 *  "status": 200,
 *  "message": "OK",
 *  "data": null
 * }
 * @apiUse MissingField
 */
/**
 * @api {post} /users/reset-password Reset Password
 * @apiGroup User
 * @apiParam {String} newPassword  User's new password.
 * @apiParam {String} verfiyPassword  User's password confirmation.
 *  * @apiParam {String} token  Reset password expiry token.
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      message: "Password reset success"
 *    }
 * @apiUse MissingField
 * @apiErrorExample {json} Password-Mismatch-Error
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "message": "Passwords do not match"
 *     }
 * @apiErrorExample {json} Password-Token-Expired-Error
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "message": "Password reset token is invalid or has expired."
 *     }
 * @apiErrorExample {json} General-Error
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "message": error description
 *     }
 */
