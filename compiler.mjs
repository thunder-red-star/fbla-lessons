// Compiles lessons from MARP format to HTML + CSS format, and saves them into a folder. Then, it serves the HTML files to the user.
import {Marp} from '@marp-team/marp-core'
import * as fs from 'fs'
import * as path from 'path'
import {spawn} from 'child_process'

// __dirname polyfill
const __dirname = path.resolve()

// Load lessons from lessons folder
let lessons = fs.readdirSync('lessons')

// For each lesson, convert Markdown slide deck into HTML and CSS
for (let lesson of lessons) {
	console.log(`Compiling ${lesson}...`)
	// Use the MARP CLI to convert the Markdown file into HTML and CSS. We are using the CLI because we want to use custom themes. Our custom theme is in themes/dracula.css.
	let command = `marp --engine @marp-team/marp-core --theme ./themes/gradient.css --html --css --allow-local-files --output ./html/${lesson.replace('.md', '.html')} ./lessons/${lesson}`
	console.log(command);
	// Run command asynchronously
	(async () => {
		spawn(command, {shell: true, stdio: 'inherit'})
	})();
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

app.get('/error', (req, res) => {
	// Test error
	throw new Error('Test error oops')
});

// 404 catch-all
app.get('*', (req, res) => {
	return res.render('404')
});

// 500 catch-all
app.use((err, req, res, next) => {
	console.error(err.stack)
	return res.render('500', {error: err.stack})
});

// Start server
app.listen(3016, () => {
	// weird port but cloudflared moment (i forgot which other ports were in use)
	console.log('Server started on port 3016')
})
