var express = require('express');
var router = express.Router();
const auth_controller = require("../controllers/authController");

router.get('/login', auth_controller.login_get);
router.post('/login', auth_controller.login_post);
router.get('/signup', auth_controller.signup_get);
router.post('/signup', auth_controller.signup_post);
router.get('/logout', auth_controller.logout_get);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express2' });
});

module.exports = router;
