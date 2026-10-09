const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Document = require('./models/Document');
const ActivityLog = require('./models/ActivityLog');
const { DEFAULT_CATEGORIES } = require('./controllers/categoryController');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal_doc_organizer';

const createSampleFile = (fileName, content) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, content);
  return filePath;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Document.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      organization: 'DocVault Enterprise',
    });

    const demoUser = await User.create({
      name: 'Manideep Sharma',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      organization: 'Personal Archive',
    });

    console.log('Users created:');
    console.log('  - Admin: admin@example.com (Password: admin123)');
    console.log('  - User:  user@example.com  (Password: user123)');

    // 2. Seed Default Categories
    const seededCategories = await Category.insertMany(DEFAULT_CATEGORIES);
    console.log(`Seeded ${seededCategories.length} categories.`);

    // 3. Create Sample files in uploads
    const samplePassportFile = 'sample-passport-doc.txt';
    createSampleFile(
      samplePassportFile,
      'OFFICIAL PASSPORT VERIFICATION DOCUMENT\nCountry: Republic of India\nDocument No: Z9182736\nHolder: Manideep Sharma\nIssue: 2024-05-10\nExpiry: 2034-05-09\nStatus: VALID'
    );

    const sampleLicenseFile = 'sample-drivers-license.txt';
    createSampleFile(
      sampleLicenseFile,
      'DRIVER LICENSE CERTIFICATE\nAuthority: Regional Transport Office (RTO)\nLicense No: DL-042022009182\nClass: LMV / MCWG\nAction Required: RENEWAL PENDING'
    );

    const sampleInsuranceFile = 'sample-health-insurance.txt';
    createSampleFile(
      sampleInsuranceFile,
      'HEALTH SHIELD COMPREHENSIVE POLICY\nPolicy No: HIC-9920148\nSum Insured: $50,000\nPolicyholder: Manideep Sharma\nAlert: POLICY EXPIRED! CONTACT PROVIDER.'
    );

    const sampleDegreeFile = 'sample-degree-certificate.txt';
    createSampleFile(
      sampleDegreeFile,
      'BACHELOR OF TECHNOLOGY - DEGREE CONFERRAL\nDepartment of Computer Science & Engineering\nFirst Class with Distinction\nLifetime Credential Verified.'
    );

    const sampleVehicleFile = 'sample-vehicle-rc.txt';
    createSampleFile(
      sampleVehicleFile,
      'CERTIFICATE OF REGISTRATION\nVehicle: Honda City ZX\nReg No: KA-01-MJ-8822\nPollution Emission Norms: BS-VI\nExpiring Soon in 22 days.'
    );

    // 4. Seed Documents with precise relative dates
    const now = new Date();

    const addDays = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d;
    };

    const subDays = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };

    const documentsToSeed = [
      {
        title: 'International Passport',
        documentNumber: 'Z9182736',
        category: 'Identification',
        issueDate: subDays(400),
        expiryDate: addDays(720), // Valid for ~2 years
        hasNoExpiry: false,
        issuingAuthority: 'Ministry of External Affairs',
        notes: '36-page booklet with valid 10-year multi-entry travel validity.',
        tags: ['travel', 'international', 'id'],
        fileName: samplePassportFile,
        fileOriginalName: 'Passport_Scan_2026.pdf',
        fileMimeType: 'text/plain',
        fileSize: 184000,
        fileUrl: `/api/documents/preview/${samplePassportFile}`,
        user: demoUser._id,
        reminderDays: 60,
      },
      {
        title: 'Driver’s License (LMV/MCWG)',
        documentNumber: 'DL-042022009182',
        category: 'Vehicles & Transport',
        issueDate: subDays(1800),
        expiryDate: addDays(12), // Expiring in 12 days!
        hasNoExpiry: false,
        issuingAuthority: 'Regional Transport Office (RTO)',
        notes: 'Needs slot booking for biometric renewal next week.',
        tags: ['license', 'urgent', 'vehicle'],
        fileName: sampleLicenseFile,
        fileOriginalName: 'Drivers_License_SmartCard.pdf',
        fileMimeType: 'text/plain',
        fileSize: 142000,
        fileUrl: `/api/documents/preview/${sampleLicenseFile}`,
        user: demoUser._id,
        reminderDays: 30,
      },
      {
        title: 'Family Health Insurance Care Plan',
        documentNumber: 'HIC-9920148',
        category: 'Insurance & Healthcare',
        issueDate: subDays(380),
        expiryDate: subDays(15), // Expired 15 days ago!
        hasNoExpiry: false,
        issuingAuthority: 'Star Health Allied Insurance',
        notes: 'Grace period ongoing. Premium payment pending via net banking.',
        tags: ['health', 'expired', 'family'],
        fileName: sampleInsuranceFile,
        fileOriginalName: 'Health_Insurance_Policy_2025.pdf',
        fileMimeType: 'text/plain',
        fileSize: 310000,
        fileUrl: `/api/documents/preview/${sampleInsuranceFile}`,
        user: demoUser._id,
        reminderDays: 30,
      },
      {
        title: 'B.Tech Degree in Computer Science',
        documentNumber: 'UNIV-CS-2024-8841',
        category: 'Education & Certificates',
        issueDate: subDays(750),
        expiryDate: null,
        hasNoExpiry: true, // Lifetime
        issuingAuthority: 'National Institute of Technology',
        notes: 'Original sealed graduation transcript and certificate verified.',
        tags: ['education', 'degree', 'lifetime'],
        fileName: sampleDegreeFile,
        fileOriginalName: 'BTech_Degree_Certificate.pdf',
        fileMimeType: 'text/plain',
        fileSize: 520000,
        fileUrl: `/api/documents/preview/${sampleDegreeFile}`,
        user: demoUser._id,
        reminderDays: 30,
      },
      {
        title: 'Vehicle Pollution (PUC) & Road Tax',
        documentNumber: 'PUC-2026-98124',
        category: 'Vehicles & Transport',
        issueDate: subDays(160),
        expiryDate: addDays(22), // Expiring in 22 days!
        hasNoExpiry: false,
        issuingAuthority: 'Transport Emission Bureau',
        notes: 'Tested at AutoGas Station center. Valid for 6 months.',
        tags: ['puc', 'car', 'taxes'],
        fileName: sampleVehicleFile,
        fileOriginalName: 'Vehicle_PUC_Certificate.pdf',
        fileMimeType: 'text/plain',
        fileSize: 95000,
        fileUrl: `/api/documents/preview/${sampleVehicleFile}`,
        user: demoUser._id,
        reminderDays: 30,
      },
      {
        title: 'Residential Lease & Rent Agreement',
        documentNumber: 'LEASE-AGR-2026-04',
        category: 'Legal & Contracts',
        issueDate: subDays(120),
        expiryDate: addDays(240), // Valid for 8 months
        hasNoExpiry: false,
        issuingAuthority: 'Sub-Registrar Office, Bangalore',
        notes: '11-month lease term for Apartment 402 with 5% annual escalation clause.',
        tags: ['house', 'rent', 'agreement'],
        fileName: samplePassportFile,
        fileOriginalName: 'Apartment_Rental_Agreement.pdf',
        fileMimeType: 'text/plain',
        fileSize: 420000,
        fileUrl: `/api/documents/preview/${samplePassportFile}`,
        user: demoUser._id,
        reminderDays: 45,
      },
      {
        title: 'MacBook Pro AppleCare Protection Plan',
        documentNumber: 'AC-MBP-992144',
        category: 'Warranty & Invoices',
        issueDate: subDays(760),
        expiryDate: subDays(30), // Expired 30 days ago
        hasNoExpiry: false,
        issuingAuthority: 'Apple Inc.',
        notes: '2-year warranty expired. Consider third-party repair plan if needed.',
        tags: ['warranty', 'apple', 'expired'],
        fileName: sampleInsuranceFile,
        fileOriginalName: 'AppleCare_Warranty_Receipt.pdf',
        fileMimeType: 'text/plain',
        fileSize: 110000,
        fileUrl: `/api/documents/preview/${sampleInsuranceFile}`,
        user: demoUser._id,
        reminderDays: 30,
      },
      {
        title: 'Income Tax Assessment & Form 16',
        documentNumber: 'IT-AY2025-26-88',
        category: 'Financial & Tax',
        issueDate: subDays(90),
        expiryDate: addDays(180),
        hasNoExpiry: false,
        issuingAuthority: 'Central Board of Direct Taxes',
        notes: 'Tax refund credited successfully. Stored for 7-year audit retention.',
        tags: ['tax', 'finance', 'form16'],
        fileName: sampleDegreeFile,
        fileOriginalName: 'Form16_Tax_Assessment.pdf',
        fileMimeType: 'text/plain',
        fileSize: 280000,
        fileUrl: `/api/documents/preview/${sampleDegreeFile}`,
        user: demoUser._id,
        reminderDays: 30,
      },
    ];

    const seededDocs = await Document.insertMany(documentsToSeed);
    console.log(`Seeded ${seededDocs.length} realistic documents.`);

    // 5. Seed Activity Logs
    const sampleLogs = [
      {
        user: demoUser._id,
        userName: demoUser.name,
        action: 'CREATE',
        documentId: seededDocs[0]._id,
        documentTitle: seededDocs[0].title,
        details: 'Uploaded International Passport copy',
      },
      {
        user: demoUser._id,
        userName: demoUser.name,
        action: 'UPDATE',
        documentId: seededDocs[1]._id,
        documentTitle: seededDocs[1].title,
        details: 'Updated renewal reminder period to 30 days',
      },
      {
        user: demoUser._id,
        userName: demoUser.name,
        action: 'LOGIN',
        details: 'User logged in to view document dashboard',
      },
    ];

    await ActivityLog.insertMany(sampleLogs);
    console.log('Seeded activity logs.');

    console.log('\n===========================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('===========================================');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
