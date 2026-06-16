'use client';

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import Card from "./components/Card";
import { Button } from "./components/Button";

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Vishwas Vashishtha",
  "jobTitle": "Full Stack Developer", 
  "description": "Experienced Full Stack Developer specializing in React, Next.js, TypeScript, and modern web technologies.",
  "url": "https://yourportfolio.com",
  "email": "vishwasvashishtha@mca.christuniversity.in",
  "telephone": "+91 7060200434",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Bangalore",
    "addressRegion": "KA",
    "addressCountry": "IN"
  },
  "sameAs": [
    "https://github.com/Vishwaxs",
    "https://linkedin.com/in/vishwaxss", 
    "https://x.com/vishwaxs?s=11"
  ],
  "knowsAbout": [
    "React",
    "Next.js", 
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Tailwind CSS",
    "Full Stack Development",
    "Web Development"
  ]
};

export default function Home() {
  // Scroll-based animations
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  
  // Refs for in-view animations
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const isServicesInView = useInView(servicesRef, { once: true });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen">
        <motion.section 
          ref={heroRef}
          id="home" 
          className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Background Animation */}
          <motion.div 
            className="absolute inset-0 z-0"
            style={{ y, opacity }}
          >
            <motion.div 
              className="absolute top-20 left-20 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate={isHeroInView ? "visible" : "hidden"}
              >
                <div className="space-y-6">
                  {/* Greeting Badge */}
                  <motion.div 
                    className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.span 
                      className="w-2 h-2 bg-green-400 rounded-full mr-2"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Available for new opportunities</span>
                  </motion.div>
                  
                  <motion.h1 
                    className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight"
                    variants={itemVariants}
                  >
                    Hi, I'm{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                      Vishwas Vashishtha
                    </span>
                  </motion.h1>
                  
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <h2 className="text-3xl lg:text-4xl text-gray-700 dark:text-gray-300 font-semibold">
                      Full Stack Developer
                    </h2>
                    <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                      & Computer Science Student
                    </p>
                  </motion.div>
                  
                  <motion.p 
                    className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed"
                    variants={itemVariants}
                  >
                    I craft exceptional digital experiences with React, Next.js, and modern web technologies.
                    Passionate about clean code, performance, and creating meaningful user experiences.
                  </motion.p>
                </div>

                {/* CTA Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4"
                  variants={itemVariants}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/contact"
                      className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <i className="fas fa-rocket mr-2" />
                      Hire Me
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/projects"
                      className="group inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-base font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <i className="fas fa-folder-open mr-2" />
                      View My Work
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Social Links */}
                <motion.div 
                  className="flex items-center space-x-6"
                  variants={itemVariants}
                >
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Follow me:</span>
                  <motion.a 
                    href="https://github.com/Vishwaxs" 
                    className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <i className="fab fa-github text-xl"></i>
                  </motion.a>
                  <motion.a 
                    href="https://linkedin.com/in/vishwaxss" 
                    className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <i className="fab fa-linkedin text-xl"></i>
                  </motion.a>
                </motion.div>
              </motion.div>
              
              {/* Profile Image Section */}
              <motion.div 
                className="relative flex justify-center lg:justify-end"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <div className="relative w-80 h-80 lg:w-96 lg:h-96 mx-auto lg:mx-0">
                  {/* Gradient Ring */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full opacity-75"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full"></div>
                  
                  {/* Profile Image */}
                  <motion.div 
                    className="absolute inset-4 rounded-full overflow-hidden shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Image
                      src="/imgs/359.JPG"
                      alt="Vishwas Vashishtha - Full Stack Developer profile picture"
                      width={400}
                      height={400}
                      priority
                      className="w-full h-full object-cover object-center"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjM0I4MkY2IiBvcGFjaXR5PSIwLjIiLz4KPC9zdmc+"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          ref={servicesRef}
          className="py-20 bg-white dark:bg-gray-900"
          initial={{ opacity: 0, y: 50 }}
          animate={isServicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={isServicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What I Do</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                I specialize in building modern web applications that are fast, accessible, and user-friendly.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "fas fa-code",
                  title: "Frontend Development",
                  description: "Creating responsive and interactive user interfaces with React, Next.js, and modern CSS frameworks.",
                  color: "blue"
                },
                {
                  icon: "fas fa-server",
                  title: "Backend Development", 
                  description: "Building robust server-side applications with Node.js, databases, and RESTful APIs.",
                  color: "green"
                },
                {
                  icon: "fas fa-mobile-alt",
                  title: "Full Stack Solutions",
                  description: "End-to-end development from concept to deployment, ensuring seamless integration.",
                  color: "purple"
                }
              ].map((service, index) => (
                <motion.div
                  key={service.title}
                  className="text-center p-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isServicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: 0.4 + index * 0.2, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <motion.div 
                    className={`w-16 h-16 bg-${service.color}-100 dark:bg-${service.color}-900 rounded-lg flex items-center justify-center mx-auto mb-4`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <i className={`${service.icon} text-2xl text-${service.color}-600 dark:text-${service.color}-400`}></i>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {service.description}
                  </p>
                  <Link href="/skills" className={`text-${service.color}-600 dark:text-${service.color}-400 hover:text-${service.color}-800 dark:hover:text-${service.color}-300 font-medium`}>
                    View Skills →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
}
        