// Compiles lessons from MARP format to HTML + CSS format, and saves them into a folder. Then, it serves the HTML files to the user.
import {Marp} from '@marp-team/marp-core'
import * as fs from 'fs'
import * as path from 'path'

// __dirname polyfill
const __dirname = path.resolve()

// Load lessons from lessons folder
let lessons = fs.readdirSync('lessons')
let marp = new Marp({minifyCSS: true, html: true})
// For each lesson, convert Markdown slide deck into HTML and CSS
for (let lesson of lessons) {
	// Add custom CSS from themes/darcula.css to theme-set
	let darcula = fs.readFileSync(path.join('themes', 'darcula.css'), 'utf8')
	marp.themeSet.add({
		darcula: {
			css: darcula
		}
	})
	let {html, marpCSS} = marp.render(fs.readFileSync(path.join('lessons', lesson), 'utf8'))
	// Convert HTML to HTML with CSS
	let htmlify = (marpHTML, marpCSS) => {
		let html = marpHTML
		let head = `<head><style>${marpCSS}</style></head>`;
		let body = `<body>${html}</body>`;
		return `<html>${head}${body}</html>`;
	}
	fs.writeFileSync(path.join('html', lesson.replace('.md', '.html')), htmlify(html, marpCSS));
	console.log("Compiled " + lesson)
}

// Load data from data.json
let data = JSON.parse(fs.readFileSync('data.json', 'utf8'))

// Serve HTML files with express
import express from 'express'
import ejs from 'ejs'
const app = express()
app.set('view engine', 'ejs')
// Where are views?
app.set('views', 'views')
// Route /

app.get('/', (req, res) => {
	// Get list of lessons
	return res.render('index', {lessons: data.lessons, lesson: data.lessons[data.lessons.length - 1]})
});

// Route /lesson
app.get('/lessons/:ID', (req, res) => {
	// Serve lesson from ID
	let id = req.params.ID
	return res.sendFile(path.join(__dirname, 'html', id))
});

// Start server
app.listen(3016, () => {
	// weird port but cloudflared moment (i forgot which other ports were in use)
	console.log('Server started on port 3016')
})