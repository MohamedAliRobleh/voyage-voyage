import type { Locale } from "@/contexts/LanguageContext";
import type { Destination } from "./destinations";

// ── Difficulty / Duration / BestTime maps ──────────────────────────────────

const difficultyMap: Record<string, Record<Locale, string>> = {
  "Facile":    { fr: "Facile",   en: "Easy",     ar: "سهل" },
  "Modéré":   { fr: "Modéré",  en: "Moderate", ar: "معتدل" },
  "Difficile": { fr: "Difficile", en: "Difficult", ar: "صعب" },
};

const durationMap: Record<string, Record<Locale, string>> = {
  "1 journée":    { fr: "1 journée",    en: "1 day",      ar: "يوم واحد" },
  "2 jours":      { fr: "2 jours",      en: "2 days",     ar: "يومان" },
  "2 jours min.": { fr: "2 jours min.", en: "2+ days",    ar: "يومان أو أكثر" },
  "Demi-journée": { fr: "Demi-journée", en: "Half day",   ar: "نصف يوم" },
  "1-2 jours":    { fr: "1-2 jours",   en: "1-2 days",   ar: "1-2 يوم" },
};

const bestTimeMap: Record<string, Record<Locale, string>> = {
  "Oct - Avril":  { fr: "Oct - Avril",  en: "Oct - April",    ar: "أكتوبر - أبريل" },
  "Oct - Mai":    { fr: "Oct - Mai",    en: "Oct - May",      ar: "أكتوبر - مايو" },
  "Oct - Juin":   { fr: "Oct - Juin",   en: "Oct - June",     ar: "أكتوبر - يونيو" },
  "Oct - Fév":    { fr: "Oct - Fév",    en: "Oct - Feb",      ar: "أكتوبر - فبراير" },
  "Nov - Mars":   { fr: "Nov - Mars",   en: "Nov - March",    ar: "نوفمبر - مارس" },
  "Nov - Janvier":{ fr: "Nov - Janvier",en: "Nov - January",  ar: "نوفمبر - يناير" },
  "Toute l'année":{ fr: "Toute l'année",en: "All year",       ar: "طوال العام" },
  "Nov - Février":{ fr: "Nov - Février",en: "Nov - February", ar: "نوفمبر - فبراير" },
};

// ── Per-destination content translations ──────────────────────────────────

type DestContent = {
  description: string;
  longDescription: string;
  highlights: string[];
};

const destContent: Record<string, Record<"en" | "ar", DestContent>> = {
  "lac-assal": {
    en: {
      description: "Africa's lowest point, a hypnotic salt lake 155m below sea level.",
      longDescription: "Lake Assal is a salt lake located 155 meters below sea level, making it the lowest point in Africa and the third lowest in the world. Its turquoise waters contrast beautifully with the white salt crystals lining its shores. It is a unique spectacle — volcanic desert meeting a glittering sea of salt.",
      highlights: ["Africa's lowest point", "Waters 10x saltier than the sea", "Giant salt crystals", "Lunar landscape"],
    },
    ar: {
      description: "أخفض نقطة في أفريقيا، بحيرة ملح رائعة على عمق 155 متر تحت مستوى البحر.",
      longDescription: "بحيرة عسل بحيرة مالحة تقع على عمق 155 متراً تحت مستوى البحر، مما يجعلها أخفض نقطة في أفريقيا والثالثة على مستوى العالم. تتباين مياهها الفيروزية بشكل رائع مع بلورات الملح البيضاء المحيطة بشواطئها. إنه منظر فريد من نوعه — صحراء بركانية تلتقي ببحر من الملح اللامع.",
      highlights: ["أخفض نقطة في أفريقيا", "مياه أكثر ملوحة 10 أضعاف من البحر", "بلورات ملح عملاقة", "منظر قمري"],
    },
  },
  "lac-abbe": {
    en: {
      description: "A Martian landscape of steam chimneys, home to Djibouti's last flamingos.",
      longDescription: "Lake Abbé is one of the most spectacular sites in Djibouti. Its limestone chimneys rising like giant organ pipes, geysers of steam, and pink flamingos create a science-fiction landscape. The light of dawn over this extraterrestrial scenery is an unforgettable experience.",
      highlights: ["Giant limestone chimneys", "Pink flamingos", "Steam geysers", "Magical sunrise"],
    },
    ar: {
      description: "منظر مريخي بمداخن بخارية، موطن آخر طيور الفلامنغو في جيبوتي.",
      longDescription: "بحيرة عبه من أكثر المواقع إبهاراً في جيبوتي. مداخنها الكلسية الشامخة كأعمدة أرغن عملاقة، ومنافث البخار وطيور الفلامنغو الوردية تخلق مشهداً خيالياً. ضوء الفجر على هذه البيئة الفضائية تجربة لا تُنسى.",
      highlights: ["مداخن كلسية عملاقة", "طيور الفلامنغو", "منافث بخارية", "شروق شمس ساحر"],
    },
  },
  "sables-blancs": {
    en: {
      description: "A paradise beach with crystal-clear waters, ideal for diving and snorkeling.",
      longDescription: "Plage des Sables Blancs is a true tropical paradise located just a few kilometers from Djibouti City. Its turquoise waters and pristine sand make it the perfect place to relax, swim, or explore the colorful seabed of the Gulf of Tadjoura.",
      highlights: ["Fine white sand", "Crystal-clear waters", "Snorkeling and diving", "Colorful seabed"],
    },
    ar: {
      description: "شاطئ جنة بمياه صافية، مثالي للغطس والغوص.",
      longDescription: "شاطئ الرمال البيضاء جنة استوائية حقيقية تقع على بعد كيلومترات قليلة من مدينة جيبوتي. مياهها الفيروزية ورمالها البيضاء تجعله المكان المثالي للاسترخاء والسباحة أو استكشاف قاع البحر الملوّن في خليج تاجورة.",
      highlights: ["رمال بيضاء ناعمة", "مياه صافية كالكريستال", "غطس وغوص", "قاع بحر ملوّن"],
    },
  },
  "requin-baleine": {
    en: {
      description: "Swim with the giants of the seas in the warm waters of the Gulf of Aden.",
      longDescription: "Between November and January, the waters of Djibouti welcome whale sharks, the largest fish in the world. This unique experience of swimming with these peaceful giants is one of the most sought-after activities by travelers. Voyage Voyage organizes guided excursions to live this exceptional moment.",
      highlights: ["World's largest fish", "Safe swimming experience", "Certified guide", "Unique experience"],
    },
    ar: {
      description: "اسبح مع عمالقة البحار في المياه الدافئة لخليج عدن.",
      longDescription: "بين نوفمبر ويناير، تستقبل مياه جيبوتي أسماك القرش الحوتي، أكبر أسماك العالم. تجربة السباحة الفريدة مع هؤلاء العمالقة المسالمين من أكثر الأنشطة التي يبحث عنها المسافرون. تنظم فوياج فوياج رحلات مصحوبة لعيش هذه اللحظة الاستثنائية.",
      highlights: ["أكبر سمكة في العالم", "سباحة آمنة", "مرشد معتمد", "تجربة فريدة"],
    },
  },
  "loubatanleh": {
    en: {
      description: "An unexpected green oasis in the arid lands of Djibouti.",
      longDescription: "Loubatanleh is a hidden destination that surprises with its lush vegetation in the heart of an arid environment. This site offers a picturesque hike through varied landscapes, ideal for nature lovers and explorers.",
      highlights: ["Lush vegetation", "Nature hike", "Local wildlife", "Contrasting landscapes"],
    },
    ar: {
      description: "واحة خضراء غير متوقعة في الأراضي القاحلة لجيبوتي.",
      longDescription: "لوباتانلي وجهة خفية تدهش بنباتاتها الخضراء الكثيفة في قلب بيئة جافة. يقدم الموقع مسيرة جميلة عبر مناظر متنوعة، مثالية لمحبي الطبيعة والاستكشاف.",
      highlights: ["نباتات كثيفة", "تنزه في الطبيعة", "حياة برية محلية", "مناظر متباينة"],
    },
  },
  "goubet": {
    en: {
      description: "One of the most geologically active places on Earth, with mysterious waters.",
      longDescription: "Le Goubet is a mysterious bay surrounded by black volcanic mountains. Its deep waters, unique geological formations, and wild atmosphere make it a fascinating destination for adventurers and geology enthusiasts.",
      highlights: ["Volcanic formations", "Mysterious deep waters", "Unique geology", "Wild landscape"],
    },
    ar: {
      description: "أحد أكثر الأماكن نشاطاً جيولوجياً على الأرض، بمياه غامضة.",
      longDescription: "الجوبيه خليج غامض تحيط به جبال بركانية سوداء. مياهه العميقة وتشكيلاته الجيولوجية الفريدة وأجواؤه البرية تجعله وجهة رائعة للمغامرين وعشاق الجيولوجيا.",
      highlights: ["تشكيلات بركانية", "مياه عميقة غامضة", "جيولوجيا فريدة", "منظر بري"],
    },
  },
  "bankoualeh": {
    en: {
      description: "A traditional Afar village at the heart of an authentic desert landscape.",
      longDescription: "Bankoualeh offers an immersion into traditional Afar culture. This authentic village lets you discover the nomadic way of life, local crafts, and the legendary hospitality of the Afar people, while admiring spectacular desert landscapes.",
      highlights: ["Authentic Afar culture", "Traditional village", "Local crafts", "Djiboutian hospitality"],
    },
    ar: {
      description: "قرية عفارية تقليدية في قلب منظر صحراوي أصيل.",
      longDescription: "تقدم بانكوالي غوصاً في الثقافة العفارية التقليدية. تتيح هذه القرية الأصيلة اكتشاف نمط الحياة البدوي والحرف اليدوية المحلية وكرم الضيافة الأسطوري لشعب العفار، مع الإعجاب بمناظر صحراوية خلابة.",
      highlights: ["ثقافة عفارية أصيلة", "قرية تقليدية", "حرف يدوية محلية", "ضيافة جيبوتية"],
    },
  },
  "ditilou": {
    en: {
      description: "A majestic canyon sculpted by millions of years of erosion in the desert.",
      longDescription: "Ditilou is a spectacular canyon that reveals the power of natural erosion in the Djiboutian desert. Its colorful walls, rock formations, and hiking trails make it a prized destination for geotourism enthusiasts.",
      highlights: ["Spectacular canyon", "Colorful rock formations", "Hiking", "Nature photography"],
    },
    ar: {
      description: "وادٍ مهيب نُحت على مدى ملايين السنين بالتعرية الصحراوية.",
      longDescription: "ديتيلو وادٍ خلاب يكشف عن قوة التعرية الطبيعية في صحراء جيبوتي. جدرانه الملونة وتشكيلاته الصخرية ومسارات التنزه تجعله وجهة مفضلة لعشاق السياحة الجيولوجية.",
      highlights: ["وادٍ خلاب", "تشكيلات صخرية ملونة", "تنزه", "تصوير طبيعي"],
    },
  },
  "depression-allos": {
    en: {
      description: "Hara Alol & Saku Allol, a unique geological depression with surreal landscapes.",
      longDescription: "The Allos Depression includes two exceptional geological sites: Hara Alol and Saku Allol. These depressions offer surreally beautiful landscapes with their multicolored mineral formations, hot springs, and timeless atmosphere.",
      highlights: ["Colorful mineral formations", "Hot springs", "Surreal landscape", "Rare geological site"],
    },
    ar: {
      description: "هرة ألول وساكو ألول، انخفاض جيولوجي فريد بمناظر سريالية.",
      longDescription: "تضم منخفضات ألوس موقعين جيولوجيين استثنائيين: هرة ألول وساكو ألول. توفر هذه المنخفضات مناظر بالغة الجمال مع تشكيلاتها المعدنية متعددة الألوان وينابيعها الحارة وأجوائها خارج الزمن.",
      highlights: ["تشكيلات معدنية ملونة", "ينابيع حارة", "منظر سريالي", "موقع جيولوجي نادر"],
    },
  },
  "obock-godoria": {
    en: {
      description: "The preserved mangroves of Godoria, habitat for many migratory bird species.",
      longDescription: "Obock and the Godoria Mangroves form a precious coastal ecosystem in northern Djibouti. These mangroves shelter exceptional biodiversity and offer a unique nature experience, ideal for birdwatching and ecotourism enthusiasts.",
      highlights: ["Preserved mangroves", "Coastal biodiversity", "Birdwatching", "Ecotourism"],
    },
    ar: {
      description: "أشجار المانغروف المحمية في غودوريا، موطن أنواع كثيرة من الطيور المهاجرة.",
      longDescription: "تشكل أوبوك ومانغروف غودوريا نظاماً بيئياً ساحلياً ثميناً في شمال جيبوتي. تؤوي هذه المانغروف تنوعاً بيولوجياً استثنائياً وتوفر تجربة طبيعية فريدة، مثالية لمراقبة الطيور والسياحة البيئية.",
      highlights: ["مانغروف محمية", "تنوع بيولوجي ساحلي", "مراقبة الطيور", "سياحة بيئية"],
    },
  },
  "foret-day": {
    en: {
      description: "Djibouti's last juniper forest, a unique mountain ecosystem.",
      longDescription: "The Day Forest is a biodiversity sanctuary perched at over 1000m altitude in the Goda massif. This forest of ancient junipers shelters endemic animal and plant species, including bird species found nowhere else in the world.",
      highlights: ["Century-old junipers", "Endemic species", "Cool altitude", "Mountain hiking"],
    },
    ar: {
      description: "آخر غابة عرعر في جيبوتي، نظام بيئي جبلي فريد.",
      longDescription: "غابة داي محمية للتنوع البيولوجي تقع على ارتفاع يزيد على 1000 متر في جبال غودا. تأوي هذه الغابة من أشجار العرعر العريقة أنواعاً حيوانية ونباتية متوطنة، منها أنواع من الطيور لا توجد في أي مكان آخر في العالم.",
      highlights: ["أشجار عرعر معمّرة", "أنواع متوطنة", "مناخ جبلي بارد", "تنزه جبلي"],
    },
  },
  "abourma": {
    en: {
      description: "Rock carvings over 8,000 years old, witnesses to African prehistory.",
      longDescription: "The Abourma site houses one of the largest concentrations of rock carvings in the Horn of Africa. These representations of animals and scenes of life engraved in rock testify to a thriving prehistoric civilization in the region more than 8,000 years ago.",
      highlights: ["Prehistoric rock art", "+8,000 years of history", "Unique site in Africa", "Archaeologist guide"],
    },
    ar: {
      description: "نقوش صخرية يزيد عمرها على 8000 عام، شاهدة على عصور ما قبل التاريخ الأفريقية.",
      longDescription: "يضم موقع أبورما واحدة من أكبر تجمعات النقوش الصخرية في القرن الأفريقي. هذه التصويرات للحيوانات ومشاهد الحياة المنقوشة في الصخر تشهد على حضارة ما قبل التاريخ المزدهرة في المنطقة منذ أكثر من 8000 عام.",
      highlights: ["فن صخري ما قبل التاريخ", "+8000 سنة من التاريخ", "موقع فريد في أفريقيا", "مرشد أثري"],
    },
  },
  "iles-moucha-maskali": {
    en: {
      description: "Two paradise islands with preserved coral reefs in the Gulf of Tadjoura.",
      longDescription: "The Moucha and Maskali Islands are true gems of the Red Sea. Surrounded by colorful coral reefs and crystal-clear waters, these islands offer the perfect beach getaway with diving, snorkeling, fishing, and relaxation on dream beaches.",
      highlights: ["Coral reefs", "Diving and snorkeling", "Secluded beaches", "Deep-sea fishing"],
    },
    ar: {
      description: "جزيرتان جنتان بشعاب مرجانية محفوظة في خليج تاجورة.",
      longDescription: "جزر موشا وماسكالي جواهر حقيقية في البحر الأحمر. تحاط بشعاب مرجانية ملونة ومياه صافية كالكريستال، وتوفر هاتان الجزيرتان هرباً شاطئياً مثالياً مع الغوص والغطس والصيد والاسترخاء على شواطئ أحلام.",
      highlights: ["شعاب مرجانية", "غوص وغطس", "شواطئ معزولة", "صيد في أعماق البحار"],
    },
  },
};

// ── Public helper ──────────────────────────────────────────────────────────

export function translateDestination(dest: Destination, locale: Locale): Destination {
  if (locale === "fr") return dest;

  const content = destContent[dest.slug]?.[locale];
  const difficulty = difficultyMap[dest.difficulty]?.[locale] ?? dest.difficulty;
  const duration = durationMap[dest.duration]?.[locale] ?? dest.duration;
  const bestTime = bestTimeMap[dest.bestTime]?.[locale] ?? dest.bestTime;

  return {
    ...dest,
    description: content?.description ?? dest.description,
    longDescription: content?.longDescription ?? dest.longDescription,
    highlights: content?.highlights ?? dest.highlights,
    difficulty,
    duration,
    bestTime,
  };
}

export function translateDestinations(dests: Destination[], locale: Locale): Destination[] {
  return dests.map((d) => translateDestination(d, locale));
}
