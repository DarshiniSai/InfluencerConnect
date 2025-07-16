# Social Media Influencer Platform(Influencer Connect)
## About the Project

This is a simple web app that helps brands and influencers connect.

* Influencers can show their profile, social media handles, and followers.
* Brands can search for influencers and send them campaign invites.

---

## Features
* Influencer sign-up and profile creation
* Image upload support (base64)
* View influencer list (with segments, audiences, social media handles)
* Brand sign-up, login and ability to invite influencers
* Campaign invites and tracking

---
## Tech Stack

* HTML, CSS, JavaScript
* Node JS with Express(backend)
Database: MySQL

---

## How to Run the Project??

1. Download the files.
2. Open terminal in the project folder.
3. npm install(Delete node modules folder if it exists)
4. Create MySQL database (Name: influencerDB)
5.  Configure database connection:
      edit db.js with your database credentials.
6. Start the server:
      node server.js

---

## File Structure

* 'landing.html' – Landing page of this porject
* 'login.html' - login or signup page
* 'influencerDb.html' – Landing page for influencers after login
* 'BrandDb.html' – Landing page for brands after login
* 'influencer-profile.html' – Page for editing influencer details
* 'influencer.html' – Landing page for brands after login
* 'brand-campaigns.html' – Shows invites sent by brand

---

## DataBase Schema

There are three tables in this database schema:
1. **users** - Stores the data of the users(influencer /brand)
2. **platforms** - Stores social media info linked to influencers
3. **campaigns** - Stores campaign invites sent by brands to influencers


CREATE TABLE users (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  role ENUM('influencer', 'brand') NOT NULL,
  name VARCHAR(100),
  brandName VARCHAR(100),
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  website VARCHAR(255),
  segment VARCHAR(100),
  audience TEXT,
  image TEXT, -- Can store base64 string or image URL
  resetToken VARCHAR(255)
);


CREATE TABLE platforms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  platform VARCHAR(50) NOT NULL,
  handle VARCHAR(100) NOT NULL,
  followers INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE campaigns (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  brandEmail VARCHAR(100),
  influencerEmail VARCHAR(100),
  influencerName VARCHAR(100),
  date DATETIME,
  status ENUM('Pending', 'Accepted', 'Declined') DEFAULT 'Pending',
  message TEXT
);