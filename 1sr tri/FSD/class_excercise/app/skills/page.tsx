'use client';

import Image from "next/image";
import Link from "next/link";
import { Analytics } from "../components";

export default function Skills() {
  const skillCategories = [
    {
      title: "Frontend Development",
      icon: "fas fa-paint-brush",
      color: "blue",
      skills: [
        { name: "React", level: 95, icon: "fab fa-react" },
        { name: "Next.js", level: 90, icon: "fas fa-rocket" },
        { name: "TypeScript", level: 88, icon: "fas fa-code" },
        { name: "Tailwind CSS", level: 92, icon: "fas fa-palette" },
        { name: "JavaScript", level: 94, icon: "fab fa-js-square" },
        { name: "HTML5", level: 96, icon: "fab fa-html5" },
        { name: "CSS3", level: 93, icon: "fab fa-css3-alt" },
        { name: "Vue.js", level: 78, icon: "fab fa-vuejs" }
      ]
    },
    {
      title: "Backend Development",
      icon: "fas fa-server",
      color: "green",
      skills: [
        { name: "Node.js", level: 89, icon: "fab fa-node-js" },
        { name: "Express.js", level: 87, icon: "fas fa-route" },
        { name: "Python", level: 82, icon: "fab fa-python" },
        { name: "PostgreSQL", level: 85, icon: "fas fa-database" },
        { name: "MongoDB", level: 83, icon: "fas fa-leaf" },
        { name: "Redis", level: 76, icon: "fas fa-memory" },
        { name: "GraphQL", level: 79, icon: "fas fa-project-diagram" },
        { name: "REST APIs", level: 91, icon: "fas fa-exchange-alt" }
      ]
    },
    {
      title: "Tools & Technologies",
      icon: "fas fa-tools",
      color: "purple",
      skills: [
        { name: "Git", level: 93, icon: "fab fa-git-alt" },
        { name: "Docker", level: 81, icon: "fab fa-docker" },
        { name: "AWS", level: 79, icon: "fab fa-aws" },
        { name: "Vercel", level: 88, icon: "fas fa-cloud" },
        { name: "Figma", level: 84, icon: "fab fa-figma" },
        { name: "VS Code", level: 95, icon: "fas fa-code" },
        { name: "Linux", level: 86, icon: "fab fa-linux" },
        { name: "Webpack", level: 77, icon: "fas fa-cube" }
      ]
    },
    {
      title: "Mobile Development",
      icon: "fas fa-mobile-alt",
      color: "indigo",
      skills: [
        { name: "React Native", level: 83, icon: "fab fa-react" },
        { name: "Flutter", level: 72, icon: "fas fa-mobile" },
        { name: "Expo", level: 81, icon: "fas fa-rocket" },
        { name: "Progressive Web Apps", level: 87, icon: "fas fa-mobile-alt" }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-600 dark:text-blue-400",
        progress: "bg-blue-600"
      },
      green: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-600 dark:text-green-400",
        progress: "bg-green-600"
      },
      purple: {
        bg: "bg-purple-100 dark:bg-purple-900",
        text: "text-purple-600 dark:text-purple-400",
        progress: "bg-purple-600"
      },
      indigo: {
        bg: "bg-indigo-100 dark:bg-indigo-900",
        text: "text-indigo-600 dark:text-indigo-400",
        progress: "bg-indigo-600"
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <>
      <Analytics />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Skills Hero Section */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Skills</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                A comprehensive overview of my technical skills, tools, and technologies I use to build amazing digital experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Skills Overview */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-laptop-code text-2xl text-blue-600 dark:text-blue-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">5+</h3>
                <p className="text-gray-600 dark:text-gray-400">Years of Experience</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-project-diagram text-2xl text-green-600 dark:text-green-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">50+</h3>
                <p className="text-gray-600 dark:text-gray-400">Projects Completed</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-code text-2xl text-purple-600 dark:text-purple-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">20+</h3>
                <p className="text-gray-600 dark:text-gray-400">Technologies</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-users text-2xl text-indigo-600 dark:text-indigo-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">15+</h3>
                <p className="text-gray-600 dark:text-gray-400">Happy Clients</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Skills */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Technical Expertise</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Here's a detailed breakdown of my skills across different domains of software development.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {skillCategories.map((category, categoryIndex) => {
                const colors = getColorClasses(category.color);
                return (
                  <div key={categoryIndex} className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
                    <div className="flex items-center mb-8">
                      <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mr-4`}>
                        <i className={`${category.icon} text-xl ${colors.text}`}></i>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{category.title}</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {category.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <i className={`${skill.icon} text-lg ${colors.text}`}></i>
                              <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{skill.level}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`${colors.progress} h-2 rounded-full transition-all duration-1000 ease-out`}
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Certifications & Learning */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Continuous Learning</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                I believe in continuous learning and staying updated with the latest technologies and best practices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-certificate text-2xl text-yellow-600 dark:text-yellow-400"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AWS Certified</h3>
                <p className="text-gray-600 dark:text-gray-400">Cloud Solutions Architecture</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-graduation-cap text-2xl text-red-600 dark:text-red-400"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">React Specialist</h3>
                <p className="text-gray-600 dark:text-gray-400">Advanced React Development</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-book text-2xl text-green-600 dark:text-green-400"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Always Learning</h3>
                <p className="text-gray-600 dark:text-gray-400">Latest Tech Trends & Best Practices</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Let's leverage these skills to create exceptional digital experiences for your next project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
              >
                <i className="fas fa-rocket mr-2"></i>
                Start a Project
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-md transition-colors duration-200"
              >
                <i className="fas fa-eye mr-2"></i>
                View My Work
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
