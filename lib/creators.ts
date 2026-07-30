export interface Creator {
  id: string;
  name: string;
  handle: string;
  location: string;
  bio: string;
  followers: string;
  engagement: string;
  avgLikes: string;
  postingFrequency: string;
  reach: string;
  platforms: string[];
  niches: string[];
  email: string;
  website: string;
  growth30: string;
  growth90: string;
  favorited: boolean;
}

// Mock data — real creator profiles require Meta Graph API access (same
// Instagram Messaging app review as the DMs page), not yet set up.
export const CREATORS: Creator[] = [
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    handle: "@fitnesswithsarah",
    location: "United States",
    bio: "Fitness coach & wellness advocate. Helping people achieve their health goals through personalized training programs and nutrition advice. DM for collaborations.",
    followers: "142K",
    engagement: "8.4",
    avgLikes: "12K",
    postingFrequency: "3x/week",
    reach: "24.4K",
    platforms: ["Instagram", "TikTok"],
    niches: ["Fitness", "Wellness"],
    email: "sarah@fitnesswithsarah.com",
    website: "fitnesswithsarah.com",
    growth30: "+12.5K",
    growth90: "+31.8K",
    favorited: false,
  },
  {
    id: "marcus-johnson",
    name: "Marcus Johnson",
    handle: "@marcusjfit",
    location: "United States",
    bio: "Fitness and lifestyle coach helping everyday people build sustainable habits.",
    followers: "760K",
    engagement: "16.1",
    avgLikes: "48K",
    postingFrequency: "5x/week",
    reach: "24.4K",
    platforms: ["Instagram"],
    niches: ["Fitness", "Lifestyle"],
    email: "marcus@marcusjfit.com",
    website: "marcusjfit.com",
    growth30: "+18.2K",
    growth90: "+52.6K",
    favorited: true,
  },
  {
    id: "jade-liu",
    name: "Jade Liu",
    handle: "@jadeliubeauty",
    location: "United States",
    bio: "Beauty and skincare enthusiast sharing honest reviews and routines.",
    followers: "760K",
    engagement: "16.1",
    avgLikes: "44K",
    postingFrequency: "4x/week",
    reach: "24.4K",
    platforms: ["Instagram", "TikTok"],
    niches: ["Beauty", "Skincare"],
    email: "jade@jadeliubeauty.com",
    website: "jadeliubeauty.com",
    growth30: "+9.1K",
    growth90: "+27.3K",
    favorited: false,
  },
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    handle: "@alexrivera",
    location: "United States",
    bio: "Travel and adventure content — chasing the next trip and sharing the journey.",
    followers: "760K",
    engagement: "16.1",
    avgLikes: "41K",
    postingFrequency: "2x/week",
    reach: "24.4K",
    platforms: ["Instagram"],
    niches: ["Travel", "Adventure"],
    email: "alex@alexrivera.com",
    website: "alexrivera.com",
    growth30: "+7.4K",
    growth90: "+19.9K",
    favorited: false,
  },
  {
    id: "emma-thompson",
    name: "Emma Thompson",
    handle: "@emmawellness",
    location: "United States",
    bio: "Wellness and mental health advocate. Mindfulness, journaling, and slow living.",
    followers: "760K",
    engagement: "16.1",
    avgLikes: "39K",
    postingFrequency: "3x/week",
    reach: "24.4K",
    platforms: ["Instagram", "TikTok"],
    niches: ["Wellness", "Mental Health"],
    email: "emma@emmawellness.com",
    website: "emmawellness.com",
    growth30: "+11.0K",
    growth90: "+29.4K",
    favorited: true,
  },
  {
    id: "jordan-blake",
    name: "Jordan Blake",
    handle: "@jordanblaketech",
    location: "United States",
    bio: "Tech and gadget reviews for people who want the honest take before they buy.",
    followers: "760K",
    engagement: "16.1",
    avgLikes: "37K",
    postingFrequency: "4x/week",
    reach: "24.4K",
    platforms: ["TikTok"],
    niches: ["Tech", "Gadgets"],
    email: "jordan@jordanblaketech.com",
    website: "jordanblaketech.com",
    growth30: "+14.7K",
    growth90: "+38.1K",
    favorited: false,
  },
];
