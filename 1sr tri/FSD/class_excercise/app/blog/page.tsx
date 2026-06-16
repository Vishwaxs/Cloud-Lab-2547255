'use client'

import { motion } from 'framer-motion'
import { Navigation, Footer } from '../components'

const blogPosts = [
  {
    id: 1,
    title: "Getting Started with React and Next.js",
    excerpt: "Learn how to build modern web applications with React and Next.js framework.",
    date: "2024-01-15",
    readTime: "5 min read",
    category: "Web Development",
    image: "/imgs/blog-1.jpg"
  },
  {
    id: 2,
    title: "The Future of Frontend Development",
    excerpt: "Exploring the latest trends and technologies shaping the future of frontend development.",
    date: "2024-01-10",
    readTime: "8 min read",
    category: "Technology",
    image: "/imgs/blog-2.jpg"
  },
  {
    id: 3,
    title: "Building Responsive Designs with Tailwind CSS",
    excerpt: "Master the art of creating beautiful, responsive layouts using Tailwind CSS utility classes.",
    date: "2024-01-05",
    readTime: "6 min read",
    category: "CSS",
    image: "/imgs/blog-3.jpg"
  }
]

export default function Blog() {
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
              Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Thoughts, tutorials, and insights about web development, technology, and more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700">
                  {/* Placeholder for blog post image */}
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Blog Image
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {post.readTime}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                      Read More →
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
