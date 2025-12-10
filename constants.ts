import { FertilizerType } from './types';

export const BREEDERS: Record<string, string[]> = {
  "ロサオリエンティス (Rosa Orientis)": [
    "シェエラザード", "オデュッセイア", "ダフネ", "マイローズ", "シャリマー", "リュシオール", "トロイメライ", "プラリエ", "リラ", "カミーユ"
  ],
  "デビットオースチン (David Austin)": [
    "オリビア・ローズ・オースチン", "ボスコベル", "ガブリエル・オーク", "ユーステイシア・ヴァイ", "デスデモーナ", "レディ・エマ・ハミルトン", "クイーン・オブ・スウェーデン", "ジュード・ジ・オブスキュア", "ゴールデン・セレブレーション", "プリンセス・アレキサンドラ・オブ・ケント"
  ],
  "河本バラ園 (Kawamoto Rose)": [
    "ガブリエル", "ルシファー", "ラ・マリエ", "プリュム", "サフィレット", "コフレ", "シュシュ", "ミスティ・パープル"
  ],
  "ローズトメルスリー (Rose de Mulsanne)": [
    "サマルカンド", "コフレ", "プティ・プランス", "エール", "カタン", "ローブ・ア・ラ・フランセーズ"
  ],
  "京成バラ園 (Keisei Rose)": [
    "快挙", "恋結び", "しののめ", "ローズうらら", "薫乃", "桃香", "結愛", "ほのか", "アミ・ロマンティカ"
  ],
  "メイアン (Meilland)": [
    "ピエール・ドゥ・ロンサール", "パパ・メイアン", "ボレロ", "マイ・ガーデン", "レオナルド・ダ・ヴィンチ", "ミミ・エデン"
  ],
  "デルバール (Delbard)": [
    "ナエマ", "クロード・モネ", "ラ・パリジェンヌ", "ローズ・ポンパドゥール", "エドゥアール・マネ", "シャンテ・ロゼ・ミサト", "ソレイユ・ヴァルティカル"
  ],
  "タンタウ (Tantau)": [
    "ノスタルジー", "アスコット", "レイニー・ブルー", "アスピリン・ローズ", "バイランド", "カフェ"
  ]
};

export const FERTILIZERS: { value: FertilizerType; label: string }[] = [
  { value: 'VITALIZER', label: '活力剤 (Vitalizer)' },
  { value: 'SOLID', label: '固形肥料 (Solid)' },
  { value: 'LIQUID', label: '液体肥料 (Liquid)' },
];

export const TRANSPLANT_TYPES = [
  { value: 'TRANSPLANT', label: '植え替え (Repotting)' },
  { value: 'POT_UP', label: '鉢増し (Pot Up)' },
  { value: 'SOIL_RENEWAL', label: '用土替え (Soil Renewal)' },
  { value: 'GROUND', label: '地植え (Planting in Ground)' },
];

export const SOIL_TYPES = [
  { value: 'PREMIUM_ROSE', label: 'プレミアムローズ培養土 (Premium)' },
  { value: 'BIOGOLD', label: 'バイオゴールドの土 (Biogold)' },
  { value: 'AUSTIN', label: 'オースチンバラの土 (Austin)' },
  { value: 'BARANOIE', label: 'バラの家 培養土 (Baranoie)' },
  { value: 'HYPONEX', label: 'ハイポネックス バラの培養土' },
  { value: 'AKADAMA', label: '赤玉土 (Akadama)' },
  { value: 'COMPOST', label: '堆肥 (Compost)' },
  { value: 'PEAT', label: 'ピートモス (Peat Moss)' },
  { value: 'OTHER', label: 'その他 (Other)' },
];

export const ISSUES = [
  { label: '黒星病 (Black Spot)', type: 'DISEASE' },
  { label: 'うどんこ病 (Mildew)', type: 'DISEASE' },
  { label: 'アブラムシ (Aphids)', type: 'PEST' },
  { label: 'コガネムシ (Beetles)', type: 'PEST' },
  { label: 'チュウレンジハバチ (Sawfly)', type: 'PEST' },
  { label: 'カイガラムシ (Scale)', type: 'PEST' },
  { label: '薬剤散布 (Spray Prevention)', type: 'PREVENTION' },
];

// Dictionary for auto-filling rose features
export const ROSE_LIBRARY: Record<string, { type: number; feature: string }> = {
  // Rosa Orientis
  "シェエラザード": { type: 1, feature: "Deep pink, pointed petals, strong damask scent. Very distinct." },
  "オデュッセイア": { type: 2, feature: "Bluish crimson, wavy petals, rich damask fragrance. Climber potential." },
  "ダフネ": { type: 1, feature: "Soft pink ruffles, fades to green. Excellent disease resistance." },
  "マイローズ": { type: 0, feature: "Type 0 resistance! Pure red, compact, continuous bloomer." },
  "シャリマー": { type: 0, feature: "Soft pink to white gradient. Highly resistant (Type 0) and fragrant." },
  "リュシオール": { type: 0, feature: "Bright yellow, Type 0. Compact and disease resistant." },
  "トロイメライ": { type: 0, feature: "Pink apricot blend. Very fragrant and highly resistant." },
  "リラ": { type: 0, feature: "Lilac purple. Type 0. Deep fragrance and classic shape." },
  
  // David Austin
  "オリビア・ローズ・オースチン": { type: 1, feature: "Soft pink cupped rosettes. Fruity fragrance. Extremely healthy." },
  "ボスコベル": { type: 2, feature: "Rich salmon-pink. Complex myrrh and hawthorn fragrance." },
  "ガブリエル・オーク": { type: 1, feature: "Deep pink, many petalled rosette. Strong fruity fragrance." },
  "ユーステイシア・ヴァイ": { type: 2, feature: "Soft apricot-pink. Intense fruity fragrance." },
  "デスデモーナ": { type: 1, feature: "Peachy pink buds opening to white. Old rose fragrance." },
  "レディ・エマ・ハミルトン": { type: 2, feature: "Tangerine orange-yellow. Strong fruity scent. Dark bronze foliage." },
  "クイーン・オブ・スウェーデン": { type: 2, feature: "Soft pink, upright growth. Myrrh fragrance. Very elegant." },
  "ジュード・ジ・オブスキュア": { type: 3, feature: "Buff yellow. Extremely strong citrus/guava fragrance." },
  
  // Kawamoto
  "ガブリエル": { type: 3, feature: "Pure white with purple center. Heavenly scent but requires care (Type 3)." },
  "ルシファー": { type: 3, feature: "Pale lilac, mysterious beauty. Needs protection from pests/disease." },
  "ラ・マリエ": { type: 2, feature: "Frilly pink petals, distinct scent. 'The Bride'." },
  "サフィレット": { type: 2, feature: "White with mauve shading. Unique vintage look." },
  "コフレ": { type: 2, feature: "Mauve/Green outer petals. Excellent vase life. Very popular." },
  
  // Delbard
  "ナエマ": { type: 2, feature: "Soft pink, cup-shaped. Intense fruity/citrus fragrance. Vigorous climber." },
  "クロード・モネ": { type: 2, feature: "Pink with yellow stripes. Very painterly. Good scent." },
  "ラ・パリジェンヌ": { type: 1, feature: "Orange, yellow, pink blend. Very free flowering and healthy." },
  "エドゥアール・マネ": { type: 2, feature: "Light yellow with pink stripes. Fruity fragrance. Climber." },
  
  // Meilland
  "ピエール・ドゥ・ロンサール": { type: 2, feature: "Creamy white with pink edge. World's favorite climber. Mild scent." },
  "ボレロ": { type: 1, feature: "Pure white, packed with petals. Strong fruity fragrance. Compact." },
  "レオナルド・ダ・ヴィンチ": { type: 1, feature: "Bengal pink. Very tough, rain resistant. Mild scent." },
  
  // Keisei
  "快挙": { type: 1, feature: "Bright yellow, large flowers. Good resistance." },
  "薫乃": { type: 2, feature: "Soft cream/pink. Incredible fragrance (Perfume industry standard)." },
  "ローズうらら": { type: 1, feature: "Shocking pink. Extremely robust and floriferous." },
  
  // Tantau
  "レイニー・ブルー": { type: 2, feature: "Violet-blue clusters. Gentle climber. Very popular in Japan." },
  "ノスタルジー": { type: 1, feature: "Cherry red edges, creamy white center. Distinct bi-color." }
};