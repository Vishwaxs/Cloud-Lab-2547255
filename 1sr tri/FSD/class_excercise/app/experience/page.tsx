'use client';

// import { Analytics } from "../components/Analytics";
import { AchievementCard } from "../components/Card";
import { Button } from "../components/Button";

export default function Experience() {
  const experiences = [
    {
      id: 1,
      title: "Full Stack Developer Intern",
      company: "Tech Startup (Bangalore)",
      location: "Bangalore, Karnataka",
      duration: "Jun 2024 - Aug 2024",
      type: "Internship",
      description: "Developed and maintained web applications using React, Node.js, and MySQL. Collaborated with senior developers on feature implementation and bug fixes.",
      achievements: [
        "Built a customer dashboard that improved user engagement by 35%",
        "Optimized database queries reducing load times by 50%",
        "Implemented automated testing increasing code coverage to 85%"
      ],
      technologies: ["React", "Node.js", "MySQL", "Express.js", "MongoDB"],
      current: false
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: "Freelance Projects",
      location: "Remote",
      duration: "Jan 2024 - May 2024",
      type: "Freelance",
      description: "Designed and developed responsive websites for small to medium businesses using modern web technologies.",
      achievements: [
        "Delivered 8 client projects on time and within budget",
        "Achieved 98% client satisfaction rating",
        "Increased website performance scores by average of 40%"
      ],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Figma"],
      current: false
    },
    {
      id: 3,
      title: "Web Development Team Lead",
      company: "Christ University MCA",
      location: "Bangalore, Karnataka",
      duration: "Sep 2023 - Dec 2023",
      type: "Academic Project",
      description: "Led a team of 5 students in developing the university's new student portal. Managed project timeline and coordinated with different departments.",
      achievements: [
        "Successfully launched the portal serving 1,000+ students",
        "Mentored 4 junior developers in modern web technologies",
        "Implemented agile development practices reducing delivery time by 30%"
      ],
      technologies: ["React", "Express.js", "MongoDB", "JWT", "Material-UI"],
      current: false
    },
    {
      id: 4,
      title: "Software Engineering Student",
      company: "Personal Projects",
      location: "Self-Directed",
      duration: "2023 - Present",
      type: "Personal Development",
      description: "Continuously learning and building projects to enhance technical skills and explore new technologies.",
      achievements: [
        "Built 15+ personal projects showcasing various technologies",
        "Contributed to 5 open-source projects",
        "Maintained a technical blog with 20+ articles"
      ],
      technologies: ["React", "Next.js", "Python", "C", "Java", "Machine Learning"],
      current: true
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Internship':
        return 'fas fa-building';
      case 'Freelance':
        return 'fas fa-laptop';
      case 'Academic Project':
        return 'fas fa-graduation-cap';
      case 'Personal Development':
        return 'fas fa-code';
      default:
        return 'fas fa-briefcase';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Internship':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Freelance':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Academic Project':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'Personal Development':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <>
      {/* <Analytics /> */}
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Professional Experience
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                My journey through internships, freelance projects, and academic experiences
                that have shaped my skills as a developer.
              </p>
            </div>
          </div>
        </section>

        {/* Experience Timeline */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 transform md:-translate-x-px h-full w-0.5 bg-gray-300 dark:bg-gray-600"></div>
              
              <div className="space-y-12">
                {experiences.map((experience, index) => (
                  <div key={experience.id} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:flex-row`}>
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                      <i className={`${getTypeIcon(experience.type)} text-white text-sm`}></i>
                    </div>
                    
                    {/* Content */}
                    <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} ml-12 md:ml-0`}>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        {/* Header */}
                        <div className="mb-4">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(experience.type)}`}>
                              {experience.type}
                            </span>
                            {experience.current && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                Current
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {experience.title}
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                            {experience.company}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            {experience.location}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <i className="fas fa-calendar mr-1"></i>
                            {experience.duration}
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {experience.description}
                        </p>

                        {/* Achievements */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Key Achievements:
                          </h4>
                          <ul className="space-y-1">
                            {experience.achievements.map((achievement, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                                <i className="fas fa-check-circle text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Technologies */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Technologies Used:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {experience.technologies.map((tech, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Skills Gained Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Skills Developed Through Experience
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                The key competencies I've gained through hands-on experience across different roles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AchievementCard
                icon="fas fa-code"
                title="Full Stack Development"
                description="Experience with both frontend and backend technologies, building complete web applications from scratch."
              />
              
              <AchievementCard
                icon="fas fa-users"
                title="Team Leadership"
                description="Led development teams, mentored junior developers, and coordinated cross-functional projects."
              />
              
              <AchievementCard
                icon="fas fa-rocket"
                title="Performance Optimization"
                description="Improved application performance through code optimization, caching strategies, and efficient algorithms."
              />
              
              <AchievementCard
                icon="fas fa-tools"
                title="DevOps & Deployment"
                description="Experience with CI/CD pipelines, containerization, cloud services, and production deployments."
              />
              
              <AchievementCard
                icon="fas fa-handshake"
                title="Client Communication"
                description="Strong communication skills developed through freelance work and stakeholder interactions."
              />
              
              <AchievementCard
                icon="fas fa-chart-line"
                title="Project Management"
                description="Managed project timelines, resources, and deliverables using agile methodologies."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Add Value to Your Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              I'm looking for opportunities to apply my experience and continue growing as a developer.
              Let's discuss how I can contribute to your next project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                href="/contact"
                variant="primary"
                size="lg"
                icon="fas fa-envelope"
              >
                Get In Touch
              </Button>
              <Button
                href="/projects"
                variant="outline"
                size="lg"
                icon="fas fa-folder"
              >
                View My Work
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
