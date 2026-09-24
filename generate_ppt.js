const pptxgen = require('pptxgenjs');

let pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Define a clean, academic Master Slide
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: 'FFFFFF' },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: '2B3A42' } } },
    { text: { text: 'Object-Oriented Software Engineering | DRBSE2401', options: { x: 0.2, y: 0.2, w: 8, h: 0.4, color: 'FFFFFF', fontSize: 12, fontFace: 'Arial' } } },
    { text: { text: 'Medallion Theatre Ticket Sales Management System', options: { x: '50%', y: 0.2, w: '48%', h: 0.4, align: 'right', color: 'FFFFFF', fontSize: 12, fontFace: 'Arial' } } },
    { rect: { x: 0, y: 5.2, w: '100%', h: 0.4, fill: { color: 'EFEFEF' } } },
  ]
});

// 1. Title slide
let slide1 = pptx.addSlide();
slide1.background = { color: '2B3A42' };
slide1.addText('Object-Oriented Software Engineering', { x: 1, y: 1.5, w: 8, h: 0.5, color: 'FFFFFF', fontSize: 20, fontFace: 'Arial' });
slide1.addText('DRBSE2401', { x: 1, y: 2, w: 8, h: 0.5, color: '8EA8C3', fontSize: 18, fontFace: 'Arial' });
slide1.addText('Medallion Theatre Ticket Sales Management System', { x: 1, y: 2.8, w: 8, h: 1, color: 'FFFFFF', fontSize: 36, bold: true, fontFace: 'Arial' });
slide1.addText('A systems analysis and design project examining the transition from a manual ticket reservation process to a centralized, computerized management solution.', { x: 1, y: 4, w: 8, h: 1, color: 'DDE3E9', fontSize: 14, fontFace: 'Arial' });

function addTextSlide(chapter, title, paragraphs) {
  let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText(chapter, { x: 0.5, y: 1.0, w: 9, h: 0.4, color: '8EA8C3', fontSize: 14, bold: true, fontFace: 'Arial' });
  if (title) {
    slide.addText(title, { x: 0.5, y: 1.4, w: 9, h: 0.6, color: '2B3A42', fontSize: 28, bold: true, fontFace: 'Arial' });
  }
  
  let yPos = title ? 2.2 : 1.4;
  paragraphs.forEach(p => {
    slide.addText(p, { x: 0.5, y: yPos, w: 9, h: 0.8, color: '333333', fontSize: 18, fontFace: 'Arial', align: 'left', valign: 'top' });
    yPos += 1.2;
  });
}

function addBulletSlide(chapter, title, intro, bullets) {
  let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText(chapter, { x: 0.5, y: 1.0, w: 9, h: 0.4, color: '8EA8C3', fontSize: 14, bold: true, fontFace: 'Arial' });
  if (title) {
    slide.addText(title, { x: 0.5, y: 1.4, w: 9, h: 0.6, color: '2B3A42', fontSize: 28, bold: true, fontFace: 'Arial' });
  }
  
  let startY = title ? 2.2 : 1.4;
  
  if (intro) {
    slide.addText(intro, { x: 0.5, y: startY, w: 9, h: 0.6, color: '333333', fontSize: 18, fontFace: 'Arial', valign: 'top' });
    startY += 0.8;
  }
  
  const textItems = bullets.map(b => ({ text: b.title ? b.title + ': ' + b.text : b.text, options: { bullet: true, color: '333333', fontSize: 18, fontFace: 'Arial', breakLine: true, bold: !!b.title } }));
  slide.addText(textItems, { x: 0.5, y: startY, w: 9, h: 2.5, valign: 'top', lineSpacing: 26 });
}

function addImageSideSlide(chapter, title, textContent, imagePath) {
  let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText(chapter, { x: 0.5, y: 1.0, w: 9, h: 0.4, color: '8EA8C3', fontSize: 14, bold: true, fontFace: 'Arial' });
  slide.addText(title, { x: 0.5, y: 1.4, w: 9, h: 0.6, color: '2B3A42', fontSize: 24, bold: true, fontFace: 'Arial' });
  
  slide.addText(textContent, { x: 0.5, y: 2.2, w: 4.5, h: 3, color: '333333', fontSize: 18, fontFace: 'Arial', valign: 'top', align: 'left', lineSpacing: 26 });
  slide.addImage({ path: imagePath, x: 5.2, y: 1.8, w: 4.3, h: 3.2, sizing: { type: 'contain' } });
}

// Chapter 1
addTextSlide('Chapter 1', 'Introduction & Background', [
  'The Medallion Theatre, the subject of our case study, currently relies on a fully manual process for managing ticket reservations and sales.',
  'Customer reservations are written by hand, seat availability is tracked on paper seating charts, and customer records are stored in physical files.'
]);

addTextSlide('Chapter 1', '', [
  'This approach creates serious operational challenges as the volume of customers and performances grows.',
  'For this assignment, we propose a computerized ticket sales management system - a centralized database solution that organizes patrons, productions, performances, seating arrangements, and ticket transactions in a reliable and efficient manner.'
]);

addBulletSlide('Chapter 1', 'Key Problems Identified', 'Through our initial research, we identified several critical issues:', [
  { text: 'Missing or misplaced customer reservations.' },
  { text: 'Double booking of seats due to manual errors.' },
  { text: 'Delays in confirming seat availability.' },
  { text: 'Inaccurate or time-consuming report generation.' },
  { text: 'Poor tracking of frequent patrons and customer history.' }
]);

addBulletSlide('Chapter 1', 'Objectives of the Study', 'Our project is driven by a general objective and a set of targeted specific goals.', [
  { title: 'General Objective', text: 'To analyze and design a computerized ticket sales management system for the Medallion Theatre that replaces their current error-prone manual process.' },
  { title: 'Study the Existing System', text: 'Document current reservation and sales workflows.' }
]);

addBulletSlide('Chapter 1', '', '', [
  { title: 'Identify Problems & Limitations', text: 'Analyze pain points for staff and customers.' },
  { title: 'Design the Proposed System', text: 'Model patrons, productions, performances, and ticket sales.' },
  { title: 'Improve Efficiency & Accuracy', text: 'Reduce errors, generate reports, enhance service.' }
]);

// Chapter 2
addBulletSlide('Chapter 2', 'Existing System Analysis', 'The Medallion Theatre\'s current process depends entirely on manual effort. Customers reserve seats by calling or visiting the ticket office, after which staff record details by hand on paper records and physical seating charts.', [
  { title: 'Lost Reservations', text: 'Handwritten records are easily misplaced or incorrectly transferred, leading to reserved seats being sold twice.' },
  { title: 'Slow Seat Checking', text: 'Staff must inspect physical seating charts before confirming availability - a process that is both time-consuming and unreliable.' }
]);

addBulletSlide('Chapter 2', '', '', [
  { title: 'Poor Reporting', text: 'Generating accurate reports on ticket sales or customer activity requires manually cross-referencing multiple paper records.' },
  { title: 'No Customer History', text: 'Identifying frequent patrons or communicating upcoming events is nearly impossible without organized, searchable records.' }
]);

addBulletSlide('Chapter 2', 'The Proposed System & Its Benefits', 'The proposed computerized system will automate all major ticket office operations using a centralized relational database, accessible through a simple interface designed for theatre staff.', [
  { title: 'Centralized Data Storage', text: 'All patron, production, performance, seat, and ticket data stored electronically in one place - eliminating paper records.' },
  { title: 'Real-Time Seat Availability', text: 'Staff can instantly view which seats are free or reserved for any performance, preventing double booking entirely.' },
  { title: 'Automated Report Generation', text: 'Sales reports, seat availability summaries, and patron purchase histories can be produced directly from the database.' }
]);

// Chapter 3
addBulletSlide('Chapter 3', 'System Requirements: Functional', '', [
  { title: 'Patron Management', text: 'Register, search, and update customer personal and contact information.' },
  { title: 'Production & Performance Management', text: 'Add shows, schedule matinee and evening performances.' },
  { title: 'Seat Management', text: 'View seat categories and real-time availability per performance.' }
]);

addBulletSlide('Chapter 3', '', '', [
  { title: 'Ticket Sales & Reservation', text: 'Reserve or sell seats while enforcing one-seat-per-patron rules.' },
  { title: 'Report Generation', text: 'Produce sold/available ticket reports and patron purchase histories.' }
]);

addBulletSlide('Chapter 3', 'System Requirements: Non-Functional', 'We established the following non-functional requirements for the system:', [
  { title: 'Usability', text: 'Simple, clear interface operable without technical training.' },
  { title: 'Reliability', text: 'Prevent double booking and data loss at all times.' },
  { title: 'Performance', text: 'Fast retrieval of seat and customer records.' },
  { title: 'Security', text: 'Access restricted to authorized staff only.' }
]);

addBulletSlide('Chapter 3', 'System Requirements: User Roles', 'We defined two primary user roles for the system:', [
  { title: 'Ticket Clerk', text: 'Handles reservations and patron registration.' },
  { title: 'Box Office Manager', text: 'Oversees operations, manages performances, and reviews reports.' }
]);

// Chapter 4
addTextSlide('Chapter 4', 'System Models & Data Architecture', [
  'We utilized three complementary modeling techniques to represent the system from different analytical perspectives - capturing user interactions, data flows, and data structure.',
  'The Use Case Diagram identifies actors and the functions they perform.'
]);

addTextSlide('Chapter 4', '', [
  'Data Flow Diagrams (DFD) break the system into main processes across multiple levels.',
  'The Entity-Relationship Diagram (ERD) defines core entities and maps their relationships to ensure data integrity.'
]);

addImageSideSlide('Chapter 4', 'Use Case Diagram', 'We mapped out the primary actors (Ticket Clerk and Box Office Manager) and the functions they perform: registering patrons, managing performances, reserving tickets, and generating reports.', '/home/yoni/Desktop/projects/personal/oose/1.png');

addImageSideSlide('Chapter 4', 'Data Flow Diagram: Context Diagram', 'The Context Diagram establishes system boundaries and external entities, providing a high-level view of how users interact with the system.', '/home/yoni/Desktop/projects/personal/oose/2.png');

addImageSideSlide('Chapter 4', 'Data Flow Diagram: Level 0', 'We expanded the system into primary data processes: Patron Management, Performance Scheduling, Reservation Handling, and Reporting.', '/home/yoni/Desktop/projects/personal/oose/3.png');

addImageSideSlide('Chapter 4', 'Data Flow Diagram: Level 1', 'The Level 1 DFD expands the ticket reservation process in detail, showing seat checking, selection, and recording steps. This visualizes the exact logic required for a clerk to complete a booking.', '/home/yoni/Desktop/projects/personal/oose/4.png');

addImageSideSlide('Chapter 4', 'Entity-Relationship Diagram (ERD)', 'We defined five core entities - Patron, Production, Performance, Seat, and Ticket - mapping their one-to-many relationships to ensure data integrity and prevent duplicate bookings.', '/home/yoni/Desktop/projects/personal/oose/5.png');

addTextSlide('Chapter 4', 'Data Model: Entities & Relationships', [
  'The ERD forms the backbone of the proposed system. We designed each entity to store specific attributes, with clearly defined relationships enforcing data consistency throughout the database.'
]);

addTextSlide('Chapter 4', '', [
  'The one-to-many relationships between Production to Performance, Performance to Ticket, Patron to Ticket, and Seat to Ticket collectively enforce our business rule that no seat may be double-booked for the same performance.',
  'This strict relational mapping addresses the theatre\'s most critical operational problem.'
]);

// Chapter 5
addTextSlide('Chapter 5', 'User Interface Design', [
  'We designed the interface for simplicity and consistency - all screens follow a uniform layout so that staff can learn the system quickly. Clear field labels, confirmation messages, and error feedback minimize data entry mistakes.',
  'Patron Registration Form: Records new patron details - name, address, phone, and email. Includes Save, Update, and Clear buttons to manage existing records efficiently.'
]);

addTextSlide('Chapter 5', '', [
  'Performance Management Form: Used by the Box Office Manager to enter production names, performance dates, and show types (matinee or evening) before reservations open.'
]);

addBulletSlide('Chapter 5', 'Ticket Reservation & Output Reports', 'We designed the interface to allow the Ticket Clerk to select a patron and performance, then choose from clearly displayed available seats to confirm and record a reservation.', [
  { title: 'Seat Availability Report', text: 'Lists all seats for a performance - available or reserved - for quick clerk reference.' },
  { title: 'Ticket Sales Report', text: 'Shows total tickets sold per performance to support management decisions.' },
  { title: 'Patron Ticket Report', text: 'Displays all tickets purchased by a specific patron to track history and resolve disputes.' }
]);

// Implementation details (What we coded)
addBulletSlide('Implementation', 'Executing the Design', 'We translated the theoretical design into a functional, computerized web application using standard software engineering practices.', [
  { title: 'Relational Database Deployment', text: 'We implemented the ERD in PostgreSQL, utilizing foreign keys and unique constraints to physically prevent double-bookings at the database level.' }
]);

addBulletSlide('Implementation', '', '', [
  { title: 'Authentication Integration', text: 'While the design identified actors, we added necessary security by requiring clerks and managers to log in with hashed passwords and secure sessions.' },
  { title: 'Interactive Seat Selection', text: 'Instead of a basic text list, we developed a visual map of the 602 physical seats, accelerating the clerk\'s reservation workflow.' }
]);

addBulletSlide('Implementation', 'Fulfilling Operational Needs', 'The software directly addresses the operational gaps identified in Chapter 1.', [
  { title: 'Will Call Reservation Forms', text: 'We programmed the system to generate the exact Will Call receipt required for customer pickup, fulfilling the physical output requirement.' },
  { title: 'Frequent Patron Identification', text: 'Database queries automatically calculate purchase history, visually flagging frequent patrons in the interface to enhance customer service.' }
]);

addBulletSlide('Implementation', '', '', [
  { title: 'Report Automation', text: 'We utilized complex database joins to produce the necessary Seat Availability, Sales, and Patron reports instantly, eliminating hours of manual cross-referencing.' }
]);

// Chapter 6
addTextSlide('Chapter 6', 'Conclusion & Lessons Learned', [
  'We successfully analyzed the Medallion Theatre\'s manual ticketing process and produced a comprehensive computerized replacement system.',
  'The Use Case Diagrams, DFDs, and ERD we created together provided a clear development blueprint.'
]);

addTextSlide('Chapter 6', '', [
  'Key Lessons Learned:',
  '• Clear requirement gathering at the start prevents costly misunderstandings later.',
  '• Well-structured data models prevent duplication and inconsistency.',
  '• Visual modeling tools make complex systems understandable from multiple perspectives.',
  '• Even small manual errors can cause significant operational damage - automation is a powerful remedy.'
]);

pptx.writeFile({ fileName: 'Medallion_Theatre_Academic_Presentation.pptx' }).then(() => {
  console.log('Presentation generated successfully!');
});
