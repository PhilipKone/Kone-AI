/**
 * Kone Academy Ecosystem - Subdomain Grounding Knowledge Base
 * Powers intelligent RAG and contextual multi-subdomain understanding in Kone AI.
 */

export interface SubdomainProfile {
  id: string;
  name: string;
  url: string;
  tagline: string;
  description: string;
  keyOfferings: string[];
  targetAudience: string;
  sampleQuestions: string[];
}

export const SUBDOMAIN_PROFILES: Record<string, SubdomainProfile> = {
  all: {
    id: 'all',
    name: 'All Academy Subdomains',
    url: 'https://koneacademy.io',
    tagline: 'Comprehensive Kone Academy Global Ecosystem',
    description: 'The complete multi-domain educational and technology ecosystem spanning kids robotics, pro coding, enterprise consulting, digital agency, hardware lab, e-commerce shop, and agritech.',
    keyOfferings: [
      'Comprehensive curriculum spanning ages 6 to professional industry engineers',
      'Unified single sign-on across all academy divisions',
      'Hands-on physical kits seamlessly integrated with digital learning platforms'
    ],
    targetAudience: 'Students, parents, educators, software engineers, and enterprise clients',
    sampleQuestions: [
      'What divisions make up the Kone Academy ecosystem?',
      'Which subdomain should I start with as a beginner?',
      'How do the physical kits connect to the online academy?'
    ]
  },

  kids: {
    id: 'kids',
    name: 'Kone Kids',
    url: 'https://kids.koneacademy.io',
    tagline: 'STEM, Robotics & Creative Coding for Young Minds (Ages 6-16)',
    description: 'Specialized youth academy focused on making robotics, electronics, and coding joyful and intuitive through hands-on tactile learning, block programming, and gamified challenges.',
    keyOfferings: [
      'Scratch & Visual Block Coding: Gamified storytelling, sprite animation, and arcade game design',
      'Introductory Robotics: Safe plug-and-play micro:bit, LEGO-compatible, and beginner Arduino kits',
      'AI & Machine Learning for Kids: Visual computer vision games and voice-controlled smart toys',
      'Robotics Capstones: Line-follower bots, obstacle-avoidance rovers, and smart home dioramas'
    ],
    targetAudience: 'Kids ages 6-16, parents, elementary/middle school STEM teachers',
    sampleQuestions: [
      'What robotics programs are suitable for an 8-year-old on Kone Kids?',
      'How does block coding transition into Python for young learners?',
      'What equipment or kits are needed for the Kone Kids robotics courses?'
    ]
  },

  code: {
    id: 'code',
    name: 'Kone Code',
    url: 'https://code.koneacademy.io',
    tagline: 'Professional Software Engineering & Full-Stack Development',
    description: 'Rigorous, industry-grade software engineering curriculum covering modern web development, backend architectures, data structures, algorithms, and cloud deployment.',
    keyOfferings: [
      'Full-Stack Web Development: React, TypeScript, Next.js, Node.js, Tailwind CSS',
      'Systems & Backend Programming: Python, Go, C++, microservices, REST & GraphQL APIs',
      'Algorithms & Technical Interview Prep: Data structures, time complexity optimization, system design',
      'DevOps & Deployment: Docker, CI/CD pipelines, GitHub Actions, cloud orchestration'
    ],
    targetAudience: 'Aspiring software engineers, college students, career switchers, professional developers',
    sampleQuestions: [
      'What is the recommended roadmap to become a full-stack developer on Kone Code?',
      'How does Kone Code teach TypeScript and modern React patterns?',
      'Can you help me prepare for a coding interview on algorithms?'
    ]
  },

  consult: {
    id: 'consult',
    name: 'Kone Consult',
    url: 'https://consult.koneacademy.io',
    tagline: 'Enterprise Technology Consulting & AI Transformation',
    description: 'Strategic advisory and engineering consulting partner for businesses seeking to integrate custom artificial intelligence, cloud architectures, and IoT hardware solutions.',
    keyOfferings: [
      'Custom Generative AI & LLM Deployment: Enterprise chatbots, knowledge base RAG, fine-tuned private models',
      'Digital Transformation: Legacy system migration, cloud modernization (AWS/GCP/Azure)',
      'Embedded & IoT Systems Architecture: Industrial sensor networks, telemetry pipelines, firmware review',
      'Technical Due Diligence & Architecture Audits: Scalability, security, and performance analysis'
    ],
    targetAudience: 'CTOs, enterprise executives, startup founders, innovation managers',
    sampleQuestions: [
      'What consulting services does Kone Consult provide for AI integration?',
      'How does Kone Consult help enterprises securely deploy private LLMs?',
      'Can Kone Consult review our IoT firmware architecture before production?'
    ]
  },

  digital: {
    id: 'digital',
    name: 'Kone Digital',
    url: 'https://digital.koneacademy.io',
    tagline: 'Full-Service Digital Product Studio & Creative Agency',
    description: 'High-craft design and digital production studio crafting world-class digital products, brand identities, UI/UX systems, and interactive web experiences.',
    keyOfferings: [
      'Product UI/UX Design: User journey mapping, interactive Figma prototypes, design systems',
      'Brand Identity: Dynamic logos, brand books, typography, visual guidelines',
      'Motion & 3D Interactive Web: Framer Motion, Three.js, micro-interactions, responsive design',
      'Growth Strategy & Digital Presence: Conversion rate optimization, SEO architecture'
    ],
    targetAudience: 'Startups, digital product teams, marketing directors, brands',
    sampleQuestions: [
      'What UI/UX design deliverables does Kone Digital produce?',
      'How does Kone Digital approach building responsive design systems?',
      'Can Kone Digital help rebrand our technology platform?'
    ]
  },

  lab: {
    id: 'lab',
    name: 'Kone Lab',
    url: 'https://lab.koneacademy.io',
    tagline: 'Hardware Innovation, R&D & Experimental Prototyping',
    description: 'Experimental laboratory advancing embedded electronics, physical computing, autonomous mobile robotics, and cutting-edge sensor integration.',
    keyOfferings: [
      'Microcontroller Firmware: FreeRTOS, ESP32 multi-core tasks, Arduino AVR, STM32 HAL',
      'Sensor Telemetry & RF Mesh: LoRa, ESP-NOW, MQTT, BLE beacons, ultrasonic & LiDAR mapping',
      'Closed-Loop Control Theory: PID trajectory steering, PWM velocity tuning, motor encoder feedback',
      'Rapid Hardware Prototyping: Custom PCB schematics, breadboard verification, 3D printed mechanical chassis'
    ],
    targetAudience: 'Hardware engineers, robotics researchers, makers, IoT innovators',
    sampleQuestions: [
      'What experimental hardware projects are currently hosted in Kone Lab?',
      'How do I implement non-blocking sensor loops on an ESP32 in Kone Lab?',
      'Can you explain the PID motor tuning methodology used in Kone Lab?'
    ]
  },

  shop: {
    id: 'shop',
    name: 'Kone Shop',
    url: 'https://shop.koneacademy.io',
    tagline: 'Official Hardware Kits, Components & Academy Gear',
    description: 'Curated store offering verified educational robotics kits, microcontroller starter packs, electronic components, sensors, and academy accessories.',
    keyOfferings: [
      'Kone Robotics Starter Kits: Chassis, TT gearmotors, L298N drivers, Arduino Uno R4 / ESP32',
      'Sensor Packs: HC-SR04 ultrasonic, line tracking arrays, DHT22 temp/humidity, MPU6050 gyro',
      'Power Solutions: 18650 LiPo battery holders with safety BMS circuits, step-down buck converters',
      'Official Academy Merchandise: Badges, lab aprons, student maker kits, swag'
    ],
    targetAudience: 'Academy students, hobbyists, parents buying gifts, STEM clubs',
    sampleQuestions: [
      'What items are included in the Kone Robotics Starter Kit on Kone Shop?',
      'Which sensor pack is best for an autonomous maze-solving robot?',
      'How fast are orders shipped from the Kone Shop?'
    ]
  },

  farms: {
    id: 'farms',
    name: 'Kone Farms',
    url: 'https://farms.koneacademy.io',
    tagline: 'Precision AgriTech & Sustainable Smart Agriculture',
    description: 'Pioneering agricultural technology, automated greenhouse monitoring, smart solar irrigation, and computer vision crop health assessment.',
    keyOfferings: [
      'Smart Irrigation Systems: Soil moisture telemetry, automated solenoid valves, weather-aware watering',
      'Greenhouse Automation: Closed-loop humidity, temperature, and CO2 regulation',
      'Crop Spectral Analysis: Drone photography and computer vision for plant health diagnosis',
      'Solar Grid Management: Off-grid battery telemetry and renewable farm energy storage'
    ],
    targetAudience: 'Agricultural producers, green tech researchers, sustainability innovators',
    sampleQuestions: [
      'How does Kone Farms use IoT sensors to optimize irrigation?',
      'What sensors are used for soil moisture and greenhouse automation?'
    ]
  },

  warp: {
    id: 'warp',
    name: 'Kone Warp',
    url: 'https://warp.koneacademy.io',
    tagline: 'High-Velocity Developer Tooling & Sandboxes',
    description: 'Instant cloud dev environments, rapid compilation runners, and browser-based firmware simulators designed to eliminate setup friction for learners.',
    keyOfferings: [
      'Zero-Setup Cloud Sandboxes: Instant React, Python, and C++ runtimes in the browser',
      'Web-Based Hardware Simulator: Test virtual Arduino and ESP32 code before flashing physical chips',
      'High-Speed Code Sharing: Instant one-click project snippets and peer collaboration'
    ],
    targetAudience: 'Students without physical hardware yet, workshop attendees, fast prototypers',
    sampleQuestions: [
      'Can I simulate Arduino code on Kone Warp without physical hardware?',
      'How does Kone Warp run cloud compiler environments?'
    ]
  }
};

/**
 * Returns structured prompt grounding context for a given subdomain or all subdomains.
 */
export function getSubdomainKnowledgeContext(subdomainId = 'all'): string {
  const profile = SUBDOMAIN_PROFILES[subdomainId] || SUBDOMAIN_PROFILES['all'];

  let context = `\n=== KONE ACADEMY ECOSYSTEM GROUNDING KNOWLEDGE ===\n`;
  context += `Active Focus Subdomain: ${profile.name} (${profile.url})\n`;
  context += `Tagline: ${profile.tagline}\n`;
  context += `Description: ${profile.description}\n`;
  context += `Key Offerings:\n${profile.keyOfferings.map(o => `  • ${o}`).join('\n')}\n`;
  context += `Target Audience: ${profile.targetAudience}\n`;

  // Also include summary of all other subdomains so the AI can intelligently cross-reference
  context += `\n--- All Other Ecosystem Divisions (Intelligently Reference When Relevant) ---\n`;
  Object.values(SUBDOMAIN_PROFILES).forEach(sub => {
    if (sub.id !== profile.id && sub.id !== 'all') {
      context += `• ${sub.name} (${sub.url}): ${sub.tagline}\n`;
    }
  });

  context += `\nGuidelines for Kone AI Assistant:\n`;
  context += `1. When users ask questions specific to any subdomain (e.g. "What kits are in the shop?", "How do kids learn robotics?", "What consulting services exist?"), answer with exact knowledge of that division.\n`;
  context += `2. Provide clear, accurate direct links to the relevant subdomain (e.g. [Kone Shop](https://shop.koneacademy.io)).\n`;
  context += `3. Maintain a warm, encouraging, and technically rigorous educational tone.\n`;

  return context;
}
