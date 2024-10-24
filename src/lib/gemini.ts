import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// API key validation
const isValidApiKey = (key: string | undefined): boolean => {
  return typeof key === 'string' && key.length > 0 && key.startsWith('AI');
};

if (!isValidApiKey(API_KEY)) {
  console.warn('Geçersiz veya eksik Gemini API anahtarı.');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

const TURKISH_DISHES = [
  'Karnıyarık',
  'İmam Bayıldı',
  'Mantı',
  'Mercimek Çorbası',
  'Kuru Fasulye',
  'İskender Kebap',
  'Patlıcan Musakka',
  'Zeytinyağlı Dolma',
  'Lahmacun',
  'Pide',
  'Menemen',
  'Çiğ Köfte',
  'Ali Nazik',
  'Hünkar Beğendi',
  'Kısır'
];

const FALLBACK_RECIPE = {
  name: "API Yapılandırma Talimatları",
  ingredients: [
    "1. Google AI Studio'dan alınmış geçerli bir API anahtarı",
    "2. Netlify ortam değişkeni yapılandırması"
  ],
  instructions: [
    "1. https://makersuite.google.com/app/apikey adresine gidin",
    "2. Yeni bir API anahtarı oluşturun",
    "3. Netlify dashboard'a gidin",
    "4. Site ayarlarına girin (Site settings)",
    "5. 'Environment variables' bölümünü bulun",
    "6. 'Add a variable' butonuna tıklayın",
    "7. Key: VITE_GEMINI_API_KEY",
    "8. Value: AI... ile başlayan API anahtarınız",
    "9. 'Save' butonuna tıklayın",
    "10. 'Deploy settings' bölümüne gidin",
    "11. 'Trigger deploy' butonuna tıklayın ve 'Clear cache and deploy site' seçin"
  ],
  prepTime: "10 dakika",
  cookTime: "5 dakika",
  difficulty: "Kolay",
  nutritionInfo: {
    calories: "0 kcal",
    protein: "0g",
    carbs: "0g",
    fat: "0g"
  }
};

export async function getRecipeRecommendations(ingredients: string[], preferences: string) {
  if (!isValidApiKey(API_KEY)) {
    return FALLBACK_RECIPE;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const suggestedDish = ingredients.length === 0 
      ? TURKISH_DISHES[Math.floor(Math.random() * TURKISH_DISHES.length)]
      : null;

    const prompt = `${suggestedDish 
      ? `Lütfen ${suggestedDish} tarifini ver.`
      : `Bana şu malzemelerle yapılabilecek bir Türk yemek tarifi öner: ${ingredients.join(', ')}.`
    }
    ${preferences ? `Kullanıcı tercihleri: ${preferences}` : ''}
    
    Lütfen şu formatta yanıt ver:
    {
      "name": "Tarif adı",
      "ingredients": ["Malzeme 1 ve miktarı", "Malzeme 2 ve miktarı"],
      "instructions": ["Adım 1", "Adım 2"],
      "prepTime": "Hazırlık süresi",
      "cookTime": "Pişirme süresi",
      "difficulty": "Zorluk seviyesi (Kolay/Orta/Zor)",
      "nutritionInfo": {
        "calories": "Kalori (100g için)",
        "protein": "Protein miktarı",
        "carbs": "Karbonhidrat miktarı",
        "fat": "Yağ miktarı"
      }
    }
    
    Lütfen tüm değerleri Türkçe olarak ver ve tarifi detaylı açıkla.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Recipe generation error:', error);
    throw new Error('API anahtarı geçersiz veya eksik. Lütfen talimatları takip ederek geçerli bir API anahtarı ekleyin.');
  }
}