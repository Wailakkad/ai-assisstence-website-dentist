const axios = require('axios');

// Dental practice information and knowledge base
const DENTAL_CONTEXT = {
    practice: {
        name: "SmileCare Dental Clinic",
        address: "123 Main Street, Downtown, City 12345",
        phone: "(555) 123-4567",
        email: "info@smilecare.com",
        website: "www.smilecare.com",
        hours: {
            monday: "8:00 AM - 6:00 PM",
            tuesday: "8:00 AM - 6:00 PM",
            wednesday: "8:00 AM - 6:00 PM",
            thursday: "8:00 AM - 6:00 PM",
            friday: "8:00 AM - 5:00 PM",
            saturday: "9:00 AM - 2:00 PM",
            sunday: "Closed"
        },
        emergencyLine: "(555) 123-HELP"
    },
    
    services: [
        {
            name: "General Dentistry",
            description: "Routine cleanings, exams, fillings, and preventive care",
            price: "Starting at $150"
        },
        {
            name: "Cosmetic Dentistry",
            description: "Teeth whitening, veneers, bonding, and smile makeovers",
            price: "Consultation required"
        },
        {
            name: "Orthodontics",
            description: "Traditional braces and Invisalign clear aligners",
            price: "Starting at $3,500"
        },
        {
            name: "Oral Surgery",
            description: "Tooth extractions, wisdom teeth removal, and dental implants",
            price: "Starting at $200"
        },
        {
            name: "Pediatric Dentistry",
            description: "Specialized care for children and teenagers",
            price: "Starting at $120"
        },
        {
            name: "Emergency Dental Care",
            description: "Same-day treatment for dental emergencies",
            price: "Starting at $100"
        }
    ],
    
    commonConditions: [
        {
            condition: "Tooth Pain",
            causes: ["Cavities", "Cracked tooth", "Abscess", "Gum disease"],
            treatment: "Pain relief, antibiotics if needed, followed by appropriate dental treatment"
        },
        {
            condition: "Gum Disease",
            symptoms: ["Bleeding gums", "Bad breath", "Swollen gums", "Loose teeth"],
            treatment: "Deep cleaning, antibiotics, improved oral hygiene routine"
        },
        {
            condition: "Cavities",
            prevention: ["Regular brushing", "Flossing daily", "Fluoride toothpaste", "Regular checkups"],
            treatment: "Fillings, crowns, or root canal depending on severity"
        }
    ],
    
    oralHealthTips: [
        "Brush your teeth at least twice a day with fluoride toothpaste",
        "Floss daily to remove plaque between teeth",
        "Limit sugary and acidic foods and drinks",
        "Don't use your teeth as tools to open packages",
        "Replace your toothbrush every 3-4 months",
        "Visit your dentist every 6 months for regular checkups",
        "Quit smoking and limit alcohol consumption",
        "Drink plenty of water throughout the day"
    ],
    
    insurance: {
        accepted: ["Delta Dental", "Cigna", "Aetna", "MetLife", "Blue Cross Blue Shield", "Humana"],
        financing: "CareCredit and flexible payment plans available",
        newPatientOffer: "20% off first visit for new patients without insurance"
    }
};

// Function to categorize query type and determine response style
const analyzeQueryType = (message) => {
    const lowerMessage = message.toLowerCase();
    
    const categories = {
        greeting: {
            keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
            responseStyle: 'short',
            maxTokens: 200
        },
        simple_info: {
            keywords: ['hours', 'phone', 'address', 'location', 'contact', 'when open'],
            responseStyle: 'short',
            maxTokens: 300
        },
        appointment: {
            keywords: ['appointment', 'schedule', 'book', 'availability', 'when can'],
            responseStyle: 'medium',
            maxTokens: 400
        },
        emergency: {
            keywords: ['emergency', 'urgent', 'pain', 'bleeding', 'swollen', 'hurt'],
            responseStyle: 'medium_urgent',
            maxTokens: 500
        },
        medical_condition: {
            keywords: ['cavity', 'gum disease', 'toothache', 'symptoms', 'treatment', 'diagnosis'],
            responseStyle: 'detailed',
            maxTokens: 700
        },
        services_detailed: {
            keywords: ['services', 'procedures', 'treatment options', 'what do you offer', 'cosmetic', 'orthodontics'],
            responseStyle: 'detailed',
            maxTokens: 600
        },
        insurance_payment: {
            keywords: ['insurance', 'payment', 'cost', 'price', 'financing', 'coverage'],
            responseStyle: 'medium',
            maxTokens: 450
        },
        oral_health_education: {
            keywords: ['how to', 'prevention', 'tips', 'care', 'hygiene', 'brush', 'floss'],
            responseStyle: 'detailed',
            maxTokens: 650
        }
    };
    
    for (const [category, config] of Object.entries(categories)) {
        if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
            return { category, ...config };
        }
    }
    
    return { category: 'general', responseStyle: 'medium', maxTokens: 400 };
};

// Function to create response structure guidelines
const getResponseStructureGuidelines = (responseStyle) => {
    const structures = {
        short: `
RESPONSE STRUCTURE (Keep it brief and friendly):
- Start with a direct answer (1-2 sentences)
- Provide essential information only
- End with a simple call-to-action if needed
- NO excessive emojis or promotional language
- Maximum 3-4 lines total`,

        medium: `
RESPONSE STRUCTURE (Balanced and helpful):
- Direct answer to the question (2-3 sentences)
- Relevant additional information if helpful
- Clear next steps or contact information
- Professional tone, minimal emojis
- Use paragraphs for readability`,

        medium_urgent: `
RESPONSE STRUCTURE (Urgent but calm):
- Immediate guidance for the concern
- Emergency contact information
- Brief reassurance
- Clear next steps
- Calm, professional tone`,

        detailed: `
RESPONSE STRUCTURE (Comprehensive but organized):
- Clear introduction addressing the question
- Main information in 2-3 organized paragraphs
- Use bullet points ONLY when listing multiple items
- Conclude with actionable advice
- Professional, educational tone
- Include relevant contact info when appropriate`
    };
    
    return structures[responseStyle] || structures.medium;
};

// Function to determine if the message is dental-related
const isDentalRelated = (message) => {
    const dentalKeywords = [
        'tooth', 'teeth', 'dental', 'dentist', 'gum', 'gums', 'cavity', 'cavities',
        'filling', 'crown', 'root canal', 'extraction', 'cleaning', 'checkup',
        'pain', 'ache', 'bleeding', 'whitening', 'braces', 'orthodontic',
        'appointment', 'emergency', 'insurance', 'oral', 'mouth', 'bite',
        'wisdom', 'implant', 'veneer', 'fluoride', 'plaque', 'tartar',
        'gingivitis', 'periodontitis', 'hygiene', 'floss', 'brush'
    ];
    
    const lowerMessage = message.toLowerCase();
    return dentalKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Function to get relevant dental information based on user query
const getRelevantDentalInfo = (message) => {
    const lowerMessage = message.toLowerCase();
    const relevantInfo = [];
    
    // Check for service inquiries
    DENTAL_CONTEXT.services.forEach(service => {
        if (lowerMessage.includes(service.name.toLowerCase()) || 
            service.description.toLowerCase().split(' ').some(word => lowerMessage.includes(word))) {
            relevantInfo.push(`${service.name}: ${service.description} (${service.price})`);
        }
    });
    
    // Check for condition-related queries
    DENTAL_CONTEXT.commonConditions.forEach(condition => {
        if (lowerMessage.includes(condition.condition.toLowerCase())) {
            relevantInfo.push(`About ${condition.condition}: ${JSON.stringify(condition)}`);
        }
    });
    
    // Check for hours/contact info
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
        relevantInfo.push(`Office Hours: ${JSON.stringify(DENTAL_CONTEXT.practice.hours)}`);
    }
    
    if (lowerMessage.includes('phone') || lowerMessage.includes('call') || lowerMessage.includes('contact')) {
        relevantInfo.push(`Contact: Phone ${DENTAL_CONTEXT.practice.phone}, Email ${DENTAL_CONTEXT.practice.email}`);
    }
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
        relevantInfo.push(`Emergency Line: ${DENTAL_CONTEXT.practice.emergencyLine}`);
    }
    
    if (lowerMessage.includes('insurance') || lowerMessage.includes('payment')) {
        relevantInfo.push(`Insurance: We accept ${DENTAL_CONTEXT.insurance.accepted.join(', ')}. ${DENTAL_CONTEXT.insurance.financing}`);
    }
    
    return relevantInfo.length > 0 ? relevantInfo.join('\n\n') : '';
};

// Enhanced system prompt creation
const createDentalSystemPrompt = (queryAnalysis, relevantInfo) => {
    return `You are a professional dental assistant AI for ${DENTAL_CONTEXT.practice.name}. 

PRACTICE INFORMATION:
- Name: ${DENTAL_CONTEXT.practice.name}
- Address: ${DENTAL_CONTEXT.practice.address}
- Phone: ${DENTAL_CONTEXT.practice.phone}
- Email: ${DENTAL_CONTEXT.practice.email}
- Website: ${DENTAL_CONTEXT.practice.website}
- Emergency Line: ${DENTAL_CONTEXT.practice.emergencyLine}

OFFICE HOURS:
${Object.entries(DENTAL_CONTEXT.practice.hours).map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`).join('\n')}

SERVICES OFFERED:
${DENTAL_CONTEXT.services.map(service => `- ${service.name}: ${service.description} (${service.price})`).join('\n')}

INSURANCE & PAYMENT:
- Accepted Insurance: ${DENTAL_CONTEXT.insurance.accepted.join(', ')}
- ${DENTAL_CONTEXT.insurance.financing}
- Special Offer: ${DENTAL_CONTEXT.insurance.newPatientOffer}

${relevantInfo ? `RELEVANT INFORMATION FOR THIS QUERY:\n${relevantInfo}\n` : ''}

RESPONSE STYLE: ${queryAnalysis.responseStyle.toUpperCase()}
${getResponseStructureGuidelines(queryAnalysis.responseStyle)}

IMPORTANT GUIDELINES:
1. Match your response length to the query complexity - don't over-explain simple questions
2. Use a professional, helpful tone without excessive enthusiasm
3. Avoid repetitive promotional language
4. Structure your response clearly with proper paragraphs
5. Only include contact information when directly relevant
6. For medical concerns, always recommend professional consultation
7. Be empathetic but concise for urgent/emergency situations
8. Don't start every response with "Hello! Welcome to SmileCare!"

TONE GUIDELINES:
- Greetings: Warm but brief
- Information requests: Direct and informative  
- Medical questions: Professional and educational
- Emergencies: Calm and reassuring
- Appointments: Helpful and clear

Remember: Quality over quantity. Give the right amount of information for each query type.`;
};

const ChatController = async (req, res) => {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Invalid message format' });
    }

    try {
        const openRouterApiKey = process.env.OpenRouter_APIKEY;
        
        // Analyze the query to determine response style and length
        const queryAnalysis = analyzeQueryType(message);
        
        // Check if the message is dental-related
        const isDental = isDentalRelated(message);
        
        // Get relevant dental information
        const relevantInfo = getRelevantDentalInfo(message);
        
        // Create enhanced system prompt
        const systemPrompt = createDentalSystemPrompt(queryAnalysis, relevantInfo);
        
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'deepseek/deepseek-r1-0528:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.6, // Slightly lower for more consistent responses
                max_tokens: queryAnalysis.maxTokens, // Dynamic token limit
                top_p: 0.9,
                frequency_penalty: 0.1 // Reduce repetitive responses
            },
            {
                headers: {
                    'Authorization': `Bearer ${openRouterApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': DENTAL_CONTEXT.practice.website,
                    'X-Title': DENTAL_CONTEXT.practice.name
                }
            }
        );

        res.status(200).json({
            message: response.data.choices[0].message.content,
            provider: 'openrouter',
            model: 'deepseek/deepseek-r1-0528:free',
            context: 'dental_assistant',
            practice: DENTAL_CONTEXT.practice.name,
            queryType: queryAnalysis.category,
            responseStyle: queryAnalysis.responseStyle,
            maxTokens: queryAnalysis.maxTokens
        });
        
    } catch (error) {
        console.error('Error with OpenRouter API:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to get response from dental AI assistant',
            details: error.response?.data || error.message
        });
    }
};

module.exports = ChatController;