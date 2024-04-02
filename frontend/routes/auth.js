const express = require('express');
const path = require('path')
const router = express.Router();

const { signInWithEmailAndPassword } = require('firebase/auth');
const { httpsCallable } = require("firebase/functions");
const { firebaseAuth, auth, functions } = require(path.join(__dirname, '..', 'common', 'fire'))

// Routes
router.get("/", (_, res) => {
  const auth = firebaseAuth.getAuth();
  const user = auth.currentUser;
  if (user !== null) {
    res.render('base', {
      displayName: user.uid,
    });
  } else {
    res.render('signup')
  }
});

// Routes
router.get("/test", (_, res) => {
  res.render('base', {
    displayName: "test"
  });
});


router.post("/", (req, res) => {
  // add teacher
  const { teacher, classroom } = req.body;
  console.log(teacher, classroom);
  var addClassroom = httpsCallable(functions, 'addClassroom')
  addClassroom({
    classCode: classroom,
    teacherName: teacher
  }).then((result) => {
    console.log(result.data);
    res.redirect('/')
  }).catch((error) => {
    console.log("error", error);
    console.log("code", error.code);
    console.log("message", error.message);
    console.log("details", error.details);
  })


  // add student
  const { studentName, classroomCode } = req.body;
  var addStudent = httpsCallable(functions, 'addStudent')
  addStudent({
    studentName: studentName,
    classroomCode: classroomCode
  }).then((result) => {
    console.log(result.data);
    res.redirect('/')
  }).catch((error) => {
    console.log("error", error);
    console.log("code", error.code);
    console.log("message", error.message);
    console.log("details", error.details);
  })
});


router.get('/signup', (req, res) => {
  res.render('signup');
})

router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  console.log(username, password);

  const setRole = httpsCallable(functions, 'setRole')
  const addUserAfterCreation = httpsCallable(functions, 'addUserAfterCreation')
  firebaseAuth.createUserWithEmailAndPassword(auth, username, password)
    .then(async (userCred) => {
      uid = userCred.user.uid;
      await addUserAfterCreation({ email: username, uid });
      await setRole({ uid, role });
      res.redirect('/');
    })
    .catch((error) => {
      console.log(error.code);
      console.log(error.message);
      res.redirect('/signup');
    })
})

router.get('/login', (_, res) => {
  res.render('login');
})


router.post('/login', (req, res) => {
  const { username, password } = req.body;

  signInWithEmailAndPassword(auth, username, password).then((userCredential) => {
    const user = userCredential.user;
    console.log("Logged in as", user);
    res.redirect("/");
  })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.redirect('/login');
    })
});
module.exports = router;
