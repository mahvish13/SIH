export const DISASTER_TYPES = [
  { key: "landslide", label: "Landslide", icon: "🏔️" },
  { key: "flood", label: "Flood", icon: "🌊" },
  { key: "earthquake", label: "Earthquake", icon: "🌍" },
  { key: "rainfall", label: "Heavy Rainfall", icon: "🌧️" },
  { key: "lightning", label: "Lightning & Thunderstorm", icon: "⛈️" },
  { key: "cyclone", label: "Cyclone", icon: "🌀" },
  { key: "other", label: "Other Hazards", icon: "🆘" }
];

export const LANGUAGES = [
  { key: "en", label: "English" },
  { key: "hi", label: "Hindi (हिन्दी)" },
  { key: "bn", label: "Bengali (বাংলা)" },
  { key: "as", label: "Assamese (অসমীয়া)" },
  { key: "mni", label: "Manipuri / Meitei" },
  { key: "kha", label: "Khasi" },
  { key: "lus", label: "Mizo" }
];

// Full genuine content exists for these 4 — every disaster type.
const FULL_LANGUAGES = ["en", "hi", "bn", "as"];

export function isAvailable(disaster, lang) {
  return FULL_LANGUAGES.includes(lang) && !!SAFETY_CONTENT[disaster]?.[lang];
}

// Manipuri, Khasi and Mizo are deliberately NOT included with generated
// content. Safety-critical guidance needs to be right, and confidence in
// producing grammatically correct, accurate text in these three specific
// languages isn't high enough to publish rather than guess. The UI shows an
// honest placeholder for them instead of silent English fallback or invented
// text — see SafetyGuidePage.jsx.

export const SAFETY_CONTENT = {
  landslide: {
    en: {
      before: [
        "Learn whether your area is landslide-prone — check official GSI/NDMA hazard information",
        "Keep drains near slopes clear so water doesn't pool and saturate the ground",
        "🚫 Don't ignore warning signs: new ground/wall cracks, tilting trees, doors that suddenly stick"
      ],
      during: [
        "Move away sideways from the debris path, not straight downhill with it",
        "If escape isn't possible, curl into a ball and protect your head",
        "🚫 Don't stay near cracking trees or a rumbling sound — that's moving debris"
      ],
      after: [
        "Report broken gas/water/electrical lines to the authorities",
        "Wait for officials to confirm the area is safe",
        "🚫 Don't re-enter the slide area — further slides are common in the same spot"
      ]
    },
    hi: {
      before: [
        "अपने क्षेत्र में भूस्खलन का खतरा है या नहीं, यह जानें",
        "नालियों को साफ रखें ताकि पानी जमा न हो",
        "🚫 दरारें, पेड़ों का झुकाव या दरवाज़ों के अटकने जैसे संकेतों को नज़रअंदाज़ न करें"
      ],
      during: [
        "मलबे के बहाव से तिरछे दूर हटें, उसी दिशा में न भागें",
        "फंस जाएं तो सिर बचाकर गोल आकार में झुक जाएं",
        "🚫 पेड़ टूटने या गड़गड़ाहट जैसी आवाज़ों के पास न रुकें"
      ],
      after: [
        "टूटी बिजली/पानी की लाइनों की सूचना दें",
        "अधिकारियों की पुष्टि का इंतज़ार करें",
        "🚫 क्षेत्र में दोबारा प्रवेश न करें, फिर से भूस्खलन हो सकता है"
      ]
    },
    bn: {
      before: [
        "আপনার এলাকা ভূমিধসপ্রবণ কিনা জেনে নিন",
        "নর্দমা পরিষ্কার রাখুন যাতে পানি জমে না থাকে",
        "🚫 মাটি/দেয়ালে ফাটল বা গাছ হেলে পড়ার লক্ষণ উপেক্ষা করবেন না"
      ],
      during: [
        "ধসের গতিপথ থেকে তির্যকভাবে সরে যান, একই দিকে দৌড়াবেন না",
        "আটকে গেলে মাথা রক্ষা করে গুটিয়ে থাকুন",
        "🚫 গাছ ভাঙা বা গর্জনের শব্দের কাছে থাকবেন না"
      ],
      after: [
        "ভাঙা বিদ্যুৎ/জলের লাইনের খবর দিন",
        "কর্তৃপক্ষের নিশ্চিতকরণের অপেক্ষা করুন",
        "🚫 এলাকায় আবার প্রবেশ করবেন না, আবার ধস হতে পারে"
      ]
    },
    as: {
      before: [
        "আপোনাৰ অঞ্চলটো মাটি স্খলনপ্ৰৱণ নেকি জানি লওক",
        "নলা-নৰ্দমা পৰিষ্কাৰ ৰাখক যাতে পানী জমা নহয়",
        "🚫 মাটি/দেৱালৰ ফাট বা গছ হেলি পৰাৰ চিন উপেক্ষা নকৰিব"
      ],
      during: [
        "ধ্বংসাৱশেষৰ প্ৰবাহৰ পৰা কোণাকৃতিভাৱে আঁতৰি যাওক",
        "আবদ্ধ হ'লে মূৰ ৰক্ষা কৰি গুটাই থাকক",
        "🚫 গছ ভঙা বা গৰজনৰ শব্দৰ ওচৰত নাথাকিব"
      ],
      after: [
        "ভগা বিদ্যুৎ/পানীৰ লাইনৰ খবৰ দিয়ক",
        "কৰ্তৃপক্ষৰ নিশ্চিতকৰণৰ বাবে অপেক্ষা কৰক",
        "🚫 অঞ্চলটোলৈ পুনৰ নোসোমাব, পুনৰ ধ্বংস হ'ব পাৰে"
      ]
    }
  },
  flood: {
    en: {
      before: [
        "Know your area's flood risk and evacuation route",
        "Keep an emergency kit ready — torch, radio, water, medicines",
        "🚫 Don't leave valuables and documents on low shelves in a flood-prone home"
      ],
      during: [
        "Move to higher ground immediately",
        "Keep your phone charged and monitor official alerts",
        "🚫 Never walk or drive through moving water"
      ],
      after: [
        "Wait for authorities to confirm it's safe before returning",
        "Check for weakened roads and bridges before using them",
        "🚫 Don't drink or wade through floodwater — it may be contaminated or electrified"
      ]
    },
    hi: {
      before: [
        "अपने क्षेत्र का बाढ़ जोखिम और निकासी मार्ग जान लें",
        "आपातकालीन किट तैयार रखें — टॉर्च, रेडियो, पानी, दवाइयाँ",
        "🚫 बाढ़ वाले क्षेत्र के घर में सामान/दस्तावेज़ नीची जगह न रखें"
      ],
      during: [
        "तुरंत ऊंची जगह पर चले जाएं",
        "फोन चार्ज रखें और आधिकारिक चेतावनियों पर नज़र रखें",
        "🚫 बहते पानी में कभी पैदल या गाड़ी से न चलें"
      ],
      after: [
        "अधिकारियों की पुष्टि के बाद ही वापस जाएं",
        "उपयोग से पहले कमज़ोर सड़कों/पुलों की जांच करें",
        "🚫 बाढ़ के पानी से न गुज़रें, यह दूषित या करंटयुक्त हो सकता है"
      ]
    },
    bn: {
      before: [
        "আপনার এলাকার বন্যার ঝুঁকি ও নিরাপদ পথ জেনে রাখুন",
        "জরুরি কিট প্রস্তুত রাখুন — টর্চ, রেডিও, পানি, ওষুধ",
        "🚫 বন্যাপ্রবণ ঘরে জিনিসপত্র/কাগজপত্র নিচু তাকে রাখবেন না"
      ],
      during: [
        "দ্রুত উঁচু স্থানে চলে যান",
        "ফোন চার্জ রাখুন ও সরকারি সতর্কতার দিকে নজর রাখুন",
        "🚫 বহমান পানির মধ্য দিয়ে কখনো হাঁটবেন বা গাড়ি চালাবেন না"
      ],
      after: [
        "কর্তৃপক্ষ নিশ্চিত করার পরই ফিরুন",
        "ব্যবহারের আগে দুর্বল রাস্তা/সেতু পরীক্ষা করুন",
        "🚫 বন্যার পানি দিয়ে যাবেন না, এটি দূষিত বা বিদ্যুতায়িত হতে পারে"
      ]
    },
    as: {
      before: [
        "আপোনাৰ অঞ্চলৰ বানপানীৰ বিপদ আৰু উলিয়াই যোৱাৰ পথ জানি ৰাখক",
        "জৰুৰীকালীন কিট সাজু ৰাখক — টৰ্চ, ৰেডিঅ', পানী, ঔষধ",
        "🚫 বানপানীপ্ৰৱণ ঘৰত বস্তু/কাগজপত্ৰ তলৰ তাকত নাৰাখিব"
      ],
      during: [
        "সোনকালে ওখ ঠাইলৈ যাওক",
        "ফোন চাৰ্জ ৰাখক আৰু চৰকাৰী সতৰ্কতালৈ লক্ষ্য ৰাখক",
        "🚫 বৈ থকা পানীৰে কেতিয়াও খোজ কাঢ়ি বা গাড়ী চলাই নাযাব"
      ],
      after: [
        "কৰ্তৃপক্ষই নিশ্চিত কৰাৰ পিছতহে উভতি যাওক",
        "ব্যৱহাৰৰ আগতে দুৰ্বল ৰাস্তা/দলঙ পৰীক্ষা কৰক",
        "🚫 বানপানীৰে নাযাব, ই দূষিত বা বিদ্যুৎযুক্ত হ'ব পাৰে"
      ]
    }
  },
  earthquake: {
    en: {
      before: [
        "Secure heavy furniture and shelves to walls",
        'Know "Drop, Cover, Hold On"',
        "🚫 Don't place heavy or breakable items on high, unsecured shelves"
      ],
      during: [
        "Drop, take cover under sturdy furniture, hold on until shaking stops",
        "If outdoors, move to an open area away from buildings and power lines",
        "🚫 Don't use elevators or run outside during the shaking"
      ],
      after: [
        "Check yourself and others for injuries before helping",
        "Expect aftershocks",
        "🚫 Don't enter damaged buildings until they're inspected"
      ]
    },
    hi: {
      before: [
        "भारी फर्नीचर और अलमारियों को दीवार से बांधें",
        '"झुको, छिपो, पकड़ो" तरीका याद रखें',
        "🚫 ऊंची, असुरक्षित अलमारियों पर भारी या टूटने वाली चीज़ें न रखें"
      ],
      during: [
        "नीचे झुकें, मज़बूत फर्नीचर के नीचे छिपें, झटके बंद होने तक पकड़े रहें",
        "बाहर हों तो इमारतों/तारों से दूर खुली जगह जाएं",
        "🚫 झटकों के दौरान लिफ्ट का उपयोग न करें या बाहर न भागें"
      ],
      after: [
        "मदद करने से पहले खुद को और दूसरों को चोट के लिए जांचें",
        "आफ्टरशॉक (बाद के झटकों) के लिए तैयार रहें",
        "🚫 बिना जांचे क्षतिग्रस्त इमारतों में प्रवेश न करें"
      ]
    },
    bn: {
      before: [
        "ভারী আসবাবপত্র ও তাক দেয়ালে বেঁধে রাখুন",
        "\"বসুন, ঢাকুন, ধরে থাকুন\" পদ্ধতি জেনে রাখুন",
        "🚫 উঁচু, অসুরক্ষিত তাকে ভারী বা ভাঙনযোগ্য জিনিস রাখবেন না"
      ],
      during: [
        "বসে পড়ুন, শক্ত আসবাবের নিচে আশ্রয় নিন, কম্পন থামা পর্যন্ত ধরে থাকুন",
        "বাইরে থাকলে ভবন ও তার থেকে দূরে খোলা জায়গায় যান",
        "🚫 কম্পনের সময় লিফট ব্যবহার করবেন না বা দৌড়ে বাইরে যাবেন না"
      ],
      after: [
        "সাহায্য করার আগে নিজের ও অন্যদের আঘাত পরীক্ষা করুন",
        "পরাঘাত (আফটারশক)-এর জন্য প্রস্তুত থাকুন",
        "🚫 পরীক্ষা না করে ক্ষতিগ্রস্ত ভবনে ঢুকবেন না"
      ]
    },
    as: {
      before: [
        "গধুৰ আচবাব আৰু তাকবোৰ দেৱালত বান্ধি ৰাখক",
        "\"বহক, ঢাকক, ধৰি ৰাখক\" পদ্ধতি জানি লওক",
        "🚫 ওখ, অসুৰক্ষিত তাকত গধুৰ বা ভাঙি যোৱা বস্তু নাৰাখিব"
      ],
      during: [
        "বহি পৰক, শক্তিশালী আচবাবৰ তলত আশ্ৰয় লওক, কঁপনি বন্ধ নোহোৱালৈকে ধৰি ৰাখক",
        "বাহিৰত থাকিলে ভৱন আৰু তাঁৰৰ পৰা আঁতৰত মুকলি ঠাইলৈ যাওক",
        "🚫 কঁপনিৰ সময়ত লিফ্ট ব্যৱহাৰ নকৰিব বা বাহিৰলৈ নাদৌৰিব"
      ],
      after: [
        "সহায় কৰাৰ আগতে নিজৰ আৰু আনৰ আঘাত পৰীক্ষা কৰক",
        "পিছৰ কঁপনি (আফটাৰশ্বক)ৰ বাবে সাজু থাকক",
        "🚫 পৰীক্ষা নকৰাকৈ ক্ষতিগ্ৰস্ত ভৱনত সোমাব নাযাব"
      ]
    }
  },
  rainfall: {
    en: {
      before: [
        "Check weather forecasts/alerts regularly during monsoon",
        "Clear drains and gutters around your home",
        "🚫 Don't travel to landslide/flood-prone areas if heavy rain is forecast"
      ],
      during: [
        "Stay indoors where possible",
        "Keep your phone charged and monitor official alerts",
        "🚫 Don't cross flooded roads or rivers"
      ],
      after: [
        "Check for water damage before re-entering affected rooms",
        "Report waterlogging or blocked drains to local authorities",
        "🚫 Don't walk on slippery or visibly damaged roads without care"
      ]
    },
    hi: {
      before: [
        "मानसून के दौरान मौसम की चेतावनियाँ नियमित रूप से देखें",
        "घर के आसपास नालियाँ साफ रखें",
        "🚫 भारी बारिश की चेतावनी में जोखिम वाले क्षेत्रों की यात्रा न करें"
      ],
      during: [
        "जहां तक संभव हो घर के अंदर रहें",
        "फोन चार्ज रखें और आधिकारिक चेतावनियों पर नज़र रखें",
        "🚫 जलभराव वाली सड़कों/नदियों को पार न करें"
      ],
      after: [
        "प्रभावित कमरों में जाने से पहले नुकसान की जांच करें",
        "जलभराव की सूचना स्थानीय प्रशासन को दें",
        "🚫 फिसलन भरी या क्षतिग्रस्त सड़कों पर बिना सावधानी के न चलें"
      ]
    },
    bn: {
      before: [
        "বর্ষাকালে নিয়মিত আবহাওয়ার সতর্কতা দেখুন",
        "বাড়ির চারপাশের নর্দমা পরিষ্কার রাখুন",
        "🚫 ভারী বৃষ্টির পূর্বাভাসে ঝুঁকিপূর্ণ এলাকায় ভ্রমণ করবেন না"
      ],
      during: [
        "যতটা সম্ভব বাড়ির ভেতরে থাকুন",
        "ফোন চার্জ রাখুন ও সরকারি সতর্কতার দিকে নজর রাখুন",
        "🚫 জলমগ্ন রাস্তা বা নদী পার হবেন না"
      ],
      after: [
        "ক্ষতিগ্রস্ত ঘরে ঢোকার আগে ক্ষতি পরীক্ষা করুন",
        "জলাবদ্ধতার খবর স্থানীয় প্রশাসনকে জানান",
        "🚫 পিচ্ছিল বা দৃশ্যত ক্ষতিগ্রস্ত রাস্তায় অসাবধানে হাঁটবেন না"
      ]
    },
    as: {
      before: [
        "বৰষুণৰ সময়ত নিয়মীয়াকৈ বতৰৰ সতৰ্কতা চাওক",
        "ঘৰৰ চাৰিওফালে নলা-নৰ্দমা পৰিষ্কাৰ ৰাখক",
        "🚫 প্ৰবল বৰষুণৰ পূৰ্বাভাসত বিপদজনক অঞ্চললৈ যাত্ৰা নকৰিব"
      ],
      during: [
        "যিমান পাৰি ঘৰৰ ভিতৰতে থাকক",
        "ফোন চাৰ্জ ৰাখক আৰু চৰকাৰী সতৰ্কতালৈ লক্ষ্য ৰাখক",
        "🚫 পানী জমা হোৱা ৰাস্তা বা নদী পাৰ নহ'ব"
      ],
      after: [
        "ক্ষতিগ্ৰস্ত কোঠালৈ সোমোৱাৰ আগতে ক্ষতি পৰীক্ষা কৰক",
        "পানী জমাৰ খবৰ স্থানীয় প্ৰশাসনক দিয়ক",
        "🚫 পিচ্ছিল বা ক্ষতিগ্ৰস্ত ৰাস্তাত অসাৱধানে নাখোজিব"
      ]
    }
  },
  lightning: {
    en: {
      before: [
        "Follow the 30-30 rule — seek shelter if thunder follows lightning within 30 seconds",
        "Unplug sensitive electronics",
        "🚫 Don't stay in open fields or be the tallest object around"
      ],
      during: [
        "Stay indoors, away from windows and corded electronics",
        "If outdoors with no shelter, crouch low with feet together, away from isolated trees",
        "🚫 Don't go near water bodies"
      ],
      after: [
        "Check for damage to electrical systems",
        "Give first aid immediately to anyone struck, and call emergency services",
        "🚫 Don't go back outside until 30 minutes after the last thunder"
      ]
    },
    hi: {
      before: [
        "30-30 नियम अपनाएं — गड़गड़ाहट 30 सेकंड के अंदर सुनाई दे तो तुरंत शरण लें",
        "संवेदनशील बिजली के उपकरण अनप्लग करें",
        "🚫 खुले मैदान में न रहें या सबसे ऊंची वस्तु न बनें"
      ],
      during: [
        "घर के अंदर रहें, खिड़कियों और तार वाले उपकरणों से दूर",
        "बाहर हों तो नीचे बैठें, पैर साथ रखें, अकेले पेड़ों से बचें",
        "🚫 जल स्रोतों के पास न जाएं"
      ],
      after: [
        "बिजली के सिस्टम में नुकसान की जांच करें",
        "घायल व्यक्ति को तुरंत प्राथमिक उपचार दें और एम्बुलेंस बुलाएं",
        "🚫 आखिरी गड़गड़ाहट के 30 मिनट बाद ही बाहर जाएं"
      ]
    },
    bn: {
      before: [
        "৩০-৩০ নিয়ম মেনে চলুন — বজ্রপাতের ৩০ সেকেন্ডের মধ্যে বজ্রধ্বনি শুনলে আশ্রয় নিন",
        "সংবেদনশীল বৈদ্যুতিক যন্ত্র আনপ্লাগ করুন",
        "🚫 খোলা মাঠে থাকবেন না বা সবচেয়ে উঁচু বস্তু হবেন না"
      ],
      during: [
        "ঘরের ভেতরে থাকুন, জানালা ও তারযুক্ত যন্ত্র থেকে দূরে",
        "বাইরে থাকলে নিচু হয়ে বসুন, পা একসাথে রাখুন, একা গাছ এড়িয়ে চলুন",
        "🚫 জলাশয়ের কাছে যাবেন না"
      ],
      after: [
        "বৈদ্যুতিক ব্যবস্থার ক্ষতি পরীক্ষা করুন",
        "আহত ব্যক্তিকে দ্রুত প্রাথমিক চিকিৎসা দিন ও অ্যাম্বুলেন্স ডাকুন",
        "🚫 শেষ বজ্রধ্বনির ৩০ মিনিট পরে বাইরে যান"
      ]
    },
    as: {
      before: [
        "৩০-৩০ নিয়ম মানি চলক — বজ্ৰপাতৰ ৩০ ছেকেণ্ডৰ ভিতৰত গৰজন শুনিলে আশ্ৰয় লওক",
        "সংবেদনশীল বৈদ্যুতিক সঁজুলি আনপ্লাগ কৰক",
        "🚫 মুকলি পথাৰত নাথাকিব বা আটাইতকৈ ওখ বস্তু নহ'ব"
      ],
      during: [
        "ঘৰৰ ভিতৰত থাকক, খিৰিকী আৰু তাঁৰযুক্ত সঁজুলিৰ পৰা আঁতৰত",
        "বাহিৰত থাকিলে তল হৈ বহক, ভৰি একেলগে ৰাখক, অকলশৰীয়া গছৰ পৰা আঁতৰি থাকক",
        "🚫 পানীৰ উৎসৰ ওচৰলৈ নাযাব"
      ],
      after: [
        "বৈদ্যুতিক ব্যৱস্থাৰ ক্ষতি পৰীক্ষা কৰক",
        "আঘাতপ্ৰাপ্ত ব্যক্তিক সোনকালে প্ৰাথমিক চিকিৎসা দিয়ক আৰু এম্বুলেন্স মাতক",
        "🚫 শেষ গৰজনৰ ৩০ মিনিট পিছত বাহিৰলৈ যাওক"
      ]
    }
  },
  cyclone: {
    en: {
      before: [
        "Secure loose objects and roof sheets outside your home",
        "Stock food, water and a torch for at least 3 days",
        "🚫 Don't ignore official cyclone warnings — evacuate if advised"
      ],
      during: [
        "Stay indoors, away from windows and doors",
        "Keep away from coastal areas, riverbanks and weak structures",
        "🚫 Don't go outside during the calm 'eye' of the storm — more wind follows"
      ],
      after: [
        "Check for damaged power lines and structures before going out",
        "Boil drinking water until authorities confirm it's safe",
        "🚫 Don't touch fallen power lines or damaged electrical wiring"
      ]
    },
    hi: {
      before: [
        "घर के बाहर ढीली वस्तुएं और छत की चादरें सुरक्षित करें",
        "कम से कम 3 दिनों के लिए भोजन, पानी और टॉर्च रखें",
        "🚫 आधिकारिक चक्रवात चेतावनी को नज़रअंदाज़ न करें — कहा जाए तो निकल जाएं"
      ],
      during: [
        "घर के अंदर रहें, खिड़कियों और दरवाज़ों से दूर",
        "तटीय क्षेत्रों, नदी किनारों और कमज़ोर ढांचों से दूर रहें",
        "🚫 तूफ़ान की शांत 'आंख' के दौरान बाहर न निकलें — फिर तेज़ हवा आती है"
      ],
      after: [
        "बाहर जाने से पहले टूटी बिजली लाइनों और ढांचों की जांच करें",
        "अधिकारियों की पुष्टि तक पीने का पानी उबालें",
        "🚫 गिरी हुई बिजली लाइनों को न छुएं"
      ]
    },
    bn: {
      before: [
        "বাড়ির বাইরের আলগা জিনিস ও ছাদের চাল সুরক্ষিত করুন",
        "অন্তত ৩ দিনের খাবার, পানি ও টর্চ মজুত রাখুন",
        "🚫 সরকারি ঘূর্ণিঝড় সতর্কতা উপেক্ষা করবেন না"
      ],
      during: [
        "ঘরের ভেতরে থাকুন, জানালা-দরজা থেকে দূরে",
        "উপকূল, নদীর তীর ও দুর্বল কাঠামো থেকে দূরে থাকুন",
        "🚫 ঝড়ের শান্ত 'চোখ'-এর সময় বাইরে যাবেন না"
      ],
      after: [
        "বাইরে যাওয়ার আগে ক্ষতিগ্রস্ত বিদ্যুৎ লাইন পরীক্ষা করুন",
        "কর্তৃপক্ষ নিশ্চিত না করা পর্যন্ত পানি ফুটিয়ে পান করুন",
        "🚫 পড়ে থাকা বিদ্যুৎ লাইন স্পর্শ করবেন না"
      ]
    },
    as: {
      before: [
        "ঘৰৰ বাহিৰৰ লগা বস্তু আৰু চালৰ চাদৰ সুৰক্ষিত কৰক",
        "কমেও ৩ দিনৰ বাবে খাদ্য, পানী আৰু টৰ্চ মজুত ৰাখক",
        "🚫 চৰকাৰী ঘূৰ্ণীবতাহৰ সতৰ্কতা উপেক্ষা নকৰিব"
      ],
      during: [
        "ঘৰৰ ভিতৰত থাকক, খিৰিকী-দুৱাৰৰ পৰা আঁতৰত",
        "উপকূল, নদীৰ পাৰ আৰু দুৰ্বল গাঁথনিৰ পৰা আঁতৰত থাকক",
        "🚫 ধুমুহাৰ শান্ত 'চকু'ৰ সময়ত বাহিৰলৈ নাযাব"
      ],
      after: [
        "বাহিৰলৈ যোৱাৰ আগতে ক্ষতিগ্ৰস্ত বিদ্যুৎ লাইন পৰীক্ষা কৰক",
        "কৰ্তৃপক্ষই নিশ্চিত নকৰালৈকে পানী উতলাই খাওক",
        "🚫 পৰি থকা বিদ্যুৎ লাইন স্পৰ্শ নকৰিব"
      ]
    }
  },
  other: {
    en: {
      before: [
        "Keep an emergency kit ready: torch, radio, water, first-aid, medicines",
        "Save emergency numbers (112, NDRF, local authorities) in your phone",
        "🚫 Don't wait for a disaster to learn your evacuation route"
      ],
      during: [
        "Follow instructions from local authorities and official alerts",
        "Help neighbours, especially elderly, children and people with disabilities",
        "🚫 Don't spread unverified information or rumours"
      ],
      after: [
        "Check on family, neighbours and community members",
        "Report damage and needs to local disaster management authorities",
        "🚫 Don't return to unsafe areas until officially cleared"
      ]
    },
    hi: {
      before: [
        "आपातकालीन किट तैयार रखें: टॉर्च, रेडियो, पानी, प्राथमिक चिकित्सा, दवाइयाँ",
        "आपातकालीन नंबर (112, NDRF, स्थानीय प्रशासन) फोन में सेव करें",
        "🚫 आपदा आने का इंतज़ार न करें, पहले ही निकासी मार्ग जान लें"
      ],
      during: [
        "स्थानीय प्रशासन और आधिकारिक चेतावनियों का पालन करें",
        "बुज़ुर्गों, बच्चों और दिव्यांगजनों की मदद करें",
        "🚫 असत्यापित जानकारी या अफ़वाहें न फैलाएं"
      ],
      after: [
        "परिवार, पड़ोसियों और समुदाय की खबर लें",
        "नुकसान और ज़रूरतों की सूचना स्थानीय प्रशासन को दें",
        "🚫 आधिकारिक अनुमति तक असुरक्षित क्षेत्रों में वापस न जाएं"
      ]
    },
    bn: {
      before: [
        "জরুরি কিট প্রস্তুত রাখুন: টর্চ, রেডিও, পানি, প্রাথমিক চিকিৎসা, ওষুধ",
        "জরুরি নম্বর (১১২, এনডিআরএফ) ফোনে সংরক্ষণ করুন",
        "🚫 দুর্যোগের অপেক্ষা না করে আগেই নিরাপদ পথ জেনে রাখুন"
      ],
      during: [
        "স্থানীয় কর্তৃপক্ষ ও সরকারি সতর্কতা অনুসরণ করুন",
        "প্রতিবেশী, বিশেষত বয়স্ক ও শিশুদের সাহায্য করুন",
        "🚫 অযাচাই তথ্য বা গুজব ছড়াবেন না"
      ],
      after: [
        "পরিবার ও প্রতিবেশীদের খোঁজ নিন",
        "ক্ষতি ও প্রয়োজনের কথা স্থানীয় প্রশাসনকে জানান",
        "🚫 নিরাপদ ঘোষণা না হওয়া পর্যন্ত ঝুঁকিপূর্ণ এলাকায় ফিরবেন না"
      ]
    },
    as: {
      before: [
        "জৰুৰীকালীন কিট সাজু ৰাখক: টৰ্চ, ৰেডিঅ', পানী, প্ৰাথমিক চিকিৎসা, ঔষধ",
        "জৰুৰী নম্বৰ (১১২, NDRF) ফোনত সংৰক্ষণ কৰক",
        "🚫 বিপদৰ বাবে অপেক্ষা নকৰি আগতেই সুৰক্ষিত পথ জানি লওক"
      ],
      during: [
        "স্থানীয় প্ৰশাসন আৰু চৰকাৰী সতৰ্কতা মানি চলক",
        "চুবুৰীয়া, বিশেষকৈ বৃদ্ধ আৰু শিশুক সহায় কৰক",
        "🚫 অসত্যাপিত তথ্য বা ৰাউৰি নফুৰাব"
      ],
      after: [
        "পৰিয়াল আৰু চুবুৰীয়াৰ খবৰ লওক",
        "ক্ষতি আৰু প্ৰয়োজনীয়তাৰ কথা স্থানীয় প্ৰশাসনক জনাওক",
        "🚫 নিৰাপদ বুলি ঘোষণা নোহোৱালৈকে বিপদজনক অঞ্চললৈ উভতি নাযাব"
      ]
    }
  }
};
