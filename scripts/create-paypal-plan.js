const axios = require('axios');

// Your PayPal credentials
const PAYPAL_CLIENT_ID = 'AZZbBDtORoBh0ZRh_UeH3dx83MX0qr9Ss2-9seqJmEIfCwcltFWnMfBTKsx0CaehkeD7l7BjxpRZZLix';

// ⚠️ REPLACE THIS WITH YOUR ACTUAL SECRET KEY FROM PAYPAL DASHBOARD
const PAYPAL_CLIENT_SECRET = 'EPNr9GfqnB_vSZrUoSGVWvL7rmy5mEVblIXDGXDaFIE3SMfNohI-oJKbFzh3HLMvNtCTCV7e-8df_v_X'; 

// Use sandbox for testing, change to https://api-m.paypal.com for production
const PAYPAL_BASE_URL = 'https://api-m.paypal.com';

// Step 1: Get Access Token
async function getAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(`${PAYPAL_BASE_URL}/v1/oauth2/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

// Step 2: Create Product
async function createProduct(accessToken) {
  try {
    const productData = {
      name: "RecruiterCopilot Pro",
      description: "AI-powered candidate matching for recruiters",
      type: "SERVICE",
      category: "SOFTWARE"
    };

    const response = await axios.post(`${PAYPAL_BASE_URL}/v1/catalogs/products`, productData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    console.log('✅ Product created:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error creating product:', error.response?.data || error.message);
    throw error;
  }
}

// Step 3: Create Subscription Plan
async function createPlan(accessToken, productId) {
  try {
    const planData = {
      product_id: productId,
      name: "Pro Monthly Plan",
      description: "Unlimited AI matches for active recruiters",
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 = unlimited
          pricing_scheme: {
            fixed_price: {
              value: "10.00",
              currency_code: "USD"
            }
          }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0.00",
          currency_code: "USD"
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      },
      taxes: {
        percentage: "0.00",
        inclusive: false
      }
    };

    const response = await axios.post(`${PAYPAL_BASE_URL}/v1/billing/plans`, planData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    console.log('🎉 SUCCESS! Your Plan ID is:', response.data.id);
    console.log('📋 Copy this Plan ID to your pricing page:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error creating plan:', error.response?.data || error.message);
    throw error;
  }
}

// Main function
async function createPayPalPlan() {
  try {
    console.log('🚀 Creating PayPal subscription plan...');
    
    // Step 1: Get access token
    console.log('1️⃣ Getting access token...');
    const accessToken = await getAccessToken();
    
    // Step 2: Create product
    console.log('2️⃣ Creating product...');
    const productId = await createProduct(accessToken);
    
    // Step 3: Create plan
    console.log('3️⃣ Creating subscription plan...');
    const planId = await createPlan(accessToken, productId);
    
    console.log('\n✅ DONE! Update your pricing page with this Plan ID:');
    console.log(`Plan ID: ${planId}`);
    
  } catch (error) {
    console.error('❌ Failed to create plan:', error.message);
  }
}

// Run the script
createPayPalPlan(); 