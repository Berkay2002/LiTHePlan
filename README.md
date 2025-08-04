# LiTHePlan

A modern web application that empowers civil engineering students at Linköping University (LiTH) to discover, explore, and plan their master's program courses across different specializations. Build unique 90hp academic profiles that align with your career goals.

## 🎯 Why This Project Exists

### The Problem
Civil engineering master's students at Linköping University face a significant challenge when planning their studies. While the university offers incredible flexibility to combine courses across different specializations, students often remain unaware of these opportunities due to:

- **Fragmented Information**: Course data scattered across multiple university portals
- **Poor Discoverability**: No intuitive way to explore cross-disciplinary combinations
- **Manual Planning**: Time-consuming, error-prone spreadsheet-based course selection
- **Missed Opportunities**: Students defaulting to standard tracks, missing career-focused customization

### The Solution
LiTHePlan transforms the course planning experience by providing a centralized, interactive platform where students can:

- **Discover** all available master's level courses in one place
- **Filter** courses by term, block, pace, campus, and other criteria
- **Visualize** their 3-semester plan on an interactive pinboard
- **Validate** their profile meets degree requirements (30hp advanced courses)
- **Share** their custom profiles with advisors and peers

## 📚 Course Database & Programs

### **Database Overview**
This application contains **475 courses** from Linköping University's master's level programs (terms 7-9), covering courses relevant to **15 official civil engineering programs** and additional specialization areas.

### **Official Civil Engineering Programs (Civilingenjör)**
The application supports course planning for all **15 civil engineering programs** at Linköping University (300 hp each):

1. **Civilingenjör i datateknik** (Computer Science and Engineering)
2. **Civilingenjör i design- och produktutveckling** (Design and Product Development)
3. **Civilingenjör i elektronik och systemdesign** (Electronics and System Design)
4. **Civilingenjör i energi - miljö - management** (Energy - Environment - Management)
5. **Civilingenjör i industriell ekonomi** (Industrial Engineering and Management)
6. **Civilingenjör i informationsteknologi** (Information Technology)
7. **Civilingenjör i kemisk biologi** (Chemical Biology)
8. **Civilingenjör i kommunikation, transport och samhälle** (Communication, Transportation and Society)
9. **Civilingenjör i maskinteknik** (Mechanical Engineering)
10. **Civilingenjör i medicinsk teknik** (Biomedical Engineering)
11. **Civilingenjör i medieteknik och AI** (Media Technology and AI)
12. **Civilingenjör i mjukvaruteknik** (Software Engineering)
13. **Civilingenjör i teknisk biologi** (Engineering Biology)
14. **Civilingenjör i teknisk fysik och elektroteknik** (Applied Physics and Electrical Engineering)
15. **Civilingenjör i teknisk matematik** (Applied Mathematics)

### **Course Distribution by Specialization Areas**

**🔧 Technology & Computing** (339 courses)
- Computer Science and Engineering (106 courses)
- Electrical Engineering (98 courses) 
- Computer Science (76 courses)
- Information Technology (59 courses)

**📐 Mathematics & Physics** (74 courses)
- Applied Mathematics (37 courses)
- Mathematics (37 courses)

**⚙️ Mechanical & Transportation** (65 courses)
- Mechanical Engineering (65 courses)

**💼 Management & Design** (69 courses)
- Industrial Engineering and Management (41 courses)
- Media Technology and Engineering (28 courses)

**🧬 Life Sciences & Biology** (46 courses)
- Applied Physics (27 courses)
- Biology (19 courses)

**🌱 Other Engineering & Sciences** (106 courses)
- Energy and Environmental Engineering (16 courses)
- Biomedical Engineering (15 courses)
- Engineering Biology (15 courses)
- Biotechnology (12 courses)
- Chemistry (11 courses)
- Chemical Biology (10 courses)
- Design (9 courses)
- Programming (7 courses)
- Logistics (4 courses)
- Product Development (4 courses)
- Graphic Design and Communication (3 courses)

*Note: Some course categories represent broader specialization areas or elective options that may be available across multiple civil engineering programs.*

### **Database Statistics**
- **72.2%** advanced level courses (343 courses)
- **27.8%** basic level courses (132 courses)
- **80.8%** courses at Linköping campus (384 courses)
- **17.7%** courses at Norrköping campus (84 courses)
- **89.7%** standard 6hp courses (426 courses)
- **6.3%** courses with special notes/restrictions (30 courses)
- **25 different program areas** represented

### **⚠️ Important Data Disclaimer**
This course database was **independently compiled and is NOT officially provided by Linköping University (LiU)**. While every effort has been made to ensure accuracy:

- **No Real-Time Updates**: Course information, availability, and requirements may change without being reflected in this application
- **Manual Updates Only**: Any changes to courses, new course additions, or program modifications require manual database updates
- **Verification Required**: Always verify course details, prerequisites, and availability with official LiU sources before making academic decisions
- **Academic Advisor Consultation**: This tool is meant to aid planning - final course selection should always be discussed with your academic advisor

For the most current course information, please consult:
- Official LiU course catalog
- Your academic advisor
- Program coordinators
- Student portal systems

## ✨ Key Features

### 🔍 **Smart Course Discovery**
- Comprehensive catalog of 475 master's level courses (terms 7-9)
- Real-time filtering by multiple criteria across 25+ program specializations
- Grid and list view options with pagination
- Advanced search functionality
- **Course conflict detection and resolution system**
- **OBS warnings** for courses with special restrictions

### 📌 **Interactive Profile Builder**
- Visual "pinboard" for organizing courses across 3 semesters
- **Intelligent course conflict resolution** with user-friendly modal
- Real-time credit tracking (targeting 90hp total)
- Term-by-term course organization
- **Mobile-friendly touch interactions**

### ✅ **Requirements Validation**
- Automatic validation of degree requirements
- Advanced course credit tracking (minimum 30hp required)
- Real-time feedback on profile completeness
- Visual indicators for requirement compliance

### 🔗 **Profile Sharing & Authentication**
- **User accounts** with Supabase authentication
- **Save and share profiles** with unique URLs
- Facilitate discussions with academic advisors
- **Persistent profile storage** across devices

### 📱 **Responsive Design**
- Fully responsive across desktop, tablet, and mobile
- Accessible UI components
- Modern, intuitive interface
- Dark/light mode support

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons

### Backend & Data
- **Next.js API Routes** for backend logic
- **Supabase** database with 475 courses from LiU
- **PostgreSQL** for data storage and querying
- **Vercel** for deployment

### Development
- **TypeScript** for type safety
- **ESLint** for code quality
- **Modern React patterns** (Context, Hooks, useReducer)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Supabase environment variables configured in `.env.local` (for database statistics)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Berkay2002/profile-builder.git
   cd profile-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production version (includes TypeScript checking)
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `node scripts/fetch-course-stats.js` - Generate database statistics from Supabase

## 📁 Project Structure

```
profile-builder/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main course catalog page
│   ├── layout.tsx         # Root layout
│   ├── profile/           # Profile management pages
│   └── api/               # API routes for Supabase integration
├── components/            # React components
│   ├── course/           # Course discovery & filtering
│   ├── profile/          # Profile builder components
│   ├── shared/           # Navigation and utilities
│   └── ui/               # shadcn/ui base components
├── scripts/              # Utility scripts
│   └── fetch-course-stats.js  # Database statistics generator
├── utils/                # Supabase utilities
│   └── supabase/         # Supabase client configuration
├── lib/                  # Utilities and helpers
│   ├── course-utils.ts   # Course formatting and styling
│   ├── profile-utils.ts  # Profile management logic
│   └── utils.ts          # General utilities
├── types/                # TypeScript definitions
│   ├── course.ts         # Course interfaces
│   └── profile.ts        # Profile state management
└── docs/                 # Project documentation
    ├── brief.md          # Project brief
    └── prd.md            # Product requirements
```

## 🎨 Data Models

### Course Interface
The core data structure supporting Swedish university courses:

```typescript
interface Course {
  id: string;
  name: string;
  credits: number;
  level: 'grundnivå' | 'avancerad nivå';
  term: number[];           // [7, 8, 9] - master's level terms
  period: number[];         // Study periods within terms
  block: string[];          // Study blocks
  pace: string;            // Study pace (50%, 100%, etc.)
  examination: string[];    // Assessment methods
  campus: 'Linköping' | 'Norrköping' | 'Distans';
  programs: string[];       // Applicable programs
}
```

### Student Profile
Profile management supporting the 90hp master's program:

```typescript
interface StudentProfile {
  id: string;
  name: string;
  terms: {
    7: Course[];
    8: Course[];
    9: Course[];
  };
  metadata: {
    total_credits: number;
    advanced_credits: number;
    created_at: Date;
    updated_at: Date;
  };
}
```

## 🎯 Development Philosophy

### Mock-First Approach
The project follows a **"mock data first"** development strategy:

1. **Phase 1** (Current): Uses local JSON file for rapid development and testing
2. **Phase 2** (Future): Will transition to Supabase database with real university data

### State Management
- **ProfileContext**: Global profile state using React Context + useReducer
- **Local Storage**: Persistent profile data across sessions
- **Component State**: Local UI state and filtering logic

### Component Architecture
- **Atomic Design**: Components organized by complexity and reusability
- **TypeScript First**: Strict typing for all components and data flows
- **Accessibility**: Full WCAG compliance with shadcn/ui components

## 📊 Database Statistics Script

A Node.js script is included to generate comprehensive statistics from the Supabase database:

```bash
node scripts/fetch-course-stats.js
```

This script provides detailed analytics including:
- Course distribution by level, campus, credits, and pace
- Program coverage analysis 
- Term and scheduling breakdowns
- Examination type statistics
- Courses with special restrictions
- README-ready summary data

The script requires Supabase environment variables to be configured in `.env.local`.

## 🔄 Development Workflow

### Current Implementation Status
- ✅ Course catalog with advanced filtering
- ✅ Interactive profile builder (pinboard)
- ✅ Requirements validation and credit tracking
- ✅ **Course conflict detection and resolution system**
- ✅ **User authentication** with Supabase
- ✅ **Profile sharing and persistence** 
- ✅ **Real Supabase database integration** (475 courses)
- ✅ Mobile-responsive design with touch interactions
- ✅ **OBS warning system** for course restrictions

### Key Implementation Details
- **Profile Operations**: ADD_COURSE, REMOVE_COURSE, CLEAR_TERM, CLEAR_PROFILE
- **Validation Logic**: Real-time checking of 90hp total and 30hp advanced requirements
- **Filter Persistence**: Maintains filter state during course selection
- **Type Safety**: Runtime validation with `isValidCourse()` and `isValidStudentProfile()`

## 🎓 Target Users

**Primary**: Civil Engineering Master's Students at Linköping University
- Planning their final 90hp (terms 7-9)
- Seeking cross-specialization opportunities
- Need validated, requirement-compliant study plans
- Want to maximize their educational value and career alignment

**Secondary**: Academic Advisors
- Supporting student course planning
- Reviewing custom study profiles
- Ensuring degree requirement compliance

## 📈 Success Metrics

### User Success Indicators
- Students discover courses from multiple specializations
- Reduced time to create a complete study plan
- Increased confidence in academic planning decisions  
- Active use of export/share functionality for advisor consultations

### Technical KPIs
- Fast initial page loads (LCP < 2.5s)
- Instant, lag-free filtering performance
- High task completion rates for profile building
- Cross-device compatibility and accessibility

## 🔮 Future Roadmap

### Phase 2: Enhanced Functionality
- **User Accounts**: Save and manage multiple profile drafts
- **Real Data Integration**: Connect to university database
- **Advanced Validation**: Prerequisite checking and dependency analysis
- **Profile Templates**: Common specialization starting points

### Phase 3: Ecosystem Integration
- **Advisor Dashboard**: Tools for academic counselors
- **Registration Links**: Direct integration with university systems
- **Alumni Showcase**: Career outcome examples
- **Analytics**: Usage insights for university administration

## 🤝 Contributing

This project was developed as part of an academic initiative to improve student experience at Linköping University. While primarily a personal project, contributions that align with the educational mission are welcome.

### Development Guidelines
- Follow existing TypeScript patterns and component structure
- Maintain accessibility standards (WCAG compliance)
- Ensure responsive design across all screen sizes
- Add comprehensive type definitions for new features
- Test across major browsers and devices

## 📄 License

This project is developed for educational purposes. Please respect university data policies and student privacy when contributing or using this codebase.

## 🙏 Acknowledgments

- **Linköping University** for the educational context and requirements
- **shadcn/ui** for the exceptional component library
- **Next.js** and **React** teams for the development framework
- **Academic advisors** who provided insights into student planning challenges

---

Built with ❤️ for Linköping University civil engineering students
