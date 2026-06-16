'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// import { Analytics } from "../components/Analytics";
import Card from "../components/Card";
import { Button } from "../components/Button";

export default function Projects() {
  const projects = [
    {
      id: 1,
      title: "User Management System",
      description: "A full-stack user management application with CRUD operations, file upload, email confirmation using React, Node.js, and MySQL.",
      image: "/project-user-management.jpg",
      technologies: ["React", "Node.js", "Express", "MySQL", "Multer", "Nodemailer"],
      githubUrl: "https://github.com/Vishwaxs/user-management-system",
      liveUrl: "https://user-management-demo.vercel.app",
      category: "Full Stack",
      featured: true
    },
    {
      id: 2,
      title: "Portfolio Website",
      description: "Personal portfolio website built with Next.js, TypeScript, and Tailwind CSS featuring modern animations and responsive design.",
      image: "/imgs/359.JPG",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
      githubUrl: "https://github.com/Vishwaxs/portfolio",
      liveUrl: "https://vishwas-portfolio.vercel.app",
      category: "Frontend",
      featured: true
    },
    {
      id: 3,
      title: "E-Commerce Platform",
      description: "A comprehensive e-commerce solution with shopping cart, payment integration, and admin dashboard.",
      image: "/project-ecommerce.jpg",
      technologies: ["React", "Node.js", "MongoDB", "Stripe", "Express"],
      githubUrl: "https://github.com/Vishwaxs/ecommerce-platform",
      liveUrl: "https://ecommerce-demo.vercel.app",
      category: "Full Stack",
      featured: true
    },
    {
      id: 4,
      title: "Task Management Tool",
      description: "Collaborative task management application with team features and project tracking.",
      image: "/project-task.jpg",
      technologies: ["Vue.js", "Express.js", "MongoDB", "Socket.io"],
      githubUrl: "https://github.com/Vishwaxs/task-manager",
      liveUrl: "https://tasks-demo.vercel.app",
      category: "Full Stack",
      featured: false
    },
    {
      id: 5,
      title: "Weather App",
      description: "Beautiful weather application with location-based forecasts and interactive maps.",
      image: "/project-weather.jpg",
      technologies: ["React", "OpenWeather API", "MapBox", "Tailwind CSS"],
      githubUrl: "https://github.com/Vishwaxs/weather-app",
      liveUrl: "https://weather-demo.vercel.app",
      category: "Frontend",
      featured: false
    },
    {
      id: 6,
      title: "Blog Platform",
      description: "Modern blog platform with dark mode, animations, and optimized performance.",
      image: "/project-portfolio.jpg",
      technologies: ["Next.js", "Tailwind CSS", "Framer Motion", "Vercel"],
      githubUrl: "https://github.com/Vishwaxs/blog-platform",
      liveUrl: "https://vishwas-blog.vercel.app",
      category: "Frontend",
      featured: false
    }
  ];

  const categories = ["All", "Full Stack", "Frontend", "Mobile"];

  return (
    <>
      {/* <Analytics /> */}
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Projects Hero Section */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Projects</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                A collection of projects showcasing my skills in full-stack development, UI/UX design, and modern web technologies.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Projects</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Here are some of my most notable projects that demonstrate my expertise and passion for development.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
              {projects.filter(project => project.featured).map((project) => (
                <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <i className="fas fa-laptop-code text-4xl text-white"></i>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.title}</h3>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {project.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-4">
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        <i className="fab fa-github mr-1"></i>
                        Code
                      </a>
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        <i className="fas fa-external-link-alt mr-1"></i>
                        Live Demo
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Projects */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">All Projects</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Explore my complete portfolio of projects across different technologies and domains.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-6 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-full transition-all duration-200 border border-gray-200 dark:border-gray-700"
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="h-40 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <i className="fas fa-code text-3xl text-white"></i>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{project.title}</h3>
                      {project.featured && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.slice(0, 2).map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex space-x-4">
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm"
                      >
                        <i className="fab fa-github mr-1"></i>
                        Code
                      </a>
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm"
                      >
                        <i className="fas fa-external-link-alt mr-1"></i>
                        Live
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Interested in Working Together?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              I'm always excited to take on new challenges and create amazing digital experiences. Let's discuss your next project!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Start a Project
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-md transition-colors duration-200"
              >
                <i className="fas fa-user mr-2"></i>
                Learn More About Me
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

