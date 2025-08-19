const express = require('express');
const router = express.Router();
const { login, logout, dashboard, MangedRecruiter, ManageCandidates, ManageJobs, ManageApplications, deleteRecruiterByAdmin, deleteCandidateByAdmin, deleteJobByAdmin, deleteApplicationByAdmin } = require('../controller/auth');

router.get('/',(req,res)=>{
  res.redirect('/login'); 
})
router.get('/login', (req, res) => {
  res.render('Login',{
  title: 'Login',
  hideHeader: true
}); 
});


router.post('/login', login);

router.post('/logout', logout);

router.get('/logout', (req, res) => {
  res.redirect('/dashboard'); 
});


router.get('/dashboard', dashboard);

router.get('/recruiter', MangedRecruiter);

router.get('/candidate', ManageCandidates);

router.get('/jobs', ManageJobs);

router.get('/applications', ManageApplications);
router.get('/recruiters/delete/:id', deleteRecruiterByAdmin);
router.delete('/candidates/delete/:id', deleteCandidateByAdmin);
router.delete('/jobs/delete/:id', deleteJobByAdmin);
router.delete('/applications/delete/:id', deleteApplicationByAdmin);


module.exports = router;
