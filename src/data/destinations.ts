
import { Destination } from "@/types";

const destinations: Destination[] = [
  // Andhra Pradesh
  {
    id: "1",
    name: "Tirupati Balaji Temple",
    location: "Tirupati, Andhra Pradesh",
    description: "One of the world's richest temples dedicated to Lord Venkateswara, receiving thousands of pilgrims daily and known for its beautiful architecture.",
    imageUrl: "https://images.unsplash.com/photo-1616494810521-4afd77a8b9ea",
    budget: "medium",
    rating: 4.8,
    category: "temple",
    coordinates: {
      lat: 13.6833,
      lng: 79.3500,
    },
  },
  {
    id: "2",
    name: "Araku Valley",
    location: "Visakhapatnam, Andhra Pradesh",
    description: "A hill station famous for its breathtaking valleys, waterfalls, and coffee plantations. Tribal Museum showcases the cultural heritage of the region.",
    imageUrl: "https://images.unsplash.com/photo-1615514195045-512cfbe81921",
    budget: "low",
    rating: 4.6,
    category: "nature",
    coordinates: {
      lat: 18.3273,
      lng: 82.8751,
    },
  },
  
  // Arunachal Pradesh
  {
    id: "3",
    name: "Tawang Monastery",
    location: "Tawang, Arunachal Pradesh",
    description: "The largest monastery in India and the second largest in the world after the Potala Palace in Lhasa, Tibet. It's a three-story building with a library holding valuable scriptures.",
    imageUrl: "https://images.unsplash.com/photo-1588084603723-41322210da5c",
    budget: "medium",
    rating: 4.7,
    category: "temple",
    coordinates: {
      lat: 27.5859,
      lng: 91.8573,
    },
  },
  {
    id: "4",
    name: "Sela Pass",
    location: "Tawang, Arunachal Pradesh",
    description: "A high-altitude mountain pass at 13,700 feet connecting Tawang to the rest of India, featuring the stunning Sela Lake and incredible views of the Eastern Himalayas.",
    imageUrl: "https://images.unsplash.com/photo-1621350345963-9e98cb6466ab",
    budget: "medium",
    rating: 4.8,
    category: "mountain",
    coordinates: {
      lat: 27.5197,
      lng: 92.0968,
    },
  },
  
  // Assam
  {
    id: "5",
    name: "Kaziranga National Park",
    location: "Golaghat, Assam",
    description: "Home to the world's largest population of one-horned rhinoceros, tigers, elephants, and diverse bird species in a lush landscape.",
    imageUrl: "https://images.unsplash.com/photo-1615477081673-8e8b1d0fb0bc",
    budget: "medium",
    rating: 4.8,
    category: "nature",
    coordinates: {
      lat: 26.5815,
      lng: 93.1695,
    },
  },
  {
    id: "6",
    name: "Kamakhya Temple",
    location: "Guwahati, Assam",
    description: "One of the oldest of the 51 Shakti Pithas dedicated to Goddess Kamakhya, situated on Nilachal Hill. Known for its annual Ambubachi Mela.",
    imageUrl: "https://images.unsplash.com/photo-1612801961150-c6536c3e3d25",
    budget: "low",
    rating: 4.7,
    category: "temple",
    coordinates: {
      lat: 26.1664,
      lng: 91.7097,
    },
  },
  
  // Bihar
  {
    id: "7",
    name: "Mahabodhi Temple",
    location: "Bodh Gaya, Bihar",
    description: "A UNESCO World Heritage Site marking the location where Buddha attained enlightenment, featuring a 50m tall temple and the sacred Bodhi Tree.",
    imageUrl: "https://images.unsplash.com/photo-1558356381-e7e33b1c00e3",
    budget: "low",
    rating: 4.9,
    category: "temple",
    coordinates: {
      lat: 24.6959,
      lng: 84.9911,
    },
  },
  {
    id: "8",
    name: "Nalanda University Ruins",
    location: "Nalanda, Bihar",
    description: "Once one of the world's greatest ancient universities, these extensive ruins date back to the 5th century and showcase elaborate temples and monasteries.",
    imageUrl: "https://images.unsplash.com/photo-1595102325615-7408f8d2d857",
    budget: "low",
    rating: 4.6,
    category: "historical",
    coordinates: {
      lat: 25.1356,
      lng: 85.4444,
    },
  },
  
  // Chhattisgarh
  {
    id: "9",
    name: "Chitrakote Falls",
    location: "Bastar, Chhattisgarh",
    description: "Known as the 'Niagara Falls of India', this horseshoe-shaped waterfall on the Indravati River is at its most spectacular during monsoon season.",
    imageUrl: "https://images.unsplash.com/photo-1625936722390-c11de5eb133b",
    budget: "low",
    rating: 4.7,
    category: "nature",
    coordinates: {
      lat: 19.0969,
      lng: 81.6747,
    },
  },
  {
    id: "10",
    name: "Barnawapara Wildlife Sanctuary",
    location: "Mahasamund, Chhattisgarh",
    description: "A pristine forest reserve with diverse flora and fauna, including leopards, deer, wild boars, and over 150 bird species.",
    imageUrl: "https://images.unsplash.com/photo-1584351583369-760a7a04ff22",
    budget: "medium",
    rating: 4.5,
    category: "nature",
    coordinates: {
      lat: 21.4333,
      lng: 82.5501,
    },
  },
  
  // Goa
  {
    id: "11",
    name: "Dudhsagar Falls",
    location: "Sanguem, Goa",
    description: "One of India's tallest waterfalls at 310m, located on the Mandovi River. The name literally means 'sea of milk' due to its white water appearance.",
    imageUrl: "https://images.unsplash.com/photo-1628047484516-83d74f574689",
    budget: "medium",
    rating: 4.7,
    category: "nature",
    coordinates: {
      lat: 15.3144,
      lng: 74.3144,
    },
  },
  {
    id: "12",
    name: "Basilica of Bom Jesus",
    location: "Old Goa, Goa",
    description: "A UNESCO World Heritage Site and one of the best examples of baroque architecture in India, housing the mortal remains of St. Francis Xavier.",
    imageUrl: "https://images.unsplash.com/photo-1634139448071-1ff6e35a492c",
    budget: "low",
    rating: 4.6,
    category: "historical",
    coordinates: {
      lat: 15.5009,
      lng: 73.9112,
    },
  },
  
  // Gujarat
  {
    id: "13",
    name: "Statue of Unity",
    location: "Kevadia, Gujarat",
    description: "The world's tallest statue at 182 meters, depicting Sardar Vallabhbhai Patel, located on the Narmada River with a viewing gallery.",
    imageUrl: "https://images.unsplash.com/photo-1566044766113-3def9c7b0ce7",
    budget: "medium",
    rating: 4.8,
    category: "statue",
    coordinates: {
      lat: 21.8380,
      lng: 73.7191,
    },
  },
  {
    id: "14",
    name: "Somnath Temple",
    location: "Prabhas Patan, Gujarat",
    description: "One of the twelve Jyotirlingas dedicated to Lord Shiva, renowned for its stunning architecture and seaside location on the Arabian Sea.",
    imageUrl: "https://images.unsplash.com/photo-1619866551858-1abc94f89e05",
    budget: "medium",
    rating: 4.8,
    category: "temple",
    coordinates: {
      lat: 20.8885,
      lng: 70.4009,
    },
  },
  
  // Haryana
  {
    id: "15",
    name: "Sultanpur Bird Sanctuary",
    location: "Sultanpur, Haryana",
    description: "A bird paradise hosting over 250 species of birds, including migratory birds from Europe and Siberia during winter months.",
    imageUrl: "https://images.unsplash.com/photo-1549608276-5786777e6587",
    budget: "low",
    rating: 4.4,
    category: "nature",
    coordinates: {
      lat: 28.4674,
      lng: 76.8945,
    },
  },
  {
    id: "16",
    name: "Kingdom of Dreams",
    location: "Gurugram, Haryana",
    description: "India's first live entertainment and leisure destination, showcasing the rich cultural heritage of India through theater, art, and cuisine.",
    imageUrl: "https://images.unsplash.com/photo-1621873495802-3df70c9a2255",
    budget: "high",
    rating: 4.5,
    category: "monument",
    coordinates: {
      lat: 28.5013,
      lng: 77.0694,
    },
  },
  
  // Himachal Pradesh
  {
    id: "17",
    name: "Spiti Valley",
    location: "Lahaul and Spiti, Himachal Pradesh",
    description: "A desert mountain valley with breathtaking landscapes, ancient monasteries, and traditional Tibetan Buddhist culture.",
    imageUrl: "https://images.unsplash.com/photo-1629397586008-5c71704e3178",
    budget: "medium",
    rating: 4.8,
    category: "mountain",
    coordinates: {
      lat: 32.2464,
      lng: 78.0349,
    },
  },
  {
    id: "18",
    name: "Hadimba Temple",
    location: "Manali, Himachal Pradesh",
    description: "A unique wooden temple dedicated to Hidimba Devi, built in 1553 with intricate carvings and surrounded by cedar forest.",
    imageUrl: "https://images.unsplash.com/photo-1623500549450-f7f8a7e3df73",
    budget: "low",
    rating: 4.6,
    category: "temple",
    coordinates: {
      lat: 32.2513,
      lng: 77.1781,
    },
  },
  
  // Jharkhand
  {
    id: "19",
    name: "Hundru Falls",
    location: "Ranchi, Jharkhand",
    description: "One of the highest waterfalls in Jharkhand, where the Subarnarekha River cascades from a height of 98 meters, creating a spectacular sight.",
    imageUrl: "https://images.unsplash.com/photo-1600584403677-43f25e80c221",
    budget: "low",
    rating: 4.5,
    category: "nature",
    coordinates: {
      lat: 23.4306,
      lng: 85.5900,
    },
  },
  {
    id: "20",
    name: "Jagannath Temple",
    location: "Ranchi, Jharkhand",
    description: "A replica of the famous Jagannath Temple of Puri, situated on a hill with panoramic views of the city and known for its spiritual significance.",
    imageUrl: "https://images.unsplash.com/photo-1619241638225-14d56e47ae63",
    budget: "low",
    rating: 4.4,
    category: "temple",
    coordinates: {
      lat: 23.3750,
      lng: 85.3381,
    },
  },
  
  // Karnataka
  {
    id: "21",
    name: "Mysore Palace",
    location: "Mysuru, Karnataka",
    description: "The historical royal residence of the Wodeyar dynasty, known for its Indo-Saracenic architecture and opulent interiors.",
    imageUrl: "https://images.unsplash.com/photo-1594120742880-9a6f3bb22499",
    budget: "medium",
    rating: 4.8,
    category: "monument",
    coordinates: {
      lat: 12.3052,
      lng: 76.6552,
    },
  },
  {
    id: "22",
    name: "Hampi",
    location: "Bellary, Karnataka",
    description: "The ruins of the Vijayanagara Empire, featuring stunning temples, palaces, and monuments set amid a surreal boulder-strewn landscape.",
    imageUrl: "https://images.unsplash.com/photo-1600507432489-23edb3010ecf",
    budget: "low",
    rating: 4.9,
    category: "historical",
    coordinates: {
      lat: 15.3350,
      lng: 76.4600,
    },
  },
  
  // Kerala
  {
    id: "23",
    name: "Alleppey Backwaters",
    location: "Alappuzha, Kerala",
    description: "Known as 'Venice of the East', these interconnected canals, lakes, and rivers offer serene houseboat cruises through palm-fringed waterways and paddy fields.",
    imageUrl: "https://images.unsplash.com/photo-1602301413208-61a0956b0ed4",
    budget: "medium",
    rating: 4.9,
    category: "nature",
    coordinates: {
      lat: 9.4981,
      lng: 76.3388,
    },
  },
  {
    id: "24",
    name: "Munnar Tea Gardens",
    location: "Idukki, Kerala",
    description: "Sprawling tea plantations set against the backdrop of the Western Ghats, offering stunning landscapes, cool climate, and aromatic tea estates.",
    imageUrl: "https://images.unsplash.com/photo-1598326006839-4774230edb58",
    budget: "medium",
    rating: 4.8,
    category: "nature",
    coordinates: {
      lat: 10.0889,
      lng: 77.0595,
    },
  },
  
  // Madhya Pradesh
  {
    id: "25",
    name: "Khajuraho Temples",
    location: "Chhatarpur, Madhya Pradesh",
    description: "A UNESCO World Heritage Site featuring a group of Hindu and Jain temples famous for their nagara-style architectural symbolism and erotic sculptures.",
    imageUrl: "https://images.unsplash.com/photo-1628847022861-d2d4bee00eda",
    budget: "medium",
    rating: 4.8,
    category: "temple",
    coordinates: {
      lat: 24.8318,
      lng: 79.9199,
    },
  },
  {
    id: "26",
    name: "Bandhavgarh National Park",
    location: "Umaria, Madhya Pradesh",
    description: "One of India's most popular national parks with the highest density of tiger population, diverse wildlife, and ancient caves with 2,000-year-old man-made caves.",
    imageUrl: "https://images.unsplash.com/photo-1598429072645-a0296556e07b",
    budget: "high",
    rating: 4.7,
    category: "nature",
    coordinates: {
      lat: 23.7221,
      lng: 81.0420,
    },
  },
  
  // Maharashtra
  {
    id: "27",
    name: "Gateway of India",
    location: "Mumbai, Maharashtra",
    description: "An iconic arch monument built during the 20th century, overlooking the Arabian Sea and marking the landing of King George V and Queen Mary.",
    imageUrl: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66",
    budget: "low",
    rating: 4.7,
    category: "monument",
    coordinates: {
      lat: 18.9217,
      lng: 72.8347,
    },
  },
  {
    id: "28",
    name: "Ajanta and Ellora Caves",
    location: "Aurangabad, Maharashtra",
    description: "UNESCO World Heritage Sites featuring rock-cut cave monuments with paintings and sculptures considered masterpieces of Buddhist religious art.",
    imageUrl: "https://images.unsplash.com/photo-1613591781505-67fceb898484",
    budget: "medium",
    rating: 4.9,
    category: "historical",
    coordinates: {
      lat: 20.0258,
      lng: 75.1777,
    },
  },
  
  // Manipur
  {
    id: "29",
    name: "Loktak Lake",
    location: "Moirang, Manipur",
    description: "The largest freshwater lake in Northeast India, famous for its phumdis (floating islands) and the only floating national park in the world, Keibul Lamjao.",
    imageUrl: "https://images.unsplash.com/photo-1598343702264-9bc76bb01ddb",
    budget: "low",
    rating: 4.7,
    category: "nature",
    coordinates: {
      lat: 24.5513,
      lng: 93.7850,
    },
  },
  {
    id: "30",
    name: "Kangla Fort",
    location: "Imphal, Manipur",
    description: "An ancient palace that was the seat of Manipur's Maharajas, featuring historic structures, temples, and a museum showcasing the state's rich cultural heritage.",
    imageUrl: "https://images.unsplash.com/photo-1618219877807-683eead73040",
    budget: "low",
    rating: 4.4,
    category: "historical",
    coordinates: {
      lat: 24.8084,
      lng: 93.9530,
    },
  },
  
  // Meghalaya
  {
    id: "31",
    name: "Living Root Bridges",
    location: "Cherrapunji, Meghalaya",
    description: "Unique bio-engineering marvels created by the Khasi and Jaintia tribes, where tree roots are guided to form natural bridges over streams and rivers.",
    imageUrl: "https://images.unsplash.com/photo-1640203838132-1735fb27adf8",
    budget: "medium",
    rating: 4.9,
    category: "nature",
    coordinates: {
      lat: 25.2800,
      lng: 91.7200,
    },
  },
  {
    id: "32",
    name: "Nohkalikai Falls",
    location: "Cherrapunji, Meghalaya",
    description: "India's tallest plunge waterfall, dropping from a height of about 340 meters, set amidst lush green landscapes and known for its tragic folklore.",
    imageUrl: "https://images.unsplash.com/photo-1532622246991-c5c39d161ecc",
    budget: "low",
    rating: 4.8,
    category: "nature",
    coordinates: {
      lat: 25.2868,
      lng: 91.7310,
    },
  },
  
  // Mizoram
  {
    id: "33",
    name: "Phawngpui (Blue Mountain)",
    location: "Lawngtlai, Mizoram",
    description: "The highest mountain peak in Mizoram, offering breathtaking views of the surrounding landscape, unique flora and fauna, and trekking opportunities.",
    imageUrl: "https://images.unsplash.com/photo-1626017048672-46f96c8fd0c0",
    budget: "medium",
    rating: 4.6,
    category: "mountain",
    coordinates: {
      lat: 22.6262,
      lng: 93.0298,
    },
  },
  {
    id: "34",
    name: "Dampa Tiger Reserve",
    location: "Mamit, Mizoram",
    description: "The largest wildlife sanctuary in Mizoram, home to tigers, leopards, elephants, and numerous bird species, offering pristine wilderness experiences.",
    imageUrl: "https://images.unsplash.com/photo-1627486140441-03447059a6e2",
    budget: "medium",
    rating: 4.4,
    category: "nature",
    coordinates: {
      lat: 23.4198,
      lng: 92.4213,
    },
  },
  
  // Nagaland
  {
    id: "35",
    name: "Dzukou Valley",
    location: "Kohima, Nagaland",
    description: "Famous for its seasonal wildflowers, this valley between Nagaland and Manipur offers breathtaking treks and stunning panoramic views.",
    imageUrl: "https://images.unsplash.com/photo-1617522610780-7002e4952b05",
    budget: "medium",
    rating: 4.7,
    category: "mountain",
    coordinates: {
      lat: 25.5746,
      lng: 94.0794,
    },
  },
  {
    id: "36",
    name: "Kohima War Cemetery",
    location: "Kohima, Nagaland",
    description: "A memorial dedicated to soldiers of the 2nd British Division who died in WWII during the Battle of Kohima, with the famous epitaph: 'When You Go Home, Tell Them Of Us And Say, For Your Tomorrow, We Gave Our Today'.",
    imageUrl: "https://images.unsplash.com/photo-1623997688018-cff50c9ad78a",
    budget: "low",
    rating: 4.6,
    category: "historical",
    coordinates: {
      lat: 25.6742,
      lng: 94.1031,
    },
  },
  
  // Odisha
  {
    id: "37",
    name: "Sun Temple",
    location: "Konark, Odisha",
    description: "A 13th-century Sun temple designed in the form of a colossal chariot with elaborately carved stone wheels, pillars and walls.",
    imageUrl: "https://images.unsplash.com/photo-1592635196078-9fbc73f8c3a7",
    budget: "low",
    rating: 4.7,
    category: "temple",
    coordinates: {
      lat: 19.8877,
      lng: 86.0945,
    },
  },
  {
    id: "38",
    name: "Chilika Lake",
    location: "Puri, Odisha",
    description: "Asia's largest brackish water lagoon, home to diverse bird species including migratory birds and the rare Irrawaddy dolphins.",
    imageUrl: "https://images.unsplash.com/photo-1626196889007-c320560c4e90",
    budget: "low",
    rating: 4.5,
    category: "nature",
    coordinates: {
      lat: 19.8440,
      lng: 85.4788,
    },
  },
  
  // Punjab
  {
    id: "39",
    name: "Golden Temple",
    location: "Amritsar, Punjab",
    description: "Also known as Sri Harmandir Sahib, this is the holiest shrine in Sikhism, known for its stunning gold-plated architecture and spiritual atmosphere.",
    imageUrl: "https://images.unsplash.com/photo-1514222788835-3a1a1d5b32f8",
    budget: "low",
    rating: 4.9,
    category: "temple",
    coordinates: {
      lat: 31.6200,
      lng: 74.8765,
    },
  },
  {
    id: "40",
    name: "Jallianwala Bagh",
    location: "Amritsar, Punjab",
    description: "A historic garden and memorial of national importance that commemorates the massacre of peaceful protesters by British forces in 1919.",
    imageUrl: "https://images.unsplash.com/photo-1618576980905-8b733e324d38",
    budget: "low",
    rating: 4.7,
    category: "historical",
    coordinates: {
      lat: 31.6202,
      lng: 74.8801,
    },
  },
  
  // Rajasthan
  {
    id: "41",
    name: "Hawa Mahal",
    location: "Jaipur, Rajasthan",
    description: "The 'Palace of Winds' is a five-story palace built in 1799 with a unique honeycomb facade of 953 small windows called jharokhas.",
    imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41",
    budget: "low",
    rating: 4.5,
    category: "historical",
    coordinates: {
      lat: 26.9239,
      lng: 75.8267,
    },
  },
  {
    id: "42",
    name: "Mehrangarh Fort",
    location: "Jodhpur, Rajasthan",
    description: "One of the largest forts in India, standing 410 feet above the city with imposing thick walls, intricate carvings, and expansive courtyards.",
    imageUrl: "https://images.unsplash.com/photo-1584804733160-8c13ee259beb",
    budget: "medium",
    rating: 4.8,
    category: "historical",
    coordinates: {
      lat: 26.2983,
      lng: 73.0184,
    },
  },
  
  // Sikkim
  {
    id: "43",
    name: "Tsomgo Lake",
    location: "East Sikkim, Sikkim",
    description: "A glacial lake at an altitude of 12,310 ft, considered sacred by locals and offering stunning views of snow-capped mountains reflecting in its crystal-clear waters.",
    imageUrl: "https://images.unsplash.com/photo-1576447439575-758a214224ad",
    budget: "medium",
    rating: 4.8,
    category: "nature",
    coordinates: {
      lat: 27.3723,
      lng: 88.7600,
    },
  },
  {
    id: "44",
    name: "Rumtek Monastery",
    location: "Gangtok, Sikkim",
    description: "The largest monastery in Sikkim, displaying traditional Tibetan Buddhist architecture, intricate murals, and rare religious artifacts.",
    imageUrl: "https://images.unsplash.com/photo-1625747426249-3634fef93d89",
    budget: "low",
    rating: 4.6,
    category: "temple",
    coordinates: {
      lat: 27.3342,
      lng: 88.5761,
    },
  },
  
  // Tamil Nadu
  {
    id: "45",
    name: "Meenakshi Temple",
    location: "Madurai, Tamil Nadu",
    description: "A historic Hindu temple dedicated to Goddess Meenakshi, known for its towering gopurams covered with thousands of colorful sculptures.",
    imageUrl: "https://images.unsplash.com/photo-1527786356703-4b100091cd2c",
    budget: "low",
    rating: 4.8,
    category: "temple",
    coordinates: {
      lat: 9.9195,
      lng: 78.1193,
    },
  },
  {
    id: "46",
    name: "Shore Temple",
    location: "Mahabalipuram, Tamil Nadu",
    description: "A UNESCO World Heritage Site, this 8th-century granite temple stands on the shores of the Bay of Bengal and is one of the oldest structural stone temples of South India.",
    imageUrl: "https://images.unsplash.com/photo-1613204259180-cf3a2a5b5c7d",
    budget: "low",
    rating: 4.7,
    category: "temple",
    coordinates: {
      lat: 12.6161,
      lng: 80.1994,
    },
  },
  
  // Telangana
  {
    id: "47",
    name: "Charminar",
    location: "Hyderabad, Telangana",
    description: "A monument and mosque with four graceful minarets, built in 1591 and serving as the centerpiece of Hyderabad's old city.",
    imageUrl: "https://images.unsplash.com/photo-1590058566888-72f9a96fbef6",
    budget: "low",
    rating: 4.5,
    category: "monument",
    coordinates: {
      lat: 17.3616,
      lng: 78.4747,
    },
  },
  {
    id: "48",
    name: "Ramoji Film City",
    location: "Hyderabad, Telangana",
    description: "The world's largest film studio complex, spanning 1,666 acres with film sets, theme parks, hotels, and attractions drawing tourists and filmmakers.",
    imageUrl: "https://images.unsplash.com/photo-1627898953284-58f13b201433",
    budget: "medium",
    rating: 4.6,
    category: "monument",
    coordinates: {
      lat: 17.2500,
      lng: 78.6800,
    },
  },
  
  // Tripura
  {
    id: "49",
    name: "Neermahal Palace",
    location: "Melaghar, Tripura",
    description: "The only lake palace in eastern India, built in the middle of Rudrasagar Lake, combining Hindu and Muslim architectural styles.",
    imageUrl: "https://images.unsplash.com/photo-1626365298052-9fd125c075a4",
    budget: "low",
    rating: 4.5,
    category: "monument",
    coordinates: {
      lat: 23.4900,
      lng: 91.3100,
    },
  },
  {
    id: "50",
    name: "Ujjayanta Palace",
    location: "Agartala, Tripura",
    description: "A former royal palace now housing the Tripura Government Museum, featuring Indo-Saracenic architecture with three domes and large public gardens.",
    imageUrl: "https://images.unsplash.com/photo-1626364675104-ce78448b6351",
    budget: "low",
    rating: 4.4,
    category: "monument",
    coordinates: {
      lat: 23.8366,
      lng: 91.2765,
    },
  },
  
  // Uttar Pradesh
  {
    id: "51",
    name: "Taj Mahal",
    location: "Agra, Uttar Pradesh",
    description: "One of the seven wonders of the world, this ivory-white marble mausoleum was built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal.",
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523",
    budget: "medium",
    rating: 4.9,
    category: "historical",
    coordinates: {
      lat: 27.1751,
      lng: 78.0421,
    },
  },
  {
    id: "52",
    name: "Kashi Vishwanath Temple",
    location: "Varanasi, Uttar Pradesh",
    description: "One of the most sacred Hindu temples dedicated to Lord Shiva, situated on the western bank of the holy river Ganga.",
    imageUrl: "https://images.unsplash.com/photo-1561361058-c24e02b27da9",
    budget: "low",
    rating: 4.7,
    category: "temple",
    coordinates: {
      lat: 25.3109,
      lng: 83.0107,
    },
  },
  
  // Uttarakhand
  {
    id: "53",
    name: "Valley of Flowers",
    location: "Chamoli, Uttarakhand",
    description: "A UNESCO World Heritage Site known for its meadows of endemic alpine flowers and variety of flora and fauna in the Western Himalayas.",
    imageUrl: "https://images.unsplash.com/photo-1593181629936-11c609b8db9f",
    budget: "medium",
    rating: 4.9,
    category: "nature",
    coordinates: {
      lat: 30.7283,
      lng: 79.6054,
    },
  },
  {
    id: "54",
    name: "Nainital Lake",
    location: "Nainital, Uttarakhand",
    description: "A natural freshwater lake in the Himalayan mountains, surrounded by seven hills and offering boating, panoramic views, and a serene environment.",
    imageUrl: "https://images.unsplash.com/photo-1593516631430-5533531959be",
    budget: "medium",
    rating: 4.7,
    category: "nature",
    coordinates: {
      lat: 29.3919,
      lng: 79.4542,
    },
  },
  
  // West Bengal
  {
    id: "55",
    name: "Victoria Memorial",
    location: "Kolkata, West Bengal",
    description: "A large marble building dedicated to the memory of Queen Victoria, now serving as a museum and tourist destination.",
    imageUrl: "https://images.unsplash.com/photo-1630990849695-ae3e5164ad15",
    budget: "low",
    rating: 4.6,
    category: "monument",
    coordinates: {
      lat: 22.5448,
      lng: 88.3426,
    },
  },
  {
    id: "56",
    name: "Darjeeling",
    location: "Darjeeling, West Bengal",
    description: "Famous for its tea plantations and views of Kanchenjunga, the world's third highest mountain. Ride the historic Darjeeling Himalayan Railway.",
    imageUrl: "https://images.unsplash.com/photo-1544265121-b211751a0a7c",
    budget: "medium",
    rating: 4.6,
    category: "mountain",
    coordinates: {
      lat: 27.0410,
      lng: 88.2663,
    },
  },
  
  // Delhi
  {
    id: "57",
    name: "Red Fort",
    location: "Delhi",
    description: "The Red Fort is a historic fort in Old Delhi that served as the main residence of the Mughal Emperors. Built in 1639, it's an iconic symbol of India.",
    imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
    budget: "low",
    rating: 4.7,
    category: "historical",
    coordinates: {
      lat: 28.6562,
      lng: 77.2410,
    },
  },
  {
    id: "58",
    name: "India Gate",
    location: "New Delhi",
    description: "A war memorial dedicated to the soldiers of the British Indian Army who died in the First World War, designed by Sir Edwin Lutyens.",
    imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
    budget: "low",
    rating: 4.6,
    category: "monument",
    coordinates: {
      lat: 28.6129,
      lng: 77.2295,
    },
  },
  
  // Jammu & Kashmir
  {
    id: "59",
    name: "Dal Lake",
    location: "Srinagar, Jammu & Kashmir",
    description: "Famous for its houseboats and floating gardens, this urban lake is surrounded by mountains and serves as a major attraction in Kashmir.",
    imageUrl: "https://images.unsplash.com/photo-1593181520118-2379321e5c25",
    budget: "medium",
    rating: 4.8,
    category: "nature",
    coordinates: {
      lat: 34.0836,
      lng: 74.8039,
    },
  },
  {
    id: "60",
    name: "Gulmarg",
    location: "Baramulla, Jammu & Kashmir",
    description: "A stunning hill station and popular skiing destination with breathtaking meadows, the world's highest golf course, and a gondola cable car system.",
    imageUrl: "https://images.unsplash.com/photo-1566231346621-d8eef9627293",
    budget: "high",
    rating: 4.9,
    category: "mountain",
    coordinates: {
      lat: 34.0483,
      lng: 74.3805,
    },
  },
  
  // Ladakh
  {
    id: "61",
    name: "Pangong Lake",
    location: "Leh, Ladakh",
    description: "A high-altitude lake shared between India and China, known for its clear blue waters and changing colors throughout the day.",
    imageUrl: "https://images.unsplash.com/photo-1590677197230-3c96ed77ddf1",
    budget: "high",
    rating: 4.9,
    category: "nature",
    coordinates: {
      lat: 33.7418,
      lng: 78.9358,
    },
  },
  {
    id: "62",
    name: "Thiksey Monastery",
    location: "Leh, Ladakh",
    description: "A Tibetan-style monastery perched on a hill, featuring a 49-foot tall statue of Maitreya Buddha and offering spectacular views of the Indus Valley.",
    imageUrl: "https://images.unsplash.com/photo-1591801903238-ee5eeddf5073",
    budget: "medium",
    rating: 4.8,
    category: "temple",
    coordinates: {
      lat: 34.0531,
      lng: 77.6709,
    },
  }
];

export default destinations;
