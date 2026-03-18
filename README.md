# SwapCircle (Book & Record Swap)

**Module:** Software Engineering (CMP-N204-0)  
**Team name:** SwapCircle  
**Team members:** 

- **Mohammad Betab Alam**  (Repo + Project setup lead) **ID: A00031761** 
- **Sagar Kumar Sharma**  (Docker/Dev environment lead) **ID: A00032573** 
- **Nitesh Shah**  (Backend scaffold lead) **ID: A00023399** 
- **Arjun Mahato**  (Documentation lead) **ID: A00031649** 

---

## Project Description

SwapCircle is a community-driven web app that empowers book and vinyl record lovers to exchange their possessions for mutual benefits, and completely without money changing hands. Anyone can put up the stuff they want to swap, check out what's on offer and make a swap request in a safe and respectful environment.
The initiative is in tandem with the module theme **Sharing, Exchange, and Building Community** by promoting people to adopt more sustainable lifestyles and by forming connections between people with similar interests.

---

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, PUG (templating engine)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **DevOps**: Docker, Git, GitHub Actions
- **Project Management**: GitHub Projects (Kanban)

---

## Features

### Current Features

- Basic Setup: Express.js application using PUG templating engine and reusable layout system.
- Dockerized Development Environment: Docker Compose configuration for the Node.js web app and MySQL database to enable consistent team working & demonstration.
- MySQL Database: Dockerized MySQL database setup including schema creation scripts, seed data files and relational model for users, items, tags, and item-tag mapping.
- Home Page: Dynamic home page with hero section, latest items, platform statistics, safety messaging, and quick navigation links.
- Health Check: Basic endpoint to check the health status of the application and the database connection.
- Items Listing Page: Marketplace page displaying all books and records available with search feature, type filters, and sorting options.
= Item Detail Page: Full item description along with metadata, owner details, tags, condition, location, image gallery, and safety tips.
- Tags / Categories Page: Graphical categories page for browsing items by tag or genre.
- Items by Tag Page: Filtered listing page displaying all items associated with a chosen category.
- Users Directory: Community member listing page with users, badges, joined information, and public-safe profile summaries.
- User Profile Page: Member profile detail page including bio, stats, avatar, and items listed by that user.
- Image Asset Support: Organised system of uploads for item covers, user avatars, category images, and site-wide images.
- Fallback Placeholders: Default dummy images for missing items, avatar, category, and site assets.
- Custom 404 Page: Themed not-found page with navigation links to key areas of the app.
- Dark Mode Toggle: Switches the theme from dark mode to light mode and vice versa.
- Responsive UI: Component layout and styling suited for both desktop and smaller screen sizes.
- Privacy and Safety Messaging: Displaying anti-spam email methods and on-screen safety reminders for foster swapping responsibly.

---

## How to Run the Application (Using Docker)

### Prerequisites
- **Docker Desktop** installed for both Windows and macOS.

### Setup Instructions

#### Clone this repository:
 ```bash
git clone https://github.com/mohammad09010/swapcircle.git
```

```bash
cd swapcircle
```

##### Copy the environment example file to create .env:
```bash
copy .env.example .env
```

---

##### Build and run the containers using Docker Compose:
```bash
docker compose down -v
```

```bash
docker compose up --build
```

---

#### Open browser and visit:
- Open: http://localhost:3000

---

##### To stop the application and containers:
```bash
docker compose down
```

---

## Contact
For questions or suggestions, please feel free to contact the team members:

- Betab: `almmohammad291@gmail.com`
- Nitesh: `shahnitesh600@gmail.com`
- Sagar: `thesagarsharma27@gmail.com`
- Arjun: `arjunmahato14333@gmail.com`

---

### How to Add This to Your GitHub Repository:

1. Open your GitHub repository for the **SwapCircle** project.
2. In the root directory, create a new file named `README.md`.
3. Copy the above content and paste it into the new `README.md` file.
4. Commit the changes:
   - Add the file to the staging area:
     ```bash
     git add README.md
     ```
     
   - Commit the file:  
     ```bash
     git commit -m "Added README.md"
     ```
     
   - Push the commit to GitHub:
     ```bash
     git push origin main
     ```

---













































