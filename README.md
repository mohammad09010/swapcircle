# SwapCircle (Book & Record Swap)

**Module:** Software Engineering (CMP-N204-0)  
**Team name:** SwapCircle  
**Team members:** 

- **Mohammad Betab Alam**  (Repo + Project setup lead)
- **Sagar Kumar Sharma**  (Docker/Dev environment lead)
- **Nitesh Shah**  (Backend scaffold lead) 
- **Arjun Mahato**  (Documentation lead) 

---

## Project Description

SwapCircle is a community-driven web app that empowers book and vinyl record lovers to exchange their possessions for mutual benefits, and completely without money changing hands. Anyone can put up the stuff they want to swap, check out what's on offer and make a swap request in a safe and respectful environment.
The initiative is in tandem with the module theme **Sharing, Exchange, and Building Community** by promoting people to adopt more sustainable lifestyles and by forming connections between people with similar interests.

---

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, PUG (templating engine)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **DevOps**: Docker, Git, GitHub Actions (in later sprints)
- **Project Management**: GitHub Projects (Kanban)

---

## Features

### Current Features (Sprint 1)

- **Basic Setup**: Express.js app with PUG templating engine.
- **MySQL Database**: Dockerized MySQL with initial schema and seed data.
- **Home Page**: Lists recently added items for swap (books and records).
- **Health Check**: Simple endpoint to check the status of the database connection.

---

## How to Run the Application (Using Docker)

### Prerequisites
- **Docker Desktop** installed (for both Windows and macOS).

### Setup Instructions

#### Clone this repository:
 ```bash
   git clone https://github.com/mohammad09010/swapcircle.git
   cd swapcircle
```

##### Copy the environment example file to create .env:
```bash
cp .env.example .env
```

---

##### Build and run the containers using Docker Compose:
```bash
docker compose up --build
```

---

#### Open browser and visit:
- Open: http://localhost: Port NO:
- You should see the page.

---

##### To stop the application and containers:
```bash
docker compose down
```

---

## Folder Structure

```text
swapcircle/
  src/
    app.js                  
    db.js                   
    routes/
      index.js           
      health.js             
  views/
    layout.pug              
    index.pug               
  public/
    css/
      style.css            
  mysql/
    init/
      001_schema.sql       
      002_seed.sql         
  docs/
    meeting-notes/
      2026-02-09-kickoff.md 
      TEMPLATE-standup.md   
  .dockerignore             
  .env.example            
  .gitignore                  
  docker-compose.yml        
  Dockerfile                
  package.json            
  README.md                 
```

---

## Contact
For questions or suggestions, please feel free to contact the team members:

- Betab: `thesagarsharma27@gmail.com`
- Nitesh: `shahnitesh600@gmail.com`
- Sagar: `sagar@example.com`
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









































