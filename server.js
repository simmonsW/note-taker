const express = require('express');
const fs = require('fs');
const path = require('path');

const { notes } = require('./db/db.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('public'));
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());

// FUNCTIONS

function filterByQuery(query, notesArray) {
  let filteredResults = notesArray;
  if (query.title) {
    filteredResults = filteredResults.filter(note => note.title === query.title);
  }
  return filteredResults;
};

function createNewNote(body, notesArray) {
  const note = body;
  notesArray.push(note);
  fs.writeFileSync(
    path.join(__dirname, './db/db.json'),
    JSON.stringify({ notes: notesArray }, null, 2)
  );

  return note;
};

function findById(id, notesArray) {
  const result = notesArray.filter(note => note.id === id)[0];
  return result;
}

function deleteNote(id, notesArray) {
  const selected = findById(id, notesArray);

  if (selected) {
    let index = notesArray.indexOf(notesArray[id]);
    // delete notesArray[id];
    notesArray.splice(index, 1);
    fs.writeFileSync(
      path.join(__dirname, './db/db.json'),
      JSON.stringify({ notes: notesArray }, null, 2)
    );
  } else {
    console.log('no note with this id exists');
  }
};

// API ROUTES

app.get('/api/notes', (req, res) => {
  let results = notes;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});

app.get('/api/notes/:id', (req, res) => {
  const result = findById(req.params.id, notes);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});

app.post('/api/notes', (req, res) => {
  // expects "title" and "text"
  let id = Math.floor(Math.random() * 1000);
  // req.body.id = notes.length.toString();
  req.body.id = id.toString();

  const note = createNewNote(req.body, notes);
  res.json(note);
});

app.delete('/api/notes/:id', (req, res) => {
  deleteNote(req.params.id, notes);
  console.log('Note has been deleted');
  res.send(true);
});

// HTML ROUTES

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}`);
});