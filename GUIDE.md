# Portfolio Maintenance Guide

This guide explains how to manage and update the content on your portfolio website.

## 🚀 The Easy Way: Using the Admin Dashboard

I have built a custom Admin Dashboard to make adding content simple.

1.  **Open the Dashboard**: Go to [http://localhost:3000/admin.html](http://localhost:3000/admin.html) in your browser.
2.  **Select Content Type**: Choose whether you are adding a **Project** or a **Certification**.
3.  **Fill in the Form**:
    *   **Title**: Name of your project or course.
    *   **Category**: Grouping (e.g., "Machine Learning", "Hackathons").
    *   **Tags**: Technologies used (e.g., "Python, React" - for projects).
    *   **Description**: A brief summary of what you did.
    *   **Link**: URL to the GitHub repo or credential verification.
    *   **Image**: Upload a cover image (landscape works best).
4.  **Click Upload**: The system will save your data and image.

**That's it!** The new item will automatically appear at the bottom of the "Projects" or "Certifications" page.

---

## 🛠 The Developer Way: Manual Editing

If you prefer to edit the code directly or modify existing items:

### Projects
Existing projects are hardcoded in `public/Projects Portfolio Page.html`. 
To edit them, search for `<article class="project-item ...">` and modify the text inside.

### Certifications
Existing certifications are in `public/Certifications & Achievements Page.html`.
Search for `<!-- Content: ... -->` to find the relevant sections.

### Blog Posts
Blog posts are currently static in `public/blog.html`.
To add a new post, copy the entire `<article>` block of an existing post and update the content.

---

## 🎨 Advanced: Customizing Animations
The animations are controlled by:
*   `public/css/animations.css` (CSS keyframes)
*   `public/js/interactions.js` (JavaScript effects like typing and tilt)

## 📁 File Structure
*   `public/uploads/`: Where your uploaded images live.
*   `public/data/`: JSON files storing the new content you add via the Admin Dashboard.
*   `server.js`: The backend logic handling the uploads.
