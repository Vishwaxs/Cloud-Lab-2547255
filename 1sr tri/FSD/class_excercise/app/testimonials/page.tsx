'use client'

import { motion } from 'framer-motion'
import { Navigation, Footer } from '../components'

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Frontend Developer",
    company: "TechCorp Inc.",
    image: "/imgs/testimonial-1.jpg",
    content: "Working with Vishw was an incredible experience. Their attention to detail and technical expertise helped us deliver our project ahead of schedule."
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Product Manager",
    company: "StartupXYZ",
    image: "/imgs/testimonial-2.jpg",
    content: "Vishw's problem-solving skills and dedication to quality made them an invaluable team member. I would definitely work with them again."
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "UX Designer",
    company: "Design Studio",
    image: "/imgs/testimonial-3.jpg",
    content: "The collaboration with Vishw was seamless. They understood our design requirements perfectly and implemented them flawlessly."
  },
  {
    id: 4,
    name: "David Kumar",
    role: "CTO",
    company: "InnovateLab",
    image: "/imgs/testimonial-4.jpg",
    content: "Vishw's technical skills and professionalism are top-notch. They delivered high-quality code that exceeded our expectations."
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Project Manager",
    company: "Digital Agency",
    image: "/imgs/testimonial-5.jpg",
    content: "It was a pleasure working with Vishw. Their communication skills and ability to meet deadlines made our project a success."
  },
  {
    id: 6,
    name: "Alex Martinez",
    role: "Full Stack Developer",
    company: "WebSolutions",
    image: "/imgs/testimonial-6.jpg",
    content: "Vishw's expertise in modern web technologies and best practices helped elevate our entire development process."
  }
]

export default function Testimonials() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Testimonials
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              What people say about working with me
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-4">
                    {/* Placeholder for profile image */}
                    <span className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {testimonial.role}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
                
                <blockquote className="text-gray-600 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
