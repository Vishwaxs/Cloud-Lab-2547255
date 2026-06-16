'use client';

import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <>
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* About Hero Section */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Me</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Passionate Full Stack Developer with expertise in modern web technologies and a love for creating exceptional digital experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed About Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Journey</h2>
                  <div className="space-y-4 text-gray-600 dark:text-gray-400">
                    <p>
                      I started my development journey over 5 years ago, initially fascinated by the ability to bring ideas to life through code. What began as curiosity quickly evolved into a passion for crafting digital solutions that make a real impact.
                    </p>
                    <p>
                      Throughout my career, I've had the privilege of working with diverse teams and technologies, from startups to enterprise-level applications. Each project has taught me something new and reinforced my belief that great software is built through collaboration, continuous learning, and attention to detail.
                    </p>
                    <p>
                      Today, I specialize in full-stack development with a focus on React, Next.js, and modern web technologies. I'm particularly passionate about performance optimization, user experience, and writing clean, maintainable code.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Drives Me</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-blue-600 dark:text-blue-400 mt-1"></i>
                      <span>Building scalable applications that solve real-world problems</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-blue-600 dark:text-blue-400 mt-1"></i>
                      <span>Staying current with emerging technologies and best practices</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-blue-600 dark:text-blue-400 mt-1"></i>
                      <span>Mentoring fellow developers and contributing to open source</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <i className="fas fa-check-circle text-blue-600 dark:text-blue-400 mt-1"></i>
                      <span>Creating intuitive user experiences through thoughtful design</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative">
                <div className="relative w-full max-w-lg mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl transform rotate-3 opacity-20"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center space-y-6">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden">
                        <Image
                          src="/imgs/359.JPG"
                          alt="Vishwas Vashishtha - Developer Profile"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Vishwas Vashishtha</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">Full Stack Developer</p>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <a href="https://github.com/Vishwaxs" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <i className="fab fa-github text-xl"></i>
                        </a>
                        <a href="https://linkedin.com/in/vishwaxss" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <i className="fab fa-linkedin text-xl"></i>
                        </a>
                        <a href="https://x.com/vishwaxs?s=11" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <i className="fab fa-twitter text-xl"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Timeline */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Experience</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                My professional journey and key milestones in software development.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-300 dark:bg-gray-600"></div>
              
              <div className="space-y-12">
                {/* Experience Item 1 */}
                <div className="relative flex items-center justify-between">
                  <div className="w-5/12 text-right pr-8">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Senior Full Stack Developer</h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">Tech Company Inc.</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">2022 - Present</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-4">
                        Leading development of scalable web applications using React, Next.js, and Node.js. Mentoring junior developers and implementing best practices.
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900"></div>
                  <div className="w-5/12"></div>
                </div>

                {/* Experience Item 2 */}
                <div className="relative flex items-center justify-between">
                  <div className="w-5/12"></div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-white dark:border-gray-900"></div>
                  <div className="w-5/12 pl-8">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Frontend Developer</h3>
                      <p className="text-green-600 dark:text-green-400 font-medium">Startup Solutions</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">2020 - 2022</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-4">
                        Built responsive web applications and improved user experience through modern React development and design systems.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Experience Item 3 */}
                <div className="relative flex items-center justify-between">
                  <div className="w-5/12 text-right pr-8">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Junior Developer</h3>
                      <p className="text-purple-600 dark:text-purple-400 font-medium">Digital Agency</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">2019 - 2020</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-4">
                        Started my professional journey building websites and learning modern development practices in a collaborative environment.
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white dark:border-gray-900"></div>
                  <div className="w-5/12"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Let's Work Together
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              I'm always interested in new opportunities and exciting projects. Let's discuss how we can bring your ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
              >
                <i className="fas fa-envelope mr-2"></i>
                Get In Touch
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-md transition-colors duration-200"
              >
                <i className="fas fa-folder mr-2"></i>
                View Projects
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
  