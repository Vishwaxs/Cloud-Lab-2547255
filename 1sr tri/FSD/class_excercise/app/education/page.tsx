'use client';

// import { Analytics } from "../components/Analytics";
import Card, { AchievementCard } from "../components/Card";
import { Button } from "../components/Button";

export default function Education() {
  const education = [
    {
      id: 1,
      degree: "Master of Computer Applications (MCA)",
      institution: "Christ University",
      location: "Bangalore, Karnataka, India",
      duration: "2025 - 2027",
      gpa: "8/10.0",
      status: "In Progress",
      description: "Advanced computer applications program focusing on software development, full-stack technologies, and modern programming practices.",
      coursework: [
        "Advanced Data Structures and Algorithms",
        "Full Stack Web Development",
        "Database Management Systems",
        "Software Engineering",
        "Mobile Application Development",
        "Cloud Computing",
        "Artificial Intelligence",
        "Software Testing and Quality Assurance"
      ],
      achievements: [
        "Consistent Academic Excellence (8+ CGPA)",
        "Active participant in university tech events",
        "Led multiple group projects and presentations",
        "Specialized in MERN Stack Development"
      ]
    },
    {
      id: 2,
      degree: "Bachelor of Computer Applications (BCA)",
      institution: "Chandigarh University",
      location: "Mohali, Punjab, India",
      duration: "2022 - 2025",
      gpa: "8.03/10.0",
      status: "Completed",
      description: "Undergraduate program in computer applications covering programming fundamentals and software development basics.",
      coursework: [
        "Programming in C/C++",
        "Java Programming",
        "Web Technologies",
        "Database Management",
        "Computer Networks",
        "Operating Systems"
      ],
      achievements: [
        "Graduated with distinction",
        "Active in coding competitions",
        "Developed several academic projects"
      ]
    }
  ];

  const certifications = [
    {
      id: 1,
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2024",
      credentialId: "AWS-CCP-2024-001",
      description: "Fundamental understanding of AWS cloud services, security, and pricing.",
      skills: ["Cloud Computing", "AWS Services", "Security", "Cost Management"]
    },
    {
      id: 2,
      name: "Meta Frontend Developer Certificate",
      issuer: "Meta (Facebook)",
      date: "2023",
      credentialId: "META-FE-2023-456",
      description: "Comprehensive program covering React, responsive design, and frontend best practices.",
      skills: ["React", "JavaScript", "HTML/CSS", "UI/UX Design"]
    },
    {
      id: 3,
      name: "Google Data Analytics Certificate",
      issuer: "Google",
      date: "2023",
      credentialId: "GOOGLE-DA-2023-789",
      description: "Data analysis using spreadsheets, SQL, R programming, and Tableau.",
      skills: ["Data Analysis", "SQL", "R Programming", "Tableau"]
    },
    {
      id: 4,
      name: "Responsive Web Design",
      issuer: "freeCodeCamp",
      date: "2022",
      credentialId: "FCC-RWD-2022-123",
      description: "HTML, CSS, and responsive design principles for modern web development.",
      skills: ["HTML", "CSS", "Responsive Design", "Accessibility"]
    }
  ];

  const onlineCourses = [
    {
      platform: "Coursera",
      courses: [
        "Machine Learning by Stanford University",
        "Algorithms Specialization by Stanford",
        "Full Stack Web Development by University of Hong Kong"
      ]
    },
    {
      platform: "edX",
      courses: [
        "Introduction to Computer Science (CS50) by Harvard",
        "Introduction to Computational Thinking by MIT"
      ]
    },
    {
      platform: "Udemy",
      courses: [
        "The Complete JavaScript Course",
        "React - The Complete Guide",
        "Node.js - The Complete Guide"
      ]
    },
    {
      platform: "Pluralsight",
      courses: [
        "C Programming Fundamentals",
        "Advanced C Programming",
        "Docker and Kubernetes"
      ]
    }
  ];

  return (
    <>
      {/* <Analytics /> */}
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Education & Learning
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                My academic background, certifications, and continuous learning journey
                in computer science and software development.
              </p>
            </div>
          </div>
        </section>

        {/* Formal Education */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Formal Education
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                University degree and academic achievements
              </p>
            </div>

            {education.map((edu) => (
              <div key={edu.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <i className="fas fa-graduation-cap text-purple-600 dark:text-purple-400 text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {edu.degree}
                        </h3>
                        <p className="text-purple-600 dark:text-purple-400 font-medium">
                          {edu.institution}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span>
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {edu.location}
                      </span>
                      <span>
                        <i className="fas fa-calendar mr-1"></i>
                        {edu.duration}
                      </span>
                      <span>
                        <i className="fas fa-chart-line mr-1"></i>
                        GPA: {edu.gpa}
                      </span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        {edu.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {edu.description}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Coursework */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Relevant Coursework
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {edu.coursework.map((course, index) => (
                        <div key={index} className="flex items-center">
                          <i className="fas fa-book text-purple-500 mr-2"></i>
                          <span className="text-gray-600 dark:text-gray-400">{course}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Academic Achievements
                    </h4>
                    <div className="space-y-2">
                      {edu.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start">
                          <i className="fas fa-trophy text-yellow-500 mr-2 mt-0.5"></i>
                          <span className="text-gray-600 dark:text-gray-400">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Professional Certifications
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Industry-recognized certifications and credentials
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {certifications.map((cert) => (
                <div key={cert.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {cert.name}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                        {cert.issuer}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Issued: {cert.date} • ID: {cert.credentialId}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center ml-4">
                      <i className="fas fa-certificate text-blue-600 dark:text-blue-400"></i>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {cert.description}
                  </p>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Skills Covered:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {cert.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Online Learning */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Continuous Learning
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Online courses and self-directed learning to stay current with technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {onlineCourses.map((platform, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-laptop text-white text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {platform.platform}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {platform.courses.map((course, courseIndex) => (
                      <div key={courseIndex} className="flex items-start">
                        <i className="fas fa-play-circle text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {course}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Philosophy */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Commitment to Lifelong Learning
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Technology evolves rapidly, and I believe in continuous learning to stay ahead.
              I regularly take courses, attend workshops, and work on personal projects to
              expand my knowledge and skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                href="/projects"
                variant="primary"
                size="lg"
                icon="fas fa-code"
              >
                See My Projects
              </Button>
              <Button
                href="/skills"
                variant="outline"
                size="lg"
                icon="fas fa-cogs"
              >
                View My Skills
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
