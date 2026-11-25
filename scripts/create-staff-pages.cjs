const fs = require('fs');

// 1. staff/customers/page.js
let custPage = fs.readFileSync('app/admin/customers/page.js', 'utf8');
custPage = custPage.split("from './components/").join("from '@/app/admin/customers/components/");
custPage = custPage.split('href="/admin/customers/').join('href="/staff/customers/');
custPage = custPage.split('<CustomerTable').join('<CustomerTable basePath="/staff/customers" permissions={{ canBlock: false, canUnblock: false }}');
custPage = custPage.split('Admin Customer Management').join('Customer Directory & Services');
custPage = custPage.split('Customer Management').join('Staff Customer Directory');
fs.writeFileSync('app/staff/customers/page.js', custPage, 'utf8');

// 2. staff/customers/[id]/page.js
let custIdPage = fs.readFileSync('app/admin/customers/[id]/page.js', 'utf8');
custIdPage = custIdPage.split("from '../components/").join("from '@/app/admin/customers/components/");
custIdPage = custIdPage.split("from '../../bank-accounts/components/").join("from '@/app/admin/bank-accounts/components/");
custIdPage = custIdPage.split('href="/admin/customers"').join('href="/staff/customers"');
custIdPage = custIdPage.split('href="/admin/bank-accounts/').join('href="/staff/accounts/');
fs.writeFileSync('app/staff/customers/[id]/page.js', custIdPage, 'utf8');

// 3. staff/accounts/page.js
let accPage = fs.readFileSync('app/admin/bank-accounts/page.js', 'utf8');
accPage = accPage.split("from './components/").join("from '@/app/admin/bank-accounts/components/");
accPage = accPage.split('href="/admin/bank-accounts/').join('href="/staff/accounts/');
accPage = accPage.split('<AccountTable').join('<AccountTable basePath="/staff/accounts" permissions={{ canFreeze: false, canManageLimits: false }}');
accPage = accPage.split('Admin Bank Accounts').join('Staff Account Directory');
accPage = accPage.split('Bank Accounts').join('Accounts Directory');
fs.writeFileSync('app/staff/accounts/page.js', accPage, 'utf8');

// 4. staff/accounts/[id]/page.js
let accIdPage = fs.readFileSync('app/admin/bank-accounts/[id]/page.js', 'utf8');
accIdPage = accIdPage.split("from '../components/").join("from '@/app/admin/bank-accounts/components/");
accIdPage = accIdPage.split('href="/admin/bank-accounts"').join('href="/staff/accounts"');
accIdPage = accIdPage.split('href="/admin/customers/').join('href="/staff/customers/');
fs.writeFileSync('app/staff/accounts/[id]/page.js', accIdPage, 'utf8');

// 5. staff/transactions/page.js
let txPage = fs.readFileSync('app/admin/transactions/page.js', 'utf8');
txPage = txPage.split("from './components/").join("from '@/app/admin/transactions/components/");
txPage = txPage.split('Admin Transactions').join('Staff Transaction Surveillance');
txPage = txPage.split('Transactions Overview').join('Transaction Surveillance & Monitoring');
fs.writeFileSync('app/staff/transactions/page.js', txPage, 'utf8');

console.log('Shared pages created.');
