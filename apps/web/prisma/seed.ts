import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.department.createMany({
    data: [
      { id: 'dept-1', name: 'CSE', fullName: 'Computer Science & Engineering', studentCount: 240, competitionCount: 18 },
      { id: 'dept-2', name: 'AIDS', fullName: 'Artificial Intelligence & Data Science', studentCount: 180, competitionCount: 14 },
      { id: 'dept-3', name: 'IT', fullName: 'Information Technology', studentCount: 160, competitionCount: 12 },
      { id: 'dept-4', name: 'ECE', fullName: 'Electronics & Communication Engineering', studentCount: 200, competitionCount: 15 },
      { id: 'dept-5', name: 'EEE', fullName: 'Electrical & Electronics Engineering', studentCount: 140, competitionCount: 10 },
      { id: 'dept-6', name: 'MECH', fullName: 'Mechanical Engineering', studentCount: 120, competitionCount: 8 },
      { id: 'dept-7', name: 'CIVIL', fullName: 'Civil Engineering', studentCount: 90, competitionCount: 6 },
      { id: 'dept-8', name: 'CSBS', fullName: 'Computer Science & Business Systems', studentCount: 60, competitionCount: 5 },
    ],
  })

  await prisma.student.createMany({
    data: [
      { id: 'stu-1', name: 'Jeevan R', email: 'jeevan.r@citchennai.net', department: 'CSE', year: '3rd Year', section: 'A', registeredCompetitions: 8, verifiedCompetitions: 6, createdAt: '2024-06-15T10:30:00Z' },
      { id: 'stu-2', name: 'Kavin Raj', email: 'kavin.r@citchennai.net', department: 'AIDS', year: '3rd Year', section: 'B', registeredCompetitions: 5, verifiedCompetitions: 4, createdAt: '2024-06-20T09:15:00Z' },
      { id: 'stu-3', name: 'Harini S', email: 'harini.s@citchennai.net', department: 'IT', year: '2nd Year', section: 'A', registeredCompetitions: 3, verifiedCompetitions: 3, createdAt: '2024-07-01T14:00:00Z' },
      { id: 'stu-4', name: 'Yuvanaj G', email: 'yuvanaj.g@citchennai.net', department: 'CSE', year: '4th Year', section: 'A', registeredCompetitions: 12, verifiedCompetitions: 10, createdAt: '2023-08-10T08:00:00Z' },
      { id: 'stu-5', name: 'Pranav M', email: 'pranav.m@citchennai.net', department: 'CSE', year: '3rd Year', section: 'C', registeredCompetitions: 6, verifiedCompetitions: 5, createdAt: '2024-06-18T11:45:00Z' },
      { id: 'stu-6', name: 'Divya K', email: 'divya.k@citchennai.net', department: 'ECE', year: '3rd Year', section: 'A', registeredCompetitions: 7, verifiedCompetitions: 6, createdAt: '2024-06-22T13:30:00Z' },
      { id: 'stu-7', name: 'Santhosh M', email: 'santhosh.m@citchennai.net', department: 'MECH', year: '4th Year', section: 'B', registeredCompetitions: 4, verifiedCompetitions: 3, createdAt: '2023-09-05T10:00:00Z' },
      { id: 'stu-8', name: 'Lakshmi P', email: 'lakshmi.p@citchennai.net', department: 'EEE', year: '2nd Year', section: 'A', registeredCompetitions: 2, verifiedCompetitions: 2, createdAt: '2024-07-10T15:20:00Z' },
      { id: 'stu-9', name: 'Arun Kumar S', email: 'arunkumar.s@citchennai.net', department: 'IT', year: '4th Year', section: 'B', registeredCompetitions: 9, verifiedCompetitions: 8, createdAt: '2023-08-20T09:30:00Z' },
      { id: 'stu-10', name: 'Meena R', email: 'meena.r@citchennai.net', department: 'AIDS', year: '2nd Year', section: 'A', registeredCompetitions: 4, verifiedCompetitions: 3, createdAt: '2024-07-05T12:00:00Z' },
      { id: 'stu-11', name: 'Vignesh K', email: 'vignesh.k@citchennai.net', department: 'CSE', year: '2nd Year', section: 'B', registeredCompetitions: 5, verifiedCompetitions: 4, createdAt: '2024-07-08T10:30:00Z' },
      { id: 'stu-12', name: 'Anitha R', email: 'anitha.r@citchennai.net', department: 'ECE', year: '4th Year', section: 'B', registeredCompetitions: 6, verifiedCompetitions: 5, createdAt: '2023-08-15T14:00:00Z' },
      { id: 'stu-13', name: 'Bharath M', email: 'bharath.m@citchennai.net', department: 'CIVIL', year: '3rd Year', section: 'A', registeredCompetitions: 3, verifiedCompetitions: 2, createdAt: '2024-06-25T11:00:00Z' },
      { id: 'stu-14', name: 'Deepika S', email: 'deepika.s@citchennai.net', department: 'CSBS', year: '2nd Year', section: 'A', registeredCompetitions: 4, verifiedCompetitions: 3, createdAt: '2024-07-12T09:45:00Z' },
      { id: 'stu-15', name: 'Gokul R', email: 'gokul.r@citchennai.net', department: 'MECH', year: '3rd Year', section: 'A', registeredCompetitions: 5, verifiedCompetitions: 4, createdAt: '2024-06-28T16:30:00Z' },
    ],
  })

  await prisma.advisor.createMany({
    data: [
      { id: 'adv-1', name: 'Dr. Priya Sharma', email: 'priya.sharma@citchennai.net', department: 'CSE', assignedSections: JSON.stringify(['3A', '3B', '3C']), pendingVerifications: 4, createdAt: '2023-06-01T09:00:00Z' },
      { id: 'adv-2', name: 'Mr. Arun Kumar', email: 'arun.kumar@citchennai.net', department: 'IT', assignedSections: JSON.stringify(['2A', '2B']), pendingVerifications: 2, createdAt: '2023-06-01T09:00:00Z' },
      { id: 'adv-3', name: 'Dr. Meena Raj', email: 'meena.raj@citchennai.net', department: 'AIDS', assignedSections: JSON.stringify(['4A', '4B']), pendingVerifications: 7, createdAt: '2023-06-01T09:00:00Z' },
      { id: 'adv-4', name: 'Dr. Suresh Kumar', email: 'suresh.kumar@citchennai.net', department: 'ECE', assignedSections: JSON.stringify(['3A', '3B']), pendingVerifications: 3, createdAt: '2023-06-01T09:00:00Z' },
      { id: 'adv-5', name: 'Mrs. Kavitha R', email: 'kavitha.r@citchennai.net', department: 'EEE', assignedSections: JSON.stringify(['2A', '2B', '3A']), pendingVerifications: 5, createdAt: '2023-06-01T09:00:00Z' },
      { id: 'adv-6', name: 'Dr. Venkatesh M', email: 'venkatesh.m@citchennai.net', department: 'MECH', assignedSections: JSON.stringify(['4A', '4B']), pendingVerifications: 1, createdAt: '2023-06-01T09:00:00Z' },
    ],
  })

  const competitions = [
    { id: 'comp-1', title: 'HackFusion 2025', description: 'A 24-hour national-level hackathon where teams build innovative solutions for real-world problems.', shortDescription: '24-hour national hackathon', category: 'hackathon', scope: 'national', mode: 'offline', organizer: 'CIT Innovation Cell', organizerLogo: null, bannerUrl: null, websiteUrl: 'https://hackfusion.cit.in', registrationUrl: 'https://hackfusion.cit.in/register', teamSizeMin: 2, teamSizeMax: 4, prizePool: '₹1,00,000', registrationDeadline: '2025-08-15T23:59:59Z', startDate: '2025-09-01T09:00:00Z', endDate: '2025-09-02T18:00:00Z', eligibility: JSON.stringify({ departments: ['CSE', 'IT', 'AIDS', 'ECE', 'EEE'], yearOfStudy: ['2', '3', '4'], description: 'Open to all engineering students with basic coding knowledge' }), tags: JSON.stringify(['hackathon', 'coding', 'innovation', 'ai-ml']), createdAt: '2025-05-01T10:00:00Z', updatedAt: '2025-05-01T10:00:00Z' },
    { id: 'comp-2', title: 'AI Innovation Challenge', description: 'Build AI/ML solutions for healthcare, agriculture, and smart city domains.', shortDescription: 'AI/ML solution building competition', category: 'hackathon', scope: 'national', mode: 'online', organizer: 'AIDS Department', organizerLogo: null, bannerUrl: null, websiteUrl: 'https://aic.cit.in', registrationUrl: 'https://aic.cit.in/register', teamSizeMin: 1, teamSizeMax: 3, prizePool: '₹75,000', registrationDeadline: '2025-07-30T23:59:59Z', startDate: '2025-08-10T09:00:00Z', endDate: '2025-08-31T18:00:00Z', eligibility: JSON.stringify({ departments: ['CSE', 'IT', 'AIDS'], yearOfStudy: ['2', '3', '4'], description: 'Must have completed at least one ML course' }), tags: JSON.stringify(['ai', 'ml', 'deep-learning', 'computer-vision']), createdAt: '2025-04-15T10:00:00Z', updatedAt: '2025-04-15T10:00:00Z' },
    { id: 'comp-3', title: 'Code Blitz', description: 'Fast-paced competitive programming contest with algorithmic challenges.', shortDescription: 'Competitive programming contest', category: 'hackathon', scope: 'college', mode: 'online', organizer: 'CSE Department', organizerLogo: null, bannerUrl: null, websiteUrl: 'https://codeblitz.cit.in', registrationUrl: 'https://codeblitz.cit.in/register', teamSizeMin: 1, teamSizeMax: 2, prizePool: '₹30,000', registrationDeadline: '2025-06-20T23:59:59Z', startDate: '2025-06-25T10:00:00Z', endDate: '2025-06-25T18:00:00Z', eligibility: JSON.stringify({ departments: ['CSE', 'IT', 'AIDS', 'ECE'], yearOfStudy: ['1', '2', '3', '4'], description: 'Open to all' }), tags: JSON.stringify(['coding', 'algorithms', 'data-structures']), createdAt: '2025-03-01T10:00:00Z', updatedAt: '2025-03-01T10:00:00Z' },
    { id: 'comp-4', title: 'Tech Summit Hackathon', description: 'Build full-stack applications addressing industry-specific challenges.', shortDescription: 'Full-stack development hackathon', category: 'hackathon', scope: 'international', mode: 'hybrid', organizer: 'CSE Department & GitHub Education', organizerLogo: null, bannerUrl: null, websiteUrl: 'https://techsummit.cit.in', registrationUrl: 'https://techsummit.cit.in/register', teamSizeMin: 2, teamSizeMax: 5, prizePool: '₹2,00,000', registrationDeadline: '2025-09-30T23:59:59Z', startDate: '2025-10-15T09:00:00Z', endDate: '2025-10-17T18:00:00Z', eligibility: JSON.stringify({ departments: ['CSE', 'IT', 'AIDS', 'ECE', 'EEE', 'MECH'], yearOfStudy: ['2', '3', '4'], description: 'Open to all engineering students' }), tags: JSON.stringify(['full-stack', 'web-dev', 'cloud', 'devops']), createdAt: '2025-05-10T10:00:00Z', updatedAt: '2025-05-10T10:00:00Z' },
    { id: 'comp-5', title: 'IEEE Paper Presentation', description: 'Present your research papers on emerging technologies before a panel of experts.', shortDescription: 'Research paper presentation event', category: 'paper_presentation', scope: 'international', mode: 'offline', organizer: 'IEEE CIT Student Branch', organizerLogo: null, bannerUrl: null, websiteUrl: 'https://ieee.cit.in/paper', registrationUrl: 'https://ieee.cit.in/paper/register', teamSizeMin: 1, teamSizeMax: 3, prizePool: '₹50,000', registrationDeadline: '2025-11-15T23:59:59Z', startDate: '2025-11-28T09:00:00Z', endDate: '2025-11-29T17:00:00Z', eligibility: JSON.stringify({ departments: ['CSE', 'IT', 'AIDS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CSBS'], yearOfStudy: ['3', '4'], description: 'Must have an original research paper' }), tags: JSON.stringify(['research', 'ieee', 'paper', 'publication']), createdAt: '2025-05-20T10:00:00Z', updatedAt: '2025-05-20T10:00:00Z' },
    { id: 'comp-6', title: 'Cloud Architecture Workshop', description: 'Hands-on workshop on designing and deploying cloud-native applications using AWS.', shortDescription: 'AWS cloud architecture workshop', category: 'workshop', scope: 'college', mode: 'offline', organizer: 'CSE Department & AWS Academy', organizerLogo: null, bannerUrl: null, websiteUrl: 'https://cloud.cit.in', registrationUrl: 'https://cloud.cit.in/register', teamSizeMin: 1, teamSizeMax: 1, prizePool: '₹0', registrationDeadline: '2025-06-10T23:59:59Z', startDate: '2025-06-14T09:00:00Z', endDate: '2025-06-15T17:00:00Z', eligibility: JSON.stringify({ departments: ['CSE', 'IT', 'AIDS'], yearOfStudy: ['2', '3', '4'], description: 'Basic programming knowledge required' }), tags: JSON.stringify(['aws', 'cloud', 'devops', 'docker']), createdAt: '2025-04-01T10:00:00Z', updatedAt: '2025-04-01T10:00:00Z' },
    { id: 'comp-7', title: 'Summer Internship Program 2025', description: '8-week paid internship program for talented 2nd-year students across all departments.', shortDescription: 'Summer internship opportunity', category: 'internship', scope: 'national', mode: 'offline', organizer: 'CIT Placement Cell', organizerLogo: null, bannerUrl: null, websiteUrl: 'https://careers.cit.in/intern', registrationUrl: 'https://careers.cit.in/intern/apply', teamSizeMin: 1, teamSizeMax: 1, prizePool: '₹30,000 stipend', registrationDeadline: '2025-07-01T23:59:59Z', startDate: '2025-07-15T09:00:00Z', endDate: '2025-09-06T18:00:00Z', eligibility: JSON.stringify({ departments: ['CSE', 'IT', 'AIDS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CSBS'], yearOfStudy: ['2'], description: 'CGPA above 8.0 required' }), tags: JSON.stringify(['internship', 'placement', 'industry']), createdAt: '2025-03-15T10:00:00Z', updatedAt: '2025-03-15T10:00:00Z' },
    { id: 'comp-8', title: "Smart India Hackathon 2025", description: "Government of India's flagship hackathon to solve problems faced by various ministries.", shortDescription: 'Government of India hackathon', category: 'project', scope: 'national', mode: 'hybrid', organizer: 'Ministry of Education', organizerLogo: null, bannerUrl: null, websiteUrl: 'https://sih.gov.in', registrationUrl: 'https://sih.gov.in/register', teamSizeMin: 4, teamSizeMax: 6, prizePool: '₹5,00,000', registrationDeadline: '2025-08-30T23:59:59Z', startDate: '2025-09-20T09:00:00Z', endDate: '2025-09-22T18:00:00Z', eligibility: JSON.stringify({ departments: ['CSE', 'IT', 'AIDS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CSBS'], yearOfStudy: ['2', '3', '4'], description: 'Open to all engineering students' }), tags: JSON.stringify(['sih', 'government', 'innovation', 'social-impact']), createdAt: '2025-06-01T10:00:00Z', updatedAt: '2025-06-01T10:00:00Z' },
    { id: 'comp-9', title: 'National Sports Meet', description: 'Inter-college sports competition featuring cricket, football, basketball, and athletics.', shortDescription: 'Inter-college sports competition', category: 'sports', scope: 'national', mode: 'offline', organizer: 'CIT Sports Board', organizerLogo: null, bannerUrl: null, websiteUrl: 'https://sports.cit.in', registrationUrl: 'https://sports.cit.in/register', teamSizeMin: 5, teamSizeMax: 15, prizePool: '₹1,50,000', registrationDeadline: '2025-10-01T23:59:59Z', startDate: '2025-10-20T08:00:00Z', endDate: '2025-10-24T18:00:00Z', eligibility: JSON.stringify({ departments: ['CSE', 'IT', 'AIDS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CSBS'], yearOfStudy: ['1', '2', '3', '4'], description: 'Must have college sports clearance' }), tags: JSON.stringify(['sports', 'cricket', 'football', 'athletics']), createdAt: '2025-04-20T10:00:00Z', updatedAt: '2025-04-20T10:00:00Z' },
    { id: 'comp-10', title: 'Cultural Fest 2025', description: 'Annual cultural festival with music, dance, drama, and literary events.', shortDescription: 'Annual cultural festival', category: 'cultural', scope: 'college', mode: 'offline', organizer: 'CIT Cultural Committee', organizerLogo: null, bannerUrl: null, websiteUrl: 'https://cultural.cit.in', registrationUrl: 'https://cultural.cit.in/register', teamSizeMin: 1, teamSizeMax: 10, prizePool: '₹80,000', registrationDeadline: '2025-11-10T23:59:59Z', startDate: '2025-11-22T09:00:00Z', endDate: '2025-11-24T21:00:00Z', eligibility: JSON.stringify({ departments: ['CSE', 'IT', 'AIDS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CSBS'], yearOfStudy: ['1', '2', '3', '4'], description: 'Open to all students' }), tags: JSON.stringify(['cultural', 'music', 'dance', 'arts']), createdAt: '2025-05-05T10:00:00Z', updatedAt: '2025-05-05T10:00:00Z' },
  ]
  await prisma.competition.createMany({ data: competitions })

  await prisma.registration.createMany({
    data: [
      { id: 'reg-1', competitionId: 'comp-1', userId: 'stu-1', status: 'verified', registeredAt: '2025-05-15T10:30:00Z', verifiedAt: '2025-05-16T14:00:00Z', verificationMethod: 'email', extractedConfirmationId: 'CONF-001', extractedEmail: 'jeevan.r@citchennai.net', rejectionReason: null, notes: null, createdAt: '2025-05-15T10:30:00Z', updatedAt: '2025-05-16T14:00:00Z' },
      { id: 'reg-2', competitionId: 'comp-1', userId: 'stu-4', status: 'verified', registeredAt: '2025-05-14T09:00:00Z', verifiedAt: '2025-05-15T11:00:00Z', verificationMethod: 'screenshot', extractedConfirmationId: 'CONF-002', extractedEmail: 'yuvanaj.g@citchennai.net', rejectionReason: null, notes: null, createdAt: '2025-05-14T09:00:00Z', updatedAt: '2025-05-15T11:00:00Z' },
      { id: 'reg-3', competitionId: 'comp-2', userId: 'stu-1', status: 'pending_verification', registeredAt: '2025-05-20T15:00:00Z', verifiedAt: null, verificationMethod: 'screenshot', extractedConfirmationId: null, extractedEmail: null, rejectionReason: null, notes: null, createdAt: '2025-05-20T15:00:00Z', updatedAt: '2025-05-20T15:00:00Z' },
      { id: 'reg-4', competitionId: 'comp-3', userId: 'stu-2', status: 'verified', registeredAt: '2025-04-10T11:00:00Z', verifiedAt: '2025-04-11T09:00:00Z', verificationMethod: 'email', extractedConfirmationId: 'CONF-003', extractedEmail: 'kavin.r@citchennai.net', rejectionReason: null, notes: null, createdAt: '2025-04-10T11:00:00Z', updatedAt: '2025-04-11T09:00:00Z' },
      { id: 'reg-5', competitionId: 'comp-3', userId: 'stu-3', status: 'completed', registeredAt: '2025-04-08T14:30:00Z', verifiedAt: '2025-04-09T10:00:00Z', verificationMethod: 'email', extractedConfirmationId: 'CONF-004', extractedEmail: 'harini.s@citchennai.net', rejectionReason: null, notes: null, createdAt: '2025-04-08T14:30:00Z', updatedAt: '2025-04-09T10:00:00Z' },
      { id: 'reg-6', competitionId: 'comp-2', userId: 'stu-11', status: 'rejected', registeredAt: '2025-05-18T08:00:00Z', verifiedAt: '2025-05-19T16:00:00Z', verificationMethod: 'screenshot', extractedConfirmationId: null, extractedEmail: null, rejectionReason: 'Screenshot does not show valid registration confirmation', notes: 'Please upload a clearer screenshot', createdAt: '2025-05-18T08:00:00Z', updatedAt: '2025-05-19T16:00:00Z' },
      { id: 'reg-7', competitionId: 'comp-4', userId: 'stu-5', status: 'pending_verification', registeredAt: '2025-06-01T12:00:00Z', verifiedAt: null, verificationMethod: 'email', extractedConfirmationId: null, extractedEmail: null, rejectionReason: null, notes: null, createdAt: '2025-06-01T12:00:00Z', updatedAt: '2025-06-01T12:00:00Z' },
      { id: 'reg-8', competitionId: 'comp-5', userId: 'stu-6', status: 'pending_verification', registeredAt: '2025-06-05T10:00:00Z', verifiedAt: null, verificationMethod: 'screenshot', extractedConfirmationId: null, extractedEmail: null, rejectionReason: null, notes: null, createdAt: '2025-06-05T10:00:00Z', updatedAt: '2025-06-05T10:00:00Z' },
      { id: 'reg-9', competitionId: 'comp-6', userId: 'stu-9', status: 'verified', registeredAt: '2025-05-25T09:30:00Z', verifiedAt: '2025-05-26T14:00:00Z', verificationMethod: 'email', extractedConfirmationId: 'CONF-005', extractedEmail: 'arunkumar.s@citchennai.net', rejectionReason: null, notes: null, createdAt: '2025-05-25T09:30:00Z', updatedAt: '2025-05-26T14:00:00Z' },
      { id: 'reg-10', competitionId: 'comp-1', userId: 'stu-10', status: 'pending_verification', registeredAt: '2025-06-03T16:45:00Z', verifiedAt: null, verificationMethod: 'email', extractedConfirmationId: null, extractedEmail: null, rejectionReason: null, notes: null, createdAt: '2025-06-03T16:45:00Z', updatedAt: '2025-06-03T16:45:00Z' },
      { id: 'reg-11', competitionId: 'comp-7', userId: 'stu-7', status: 'completed', registeredAt: '2025-04-20T08:00:00Z', verifiedAt: '2025-04-21T10:00:00Z', verificationMethod: 'email', extractedConfirmationId: 'CONF-006', extractedEmail: 'santhosh.m@citchennai.net', rejectionReason: null, notes: null, createdAt: '2025-04-20T08:00:00Z', updatedAt: '2025-04-21T10:00:00Z' },
      { id: 'reg-12', competitionId: 'comp-8', userId: 'stu-15', status: 'pending_verification', registeredAt: '2025-06-10T11:15:00Z', verifiedAt: null, verificationMethod: 'screenshot', extractedConfirmationId: null, extractedEmail: null, rejectionReason: null, notes: null, createdAt: '2025-06-10T11:15:00Z', updatedAt: '2025-06-10T11:15:00Z' },
    ],
  })

  await prisma.winner.createMany({
    data: [
      { id: 'win-1', studentName: 'Jeevan R', email: 'jeevan.r@citchennai.net', competition: 'HackFusion 2025', competitionId: 'comp-1', department: 'CSE', position: '1st', prize: '₹50,000', date: '2025-06-15' },
      { id: 'win-2', studentName: 'Kavin Raj', email: 'kavin.r@citchennai.net', competition: 'AI Innovation Challenge', competitionId: 'comp-2', department: 'AIDS', position: '2nd', prize: '₹25,000', date: '2025-05-20' },
      { id: 'win-3', studentName: 'Harini S', email: 'harini.s@citchennai.net', competition: 'Code Blitz', competitionId: 'comp-3', department: 'IT', position: '1st', prize: '₹30,000', date: '2025-05-10' },
      { id: 'win-4', studentName: 'Yuvanaj G', email: 'yuvanaj.g@citchennai.net', competition: 'Tech Summit Hackathon', competitionId: 'comp-4', department: 'CSE', position: '3rd', prize: '₹10,000', date: '2025-04-28' },
      { id: 'win-5', studentName: 'Pranav M', email: 'pranav.m@citchennai.net', competition: 'IEEE Paper Presentation', competitionId: 'comp-5', department: 'CSE', position: '1st', prize: '₹15,000', date: '2025-04-12' },
      { id: 'win-6', studentName: 'Divya K', email: 'divya.k@citchennai.net', competition: 'Cloud Architecture Workshop', competitionId: 'comp-6', department: 'ECE', position: '1st', prize: '₹5,000', date: '2025-06-20' },
      { id: 'win-7', studentName: 'Arun Kumar S', email: 'arunkumar.s@citchennai.net', competition: 'Code Blitz', competitionId: 'comp-3', department: 'IT', position: '2nd', prize: '₹15,000', date: '2025-05-10' },
      { id: 'win-8', studentName: 'Lakshmi P', email: 'lakshmi.p@citchennai.net', competition: 'Smart India Hackathon', competitionId: 'comp-8', department: 'EEE', position: '1st', prize: '₹1,00,000', date: '2025-09-22' },
    ],
  })

  await prisma.auditLog.createMany({
    data: [
      { id: 'log-1', timestamp: '2025-07-03 14:32:10', user: 'Dr. Priya Sharma', action: 'Verified', resource: 'Registration #1247', details: 'Verified registration for HackFusion 2025' },
      { id: 'log-2', timestamp: '2025-07-03 13:15:45', user: 'Admin', action: 'Created', resource: 'Competition #89', details: 'Created new competition: AI Innovation Challenge' },
      { id: 'log-3', timestamp: '2025-07-03 11:20:30', user: 'Mr. Arun Kumar', action: 'Rejected', resource: 'Registration #1239', details: 'Rejected registration - incomplete documents' },
      { id: 'log-4', timestamp: '2025-07-02 16:45:00', user: 'Admin', action: 'Updated', resource: 'Department CSE', details: 'Updated department advisor assignment' },
      { id: 'log-5', timestamp: '2025-07-02 10:30:15', user: 'Dr. Meena Raj', action: 'Verified', resource: 'Registration #1235', details: 'Verified registration for Code Blitz' },
      { id: 'log-6', timestamp: '2025-07-01 15:10:22', user: 'Admin', action: 'Deleted', resource: 'Competition #85', details: 'Removed cancelled workshop competition' },
      { id: 'log-7', timestamp: '2025-07-01 09:05:40', user: 'Mr. Arun Kumar', action: 'Verified', resource: 'Registration #1228', details: 'Verified registration for Tech Summit' },
      { id: 'log-8', timestamp: '2025-06-30 14:20:18', user: 'Admin', action: 'Created', resource: 'Advisor #12', details: 'Added new advisor: Dr. Meena Raj' },
      { id: 'log-9', timestamp: '2025-06-29 16:10:00', user: 'Dr. Priya Sharma', action: 'Verified', resource: 'Registration #1220', details: 'Verified registration for Cloud Architecture Workshop' },
      { id: 'log-10', timestamp: '2025-06-28 09:45:30', user: 'Admin', action: 'Updated', resource: 'Competition #82', details: 'Extended registration deadline for Code Blitz' },
      { id: 'log-11', timestamp: '2025-06-27 14:00:00', user: 'Dr. Suresh Kumar', action: 'Rejected', resource: 'Registration #1215', details: 'Rejected registration - duplicate entry' },
      { id: 'log-12', timestamp: '2025-06-26 11:30:45', user: 'Admin', action: 'Created', resource: 'User Account', details: 'Created new student accounts for batch 2025' },
    ],
  })

  await prisma.notification.createMany({
    data: [
      { id: 'notif-1', userId: 'user-1', type: 'verification_update', title: 'Registration Verified', message: 'Your registration for HackFusion 2025 has been verified by your advisor.', data: null, isRead: false, createdAt: '2025-07-03T12:30:00Z' },
      { id: 'notif-2', userId: 'user-1', type: 'new_competition', title: 'New Competition Posted', message: 'AI Innovation Challenge 2025 is now open for registrations. Deadline: July 30.', data: null, isRead: false, createdAt: '2025-07-03T10:00:00Z' },
      { id: 'notif-3', userId: 'user-1', type: 'deadline_reminder', title: 'Deadline Approaching', message: 'Code Blitz registration closes in 2 days. Complete your registration now.', data: null, isRead: true, createdAt: '2025-07-02T08:00:00Z' },
      { id: 'notif-4', userId: 'user-1', type: 'registration_confirmed', title: 'Registration Confirmed', message: 'Your team has been successfully registered for Tech Summit Hackathon.', data: null, isRead: true, createdAt: '2025-07-01T15:00:00Z' },
      { id: 'notif-5', userId: 'user-1', type: 'winner_announced', title: 'Winner Announced', message: 'Congratulations! Results for IEEE Paper Presentation are now available.', data: null, isRead: true, createdAt: '2025-06-30T09:00:00Z' },
      { id: 'notif-6', userId: 'user-1', type: 'system', title: 'System Maintenance', message: 'Scheduled maintenance on July 5 from 2:00 AM to 4:00 AM IST.', data: null, isRead: true, createdAt: '2025-06-28T14:00:00Z' },
      { id: 'notif-7', userId: 'user-1', type: 'verification_update', title: 'Registration Rejected', message: 'Your registration for AI Innovation Challenge was rejected. Please check the reason and re-register.', data: null, isRead: false, createdAt: '2025-07-03T16:00:00Z' },
      { id: 'notif-8', userId: 'user-1', type: 'deadline_reminder', title: 'HackFusion Registrations Open', message: 'HackFusion 2025 registrations are now open! Register before August 15.', data: null, isRead: true, createdAt: '2025-07-01T10:00:00Z' },
    ],
  })

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
