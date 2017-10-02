const express = require('express');
const router = express.Router();

router.get('/:templatename', (req, res) => {
  res.render('templates/' + req.params.templatename);
});

module.exports = router;
