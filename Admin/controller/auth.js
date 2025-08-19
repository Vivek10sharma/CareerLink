const Admin = require('../models/Admin');
const Job = require('../models/Job');
const moment = require('moment');
const Application = require('../models/Application');
const Candidate = require('../models/Candidate');
const Recruiter = require('../models/Recruiter');
const mongoose = require('mongoose');



const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.isAdmin = true;
    req.session.adminId = admin._id;

    return res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};


const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.status(200).json({ message: 'Logged out' });
  });
};



const dashboard =  async (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect('/login');
  }

  try {
    const totalCandidates = await Candidate.countDocuments();
    const totalRecruiters = await Recruiter.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const approvedApplications = await Application.countDocuments({ status: 'accepted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });

    // Find max to scale bar widths:
    const maxValue = Math.max(
      totalCandidates,
      totalRecruiters,
      totalJobs,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      1 // avoid division by zero
    );

    const scale = (val) => (val / maxValue) * 100;

    const latestJobs = await Job.find().sort({ createdAt: -1 }).limit(5);
const latestApplications = await Application.find()
  .populate('job')
  .populate('candidate')
  .sort({ createdAt: -1 })
  .limit(5);

    res.render('dashboard', {
      totalCandidates,
      totalRecruiters,
      totalJobs,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalCandidatesPct: scale(totalCandidates),
      totalRecruitersPct: scale(totalRecruiters),
      totalJobsPct: scale(totalJobs),
      totalApplicationsPct: scale(totalApplications),
      pendingApplicationsPct: scale(pendingApplications),
      approvedApplicationsPct: scale(approvedApplications),
      rejectedApplicationsPct: scale(rejectedApplications),
      latestJobs,
      latestApplications,
      moment
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

const MangedRecruiter = async (req,res) =>{
    try {
    if (!req.session.isAdmin) {
      return res.redirect('/login');
    }

    const recruiters = await Recruiter.find();

    res.render('recruiter', {
      recruiters
    });
  } catch (error) {
    console.error('Error loading recruiters:', error);
    res.status(500).send('Internal Server Error');
  }
}

const ManageCandidates = async (req, res) => {
     try {
    if (!req.session.isAdmin) {
      return res.redirect('/login');
    }
    const candidates = await Candidate.find();
    res.render('candidates', { candidates });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while fetching candidates');
  }
};

const ManageJobs = async (req, res) => {
  try {
    if (!req.session.isAdmin) {
      return res.redirect('/login');
    }
    const jobs = await Job.find().populate('recruiterId'); 
    res.render('jobs', { jobs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while fetching jobs');
  }
};

const ManageApplications = async (req, res) => {
 try {
    if (!req.session.isAdmin) {
      return res.redirect('/login');
    }
    const applications = await Application.find()
  .populate({
    path: 'job',
    populate: { path: 'recruiterId', model: 'Recruiter' }
  })
  .populate('candidate')
  .sort({ createdAt: -1 });


    res.render('applications', { applications });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const deleteRecruiterByAdmin = async (req, res) => {
  const recruiterId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(recruiterId)) {
    return res.status(400).json({ error: 'Invalid recruiter ID' });
  }

  try {
    const deletedRecruiter = await Recruiter.findByIdAndDelete(recruiterId);
    if (!deletedRecruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }

    const jobs = await Job.find({ recruiterId });
    const jobIds = jobs.map(job => job._id);

    await Job.deleteMany({ recruiterId });
    await Application.deleteMany({ job: { $in: jobIds } });

    // Send JSON success response for fetch
    return res.status(200).json({ message: 'Recruiter deleted successfully' });
  } catch (err) {
    console.error('Error deleting recruiter:', err);
    return res.status(500).json({ error: 'Server error while deleting recruiter' });
  }
};


const deleteCandidateByAdmin = async (req, res) => {
  const candidateId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.status(400).json({ error: 'Invalid candidate ID' });
  }

  try {
    const deletedCandidate = await Candidate.findByIdAndDelete(candidateId);
    if (!deletedCandidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // If you have related data to delete, do here (e.g., applications by candidate)
    await Application.deleteMany({ candidate: candidateId });

    return res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    console.error('Error deleting candidate:', err);
    return res.status(500).json({ error: 'Server error while deleting candidate' });
  }
};

const deleteJobByAdmin = async (req, res) => {
  const jobId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ error: 'Invalid job ID' });
  }

  try {
    // Delete the job
    const deletedJob = await Job.findByIdAndDelete(jobId);
    if (!deletedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Delete all applications related to this job
    await Application.deleteMany({ job: jobId });

    return res.status(200).json({ message: 'Job and related applications deleted successfully' });
  } catch (err) {
    console.error('Error deleting job:', err);
    return res.status(500).json({ error: 'Server error while deleting job' });
  }
};

const deleteApplicationByAdmin = async (req, res) => {
  const applicationId = req.params.id;
  console.log('Delete application request for ID:', applicationId);

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    console.log('Invalid application ID');
    return res.status(400).send('Invalid application ID');
  }

  try {
    const deletedApplication = await Application.findByIdAndDelete(applicationId);
    if (!deletedApplication) {
      console.log('Application not found');
      return res.status(404).send('Application not found');
    }

    console.log('Deleted application:', deletedApplication);
    return res.status(200).send('Application deleted successfully');
  } catch (err) {
    console.error('Error deleting application:', err);
    return res.status(500).send('Server error while deleting application');
  }
};

module.exports = { login, logout , dashboard, MangedRecruiter, ManageCandidates , ManageJobs, ManageApplications , deleteRecruiterByAdmin , deleteCandidateByAdmin , deleteJobByAdmin , deleteApplicationByAdmin};
