import { Zap, Users, TrendingUp, CheckCircle, ArrowRight, Star, Clock, Shield, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import SEOHead from '../components/SEOHead';

function LandingPage() {
  const landingPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Resume Matching Tool - Free Candidate Screening Software",
    "description": "Free AI-powered resume matching tool that screens candidates 10x faster with 90%+ accuracy. Upload job descriptions and resumes for instant analysis.",
    "url": "https://recruitercopilot.live",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "RecruiterCopilot.live",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://recruitercopilot.live"
        }
      ]
    }
  };

  const handleCTAClick = (location: string) => {
    trackEvent('cta_clicked', { location, page: 'landing' });
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Free AI Resume Matching Tool - Screen Candidates 10x Faster | RecruiterCopilot.live"
        description="Free AI tool that instantly matches resumes to job descriptions with 90%+ accuracy. Save 10+ hours per hire with automated candidate screening, skills analysis, and match scoring. No signup required to try."
        keywords="free AI resume matching, candidate screening software, resume scanner tool, job description matching, AI recruitment tool, automated hiring, talent acquisition, resume parser, candidate analysis, HR technology, recruitment automation"
        canonical="https://recruitercopilot.live"
        ogType="website"
        structuredData={landingPageStructuredData}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Resume Matching That Actually Works
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload job descriptions and resumes for <strong>instant AI analysis</strong>. 
              Get 90%+ accurate candidate screening in <strong>30 seconds</strong> instead of 3+ hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/dashboard"
                onClick={() => handleCTAClick('hero_primary')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center transition-colors"
              >
                <Zap className="h-5 w-5 mr-2" />
                Try Free - No Signup Required
              </Link>
              <Link
                to="/pricing"
                onClick={() => handleCTAClick('hero_secondary')}
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                View Pricing Plans
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="ml-2">4.9/5 from 247+ users</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
              <div>Trusted by 1,000+ recruiters</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Recruiters Choose Our AI Resume Matching
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stop spending hours manually screening resumes. Our AI does the heavy lifting so you can focus on the best candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Save 10+ Hours Per Hire</h3>
              <p className="text-gray-600">
                Automated resume screening and candidate analysis reduces manual review time from hours to seconds.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">90%+ Matching Accuracy</h3>
              <p className="text-gray-600">
                Advanced AI analyzes skills, experience, and job requirements for highly accurate candidate matching.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Free to Start</h3>
              <p className="text-gray-600">
                No credit card required. Start with 3 free AI analyses per day, upgrade when you need more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How AI Resume Matching Works in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              From upload to analysis in under 30 seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Job Description</h3>
              <p className="text-gray-600">
                Upload your job posting (PDF or DOCX). Our AI instantly extracts requirements, skills, and criteria.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Candidate Resume</h3>
              <p className="text-gray-600">
                Upload candidate's resume. AI parses skills, experience, education, and qualifications automatically.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Instant AI Analysis</h3>
              <p className="text-gray-600">
                Receive match percentage, skills analysis, gaps, and detailed recommendations in seconds.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/dashboard"
              onClick={() => handleCTAClick('how_it_works')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center transition-colors"
            >
              Try It Now - Free <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Features for Modern Recruiting
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to streamline your hiring process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "AI Resume Parsing",
                description: "Automatically extract skills, experience, education, and contact info from any resume format."
              },
              {
                icon: Target,
                title: "Skills Gap Analysis", 
                description: "Identify exactly which required skills candidates have and which ones they're missing."
              },
              {
                icon: TrendingUp,
                title: "Match Percentage Scoring",
                description: "Get precise match scores based on job requirements, experience level, and skills alignment."
              },
              {
                icon: Users,
                title: "Bulk Candidate Processing",
                description: "Screen multiple candidates against the same job description for efficient comparison."
              },
              {
                icon: CheckCircle,
                title: "Instant Recommendations",
                description: "Receive AI-generated insights and recommendations for each candidate evaluation."
              },
              {
                icon: Shield,
                title: "Privacy-First Design",
                description: "Your data stays secure. Demo mode doesn't store personal information permanently."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about AI resume matching
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                question: "How accurate is the AI resume matching?",
                answer: "Our AI achieves 90%+ accuracy by analyzing multiple factors including skills match, experience alignment, education relevance, and cultural fit indicators using advanced natural language processing."
              },
              {
                question: "What file formats do you support?",
                answer: "We support PDF and DOCX formats for both job descriptions and resumes. Our AI can extract text from most standard document layouts and formats."
              },
              {
                question: "How much time does this actually save?",
                answer: "Recruiters typically save 10+ hours per hire. Manual resume screening takes 3-5 hours per position, while our AI provides comprehensive analysis in under 30 seconds."
              },
              {
                question: "Is the free plan really free?",
                answer: "Yes! The free plan includes 3 AI analyses per day with full access to matching scores, skills analysis, and recommendations. No credit card required to start."
              },
              {
                question: "How does the AI analyze soft skills and cultural fit?",
                answer: "Our AI analyzes language patterns, career progression, and contextual clues in resumes to assess communication style, leadership experience, and potential cultural alignment."
              },
              {
                question: "Can I use this for bulk candidate screening?",
                answer: "Absolutely! Upload one job description and then screen multiple candidates against it. The Pro plan supports unlimited analyses for efficient batch processing."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 1,000+ recruiters already using AI to find better candidates faster
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              onClick={() => handleCTAClick('final_cta_primary')}
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center transition-colors"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Free Analysis Now
            </Link>
            <Link
              to="/pricing"
              onClick={() => handleCTAClick('final_cta_secondary')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              View All Plans
            </Link>
          </div>
          
          <p className="text-blue-100 text-sm mt-4">
            No credit card required • 3 free analyses daily • Upgrade anytime
          </p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage; 