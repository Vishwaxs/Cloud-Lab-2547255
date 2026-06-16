'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CardProps {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  link?: string;
  badge?: string;
  tags?: string[];
  className?: string;
  variant?: 'default' | 'project' | 'achievement';
  onClick?: () => void;
  children?: React.ReactNode;
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0
  }
};

const tagVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.3
    }
  })
};

const Card: React.FC<CardProps> = ({
  title,
  description,
  image,
  imageAlt,
  link,
  badge,
  tags,
  className = '',
  variant = 'default',
  onClick,
  children
}) => {
  const baseClasses = `
    bg-white dark:bg-gray-800 
    rounded-lg shadow-lg 
    overflow-hidden 
    border border-gray-200 dark:border-gray-700
    transition-colors duration-200
  `;

  const content = (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.4 }}
      className={`${baseClasses} ${className}`}
      onClick={onClick}
    >
      {image && (
        <div className="relative overflow-hidden">
          <motion.img
            src={image}
            alt={imageAlt || title}
            className="w-full h-48 object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          {badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-medium"
            >
              {badge}
            </motion.div>
          )}
        </div>
      )}
      
      <div className="p-6">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
        >
          {title}
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-gray-600 dark:text-gray-300 mb-4"
        >
          {description}
        </motion.p>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            {children}
          </motion.div>
        )}

        {tags && tags.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-2 mb-4"
          >
            {tags.map((tag, index) => (
              <motion.span
                key={tag}
                custom={index}
                variants={tagVariants}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
        )}

        {link && !onClick && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href={link}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors"
            >
              Learn more
              <motion.svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  if (link && !onClick) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

// Specialized variant for achievements
export const AchievementCard: React.FC<{
  title: string;
  description: string;
  icon?: string;
  date?: string;
  className?: string;
}> = ({ title, description, icon, date, className = '' }) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.4 }}
      className={`
        bg-gradient-to-br from-blue-50 to-indigo-50 
        dark:from-blue-900/20 dark:to-indigo-900/20 
        border border-blue-200 dark:border-blue-700
        rounded-lg p-6 
        ${className}
      `}
    >
      <div className="flex items-start space-x-4">
        {icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex-shrink-0"
          >
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <i className={icon}></i>
            </div>
          </motion.div>
        )}
        
        <div className="flex-grow">
          <motion.h3
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-lg font-semibold text-gray-900 dark:text-white mb-1"
          >
            {title}
          </motion.h3>
          
          {date && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-blue-600 dark:text-blue-400 mb-2"
            >
              {date}
            </motion.p>
          )}
          
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="text-gray-600 dark:text-gray-300"
          >
            {description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
