This includes 2 pages wherein, 1st page is of your project and the 2nd page is for SQL & Theory based questions, Do, go through both the pages carefully

Here starts your project
Project Overview
IDE
Any IDE, preferably VS Code.

Deployment
Code deployment on GitHub and project deployment on Railway

Problem Statment
Build a Profile page for the registered users using nodejs.
The project should have 3 pages i.e., -- the Registration page, Login page and Dashboard. -- You can use EJS templates or HTML forms for the client part. -- For reference of the Register Page: https://github.com/KaranSingh1301/lecture-6/blob/main/views/register.ejs -- For reference of the Login page: https://github.com/KaranSingh1301/lecture-6/blob/main/views/login.ejs
Add an authentication system using a session based.
Add email verification using token-based (JWT).
You need to perform all the CRUD operations using REST API and MongoDB.
Build the profile page.


=> Registration Page. (25 marks)

Should render registration form on ‘{url} / registration’. ( 5 marks)
Registration form should include the following:- (5 marks)
-- Name -- Username (Unique) -- Email (Unique) -- Phone number -- Password (hashed it using bcrypt)
Do email authentication using JWT. 10
After all, success redirects the user to the login page. (5 marks)


=> Login Page. (35 marks)

Should render login form on ‘{url} / login’. (5 marks)
The login form should include the following:- (5 marks) -- Username or email -- Password -- Forget password option -- Resend the verification link
Add session-based authentication once the user is logged in. (10 marks)
Add the forget password functionality by sending a link to a verified mail id. (5 marks)
Provide the functionality to resend the verification mail. (5 marks)
After successfully logging in, redirect the user to the profile page. (5 marks)


=> Profile Page (40 marks)

Should render login form on ‘{url} / profile’. (5 marks)
Needs to show the following things on the dashboard page: (5 marks) -- Name -- Username -- Email -- Phone number -- State -- Country -- Collage name for graduation -- Profile photo -- Change password option
The profile page should already have the data like name, username, email, and phone number which were stored during the registration. (5 marks)
Provide the functionality to the user to add information to the rest of the fields like state, country, college name for graduation, profile photo and change password and store that in DB. (5 marks)
Add the functionality where the user can upload a profile picture. (10 marks)
Optimized the DB call using rate-limiting for 2 hits / 1 second (500ms) for the fields present on the dashboard page. (10 marks)
Go through this link for the reference: https://www.figma.com/proto/kvpmMk1ge8M8g2BTzRdljO/Profile-Edit-(Community)?node-id=102%3A151&scaling=min-zoom&page-id=0%3A1

Submission
Deploy your project and submit the deployed link and github repo here: Submit Project
