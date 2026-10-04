export const profile = {
  name: 'Yash Patil',
  email: 'yashsatishpatil25@gmail.com',
  phone: '+91 83064 84289',
  phoneHref: 'tel:+918306484289',
  github: 'https://github.com/Yashpatil25',
  linkedin: 'https://www.linkedin.com/in/yash-patil-43439a286/',
  resume: `${import.meta.env.BASE_URL}Yash_Patil_Resume.pdf`,
}

export const nav = [
  ['about', 'About'],
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['research', 'Research'],
  ['awards', 'Awards'],
  ['contact', 'Contact'],
]

export const stats = [
  { value: 2, label: 'Industry roles' },
  { value: 1, label: 'Springer publication' },
  { value: 120, suffix: '+', label: 'Teams outranked at Deloitte' },
  { value: 3, label: 'Hackathon podiums & top finishes' },
]

export const skills = [
  ['Analytics & Stats', ['Statistical Modeling', 'Predictive Analytics', 'Time-Series Forecasting', 'Monte Carlo Simulation', 'VaR / CVaR', 'Data Visualization']],
  ['Optimization', ['Particle Swarm Optimization', 'Surrogate-Assisted Optimization', 'Feature Selection']],
  ['ML & GenAI', ['Scikit-Learn', 'TensorFlow', 'Deep Learning', 'Reinforcement Learning', 'LLM Agents', 'Agentic Workflows', 'Prompt-Injection Defense']],
  ['Languages & Data', ['Python', 'NumPy', 'Pandas', 'SQL', 'C++', 'JavaScript', 'MongoDB']],
  ['Engineering', ['Node.js', 'Express.js', 'REST APIs', 'React.js', 'Next.js', 'Git', 'Linux', 'Postman', 'Claude Code']],
]

export const experience = [
  {
    date: 'May — Jul 2026',
    role: 'Backend Developer Intern',
    org: 'Jio Platforms Limited (JioCX)',
    place: 'Mumbai, India',
    points: [
      'Built scalable REST APIs and backend services powering customer-engagement and digital-support platforms.',
      'Redesigned MongoDB schemas and queries, improving query performance and application responsiveness.',
      'Implemented authentication, authorization, validation and centralized error handling; built reusable logging, monitoring and security middleware.',
      'Worked with cross-functional engineering teams in Agile sprints on production debugging, performance tuning and deployments.',
    ],
    tags: ['Node.js', 'Express', 'MongoDB', 'REST', 'Auth', 'Middleware'],
  },
  {
    date: 'Dec 2025 — Jan 2026',
    role: 'Software Engineer',
    org: 'Samarth Bharat Vyaaspeeth',
    place: 'India',
    points: [
      'Designed Joi-based validation schemas and reusable middleware across APIs, forms and onboarding flows in Next.js / Node.js apps, strengthening data integrity and security.',
    ],
    tags: ['Next.js', 'Node.js', 'Joi', 'Validation'],
  },
]

export const projects = [
  {
    viz: 'market',
    title: 'Commodity Research Prediction System',
    kicker: 'Quant · Forecasting · Risk',
    points: [
      'End-to-end commodity analytics pipeline for price forecasting and risk assessment on large-scale market data.',
      'Time-series predictive models with engineered volatility, trend and supply-demand indicators.',
      'Monte Carlo scenario analysis with VaR / CVaR estimation and automated alerts on market-regime shifts.',
    ],
    tags: ['Python', 'Pandas', 'Time-Series', 'Monte Carlo', 'VaR / CVaR'],
    repo: 'https://github.com/Yashpatil25/Maze',
  },
  {
    viz: 'vanguard',
    title: 'Vanguard',
    kicker: 'Intent-aware security for autonomous financial agents',
    points: [
      'Runtime authorization layer for AI agents: Intent Passports, spending policies and deterministic risk scoring with fail-closed ALLOW / REVIEW / BLOCK decisions.',
      'Defends against prompt injection, tool poisoning, duplicate payments, velocity anomalies and behavioral drift; quarantines agents on repeated suspicious activity.',
      'Razorpay (test mode) integration with HMAC-signed webhooks and idempotency, validated by an Attack Battlebox test suite.',
    ],
    tags: ['LLM Agents', 'Security', 'Razorpay', 'HMAC', 'Node.js'],
    repo: 'https://github.com/Yashpatil25/Vanguard',
  },
  {
    viz: 'chain',
    title: 'Tarang',
    kicker: 'Carbon-credit verification platform',
    points: [
      'AI-powered verification system that uses machine learning to assess the legitimacy of carbon-offset projects.',
      'Solidity smart-contract infrastructure for carbon-credit tokenization and trading, improving transparency and traceability across the transaction lifecycle.',
      'Full-stack architecture with React, Node.js, MongoDB and Solidity.',
    ],
    tags: ['Machine Learning', 'Solidity', 'React', 'Node.js', 'MongoDB'],
    repo: 'https://github.com/Yashpatil25/marketplace-platform',
  },
]

export const awards = [
  { big: 'Top Team', text: 'Among 120+ shortlisted teams', where: 'Deloitte Capstone Project Challenge 2025' },
  { big: '2nd', text: 'Place overall', where: 'Avinya Eco-Tech Hackathon, IIT Guwahati' },
  { big: 'Top 5', text: 'Finalist', where: 'HackX, Manipal University Jaipur' },
  { big: 'Co-Founder', text: 'Technology startup', where: 'Building AI-driven solutions' },
]

export const marquee = ['Time-Series Forecasting', 'Monte Carlo', 'VaR / CVaR', 'Particle Swarm Optimization', 'LLM Agents', 'Prompt-Injection Defense', 'REST APIs', 'MongoDB', 'Risk Modeling', 'Reinforcement Learning']
