import React, { useEffect, useState } from 'react';
import { Check, Zap, Users, TrendingUp, Star, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../utils/analytics';
import SEOHead from '../components/SEOHead';

// PayPal SDK script loader
const loadPayPalScript = (clientId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.onload = () => resolve(window.paypal);
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const PAYPAL_CLIENT_ID = 'AZZbBDtORoBh0ZRh_UeH3dx83MX0qr9Ss2-9seqJmEIfCwcltFWnMfBTKsx0CaehkeD7l7BjxpRZZLix';

  useEffect(() => {
    loadPayPalScript(PAYPAL_CLIENT_ID)
      .then(() => setPaypalLoaded(true))
      .catch(console.error);

    // Track pricing page view
    trackEvent('pricing_page_viewed', {
      user: user?.id || 'anonymous',
      source: 'direct'
    });
  }, [user]);

  useEffect(() => {
    if (paypalLoaded && window.paypal) {
      // Create PayPal subscription button
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(_data: any, actions: any) {
          trackEvent('paypal_subscription_initiated', {
            plan: 'pro_monthly',
            amount: 10,
            user: user?.id || 'anonymous'
          });

          return actions.subscription.create({
            'plan_id': 'P-75E28985M59195446NBCRHOI', // Replace with your PayPal plan ID
            'application_context': {
              'brand_name': 'RecruiterCopilot.ai',
              'locale': 'en-US',
              'shipping_preference': 'NO_SHIPPING',
              'user_action': 'SUBSCRIBE_NOW',
              'payment_method': {
                'payer_selected': 'PAYPAL',
                'payee_preferred': 'IMMEDIATE_PAYMENT_REQUIRED'
              },
              'return_url': `${window.location.origin}/dashboard?success=true`,
              'cancel_url': `${window.location.origin}/pricing?cancelled=true`
            }
          });
        },
        onApprove: function(data: any, _actions: any) {
          trackEvent('paypal_subscription_approved', {
            subscription_id: data.subscriptionID,
            user: user?.id || 'anonymous'
          });

          // Call your backend to activate the subscription
          fetch('/api/subscriptions/activate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              subscription_id: data.subscriptionID,
              plan: 'pro_monthly'
            })
          }).then(() => {
            alert('Subscription activated! Welcome to Pro!');
            window.location.href = '/dashboard?upgraded=true';
          });
        },
        onError: function(err: any) {
          trackEvent('paypal_subscription_error', {
            error: err.message,
            user: user?.id || 'anonymous'
          });
          console.error('PayPal error:', err);
          alert('Payment failed. Please try again.');
        },
        onCancel: function(_data: any) {
          trackEvent('paypal_subscription_cancelled', {
            user: user?.id || 'anonymous'
          });
        }
      }).render('#paypal-button-container');
    }
  }, [paypalLoaded, user]);

  // SEO structured data for Pricing
  const pricingStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "RecruiterCopilot.live AI Resume Matching Tool",
    "description": "AI-powered resume matching and candidate screening software with free and pro plans",
    "url": "https://recruitercopilot.live/pricing",
    "brand": {
      "@type": "Brand",
      "name": "RecruiterCopilot.live"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "description": "Free AI resume matching with limited features",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "category": "Free",
        "eligibleQuantity": {
          "@type": "QuantitativeValue",
          "value": "3",
          "unitText": "analyses per day"
        }
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "description": "Unlimited AI resume matching and advanced features",
        "price": "10",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "billingIncrement": "P1M",
        "category": "Subscription",
        "eligibleQuantity": {
          "@type": "QuantitativeValue",
          "value": "unlimited",
          "unitText": "analyses"
        }
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "247",
      "bestRating": "5"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Sarah Johnson"
        },
        "reviewBody": "Saves us 10+ hours per hire. Best recruitment tool investment."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-12">
      <SEOHead
        title="AI Resume Matching Pricing - Free & Pro Plans Starting at $10/month"
        description="Start free with 3 AI resume matches per day, or upgrade to Pro for unlimited matching at $10/month. Save 10+ hours per hire with our AI-powered candidate screening tool."
        keywords="AI resume matching pricing, recruitment software cost, candidate screening plans, hiring tool subscription, ATS pricing, AI recruitment cost, resume parser pricing, talent acquisition software plans"
        canonical="https://recruitercopilot.live/pricing"
        ogImage="https://recruitercopilot.live/screenshots/pricing.png"
        structuredData={pricingStructuredData}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start matching candidates with AI precision. Upgrade anytime for unlimited access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
              <p className="text-gray-600">Perfect for trying out the platform</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">2 AI matches per day</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Basic candidate analysis</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Email support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Standard match accuracy</span>
              </li>
            </ul>

            <button
              onClick={() => {
                trackEvent('free_plan_selected', { user: user?.id || 'anonymous' });
                window.location.href = '/dashboard';
              }}
              className="w-full py-3 px-6 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-primary-500 p-8 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-primary-600 mb-1">$10</div>
              <p className="text-gray-600">per month • Perfect for active recruiters</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700 font-semibold">Unlimited AI matches</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Advanced candidate insights</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Priority support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">86% match accuracy</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Bulk candidate processing</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Analytics dashboard</span>
              </li>
            </ul>

            {user ? (
              <div id="paypal-button-container" className="w-full"></div>
            ) : (
              <button
                onClick={() => {
                  trackEvent('signup_required_for_pro', { source: 'pricing_page' });
                  window.location.href = '/auth?plan=pro';
                }}
                className="w-full py-3 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign Up for Pro
              </button>
            )}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Choose RecruiterCopilot Pro?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">
                Match candidates to jobs in under 2 seconds with 86% accuracy
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Scale Your Pipeline</h3>
              <p className="text-gray-600 text-sm">
                Process unlimited candidates and build your talent pipeline faster
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Better Results</h3>
              <p className="text-gray-600 text-sm">
                40% higher response rates with AI-generated personalized messages
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes! Cancel your subscription anytime through your account settings. No long-term commitments.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens if I exceed the free plan limit?</h3>
              <p className="text-gray-600">You'll be prompted to upgrade to Pro for unlimited matches. Your account won't be suspended.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my payment information secure?</h3>
              <p className="text-gray-600">Absolutely. We use PayPal for secure payment processing. We never store your payment details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 