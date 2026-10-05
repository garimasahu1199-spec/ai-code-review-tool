import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Github,
  FileCode2,
} from "lucide-react";
import Button from "../components/Button";

const Home = () => {
  const features = [
    {
      icon: Code2,
      title: "Multi-Language Support",
      description:
        "Analyze JavaScript, Python, Java, C++, and more with language-specific insights.",
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Shield,
      title: "Security Analysis",
      description:
        "Detect vulnerabilities, security risks, and potential exploits in your code.",
      color: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: Zap,
      title: "Performance Optimization",
      description:
        "Get suggestions to improve execution speed and reduce memory usage.",
      color: "from-amber-500/20 to-orange-500/20",
    },
    {
      icon: BarChart3,
      title: "Code Quality Metrics",
      description:
        "Receive detailed scores and actionable feedback on code quality.",
      color: "from-purple-500/20 to-pink-500/20",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-20 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Powered by Advanced AI
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              AI Code
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
              Review Tool
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Analyze, optimize, and improve your code instantly with AI-powered
            insights
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/editor">
              <Button size="lg" className="gap-2">
                Start Reviewing
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="outline" size="lg">
                View History
              </Button>
            </Link>
          </motion.div>

          {/* Code Preview */}
          <motion.div variants={itemVariants} className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <div className="ml-4 text-xs text-slate-500 font-mono">
                  example.js
                </div>
              </div>
              <pre className="text-left text-sm font-mono text-slate-400 overflow-x-auto">
                <code>{`function analyzeCode(code) {
  // AI-powered analysis
  const issues = detectIssues(code);
  const suggestions = generateSuggestions(code);
  
  return {
    score: calculateScore(code),
    improvements: suggestions,
    security: scanVulnerabilities(code)
  };
}`}</code>
              </pre>
            </div>
          </motion.div>
        </motion.div>
      </section>

     {/* Features Section */}
<section className="py-20 border-t border-slate-800/50">
  <div className="max-w-6xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-16"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Everything you need for better code
      </h2>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto">
        Comprehensive code analysis tools to help you write cleaner,
        safer, and more efficient code.
      </p>
    </motion.div>

    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          variants={itemVariants}
          className="group relative h-full"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />
          <div className="relative h-full p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all duration-300 flex flex-col">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <feature.icon className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 flex-shrink-0">
              {feature.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed flex-grow">
              {feature.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-primary-400" />
            <span className="font-semibold">AI Code Review Tool</span>
          </div>
          <p className="text-slate-500 text-sm">
            Built @2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
