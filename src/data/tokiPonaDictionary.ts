/* src/data/tokiPonaDictionary.ts */
export const TOKI_PONA_DICTIONARY: Record<string, string> = {
  "a": "ah, ha, oh", "akesi": "reptile, lizard", "ala": "no, not, zero", "alasa": "hunt, forage", "ale": "all, every, life", "ali": "all, every, life (variant)", "anpa": "down, low, bottom", "ante": "different, other", "anu": "or", "awen": "stay, wait, keep", "e": "object marker", "en": "and (subjects)",
  "epiku": "epic, awesome", "esun": "market, shop", "ijo": "thing, object", "ike": "bad, evil, complex", "ilo": "tool, machine", "insa": "inside, stomach", "jaki": "dirty, gross",
  "jasima": "reflect, mirror", "jan": "person, human", "jelo": "yellow, light green", "jo": "have, hold", "kala": "fish, sea creature", "kalama": "sound, noise", "kama": "come, become",
  "kasi": "plant, leaf", "ken": "can, possible", "kepeken": "use, with", "kijetesantakalu": "raccoon, otter", "kili": "fruit, vegetable", "kiwen": "hard, rock, metal", "ko": "clay, paste, powder", "kon": "air, spirit, soul", "kule": "color, colorful", "kulupu": "group, community", "kute": "hear, listen",
  "ku": "interacting with dictionary", "la": "context marker", "lanpan": "get, take, seize", "lape": "sleep, rest", "laso": "blue, green", "lawa": "head, main, lead", "len": "cloth, clothes", "lete": "cold, raw",
  "li": "predicate marker", "lili": "small, few", "linja": "long thin thing, hair", "lipu": "document, book, paper", "loje": "red, reddish", "lon": "be at, real, true",
  "luka": "hand, arm, five", "lukin": "look, see, read", "lupa": "hole, door, window", "ma": "land, earth, country", "mama": "parent, ancestor", "mani": "money, wealth",
  "meli": "woman, female", "meso": "middle, medium", "mi": "I, me, my", "mije": "man, male", "misikeke": "medicine", "moku": "eat, drink, food", "moli": "death, die, kill", "monsi": "back, rear", "monsuta": "monster, fear",
  "mu": "cute animal sound", "mun": "moon, star", "musi": "fun, play, art", "mute": "many, very, much", "n": "n (syllabic)", "nanpa": "number, digit",
  "nasa": "crazy, silly, strange", "nasin": "way, path, method", "nena": "bump, nose, hill", "ni": "this, that", "nimi": "name, word", "noka": "foot, leg, bottom",
  "o": "vocative, imperative", "oko": "eye", "olin": "love, affection", "ona": "he, she, it, they", "open": "open, begin", "pakala": "break, mistake", "pali": "do, work, make",
  "palisa": "rod, stick, branch", "pan": "grain, bread, pasta", "pana": "give, send, emit", "pi": "of (regrouping)", "pilin": "feel, heart", "pimeja": "black, dark",
  "pini": "end, finish, past", "pipi": "bug, insect", "poka": "side, hip, near", "poki": "box, container", "pona": "good, simple, fix", "pu": "Toki Pona book",
  "sama": "same, similar", "seli": "heat, fire, warm", "selo": "outer layer, skin", "seme": "what, which", "sewi": "high, up, divine", "sijelo": "body, torso",
  "sike": "circle, wheel, year", "sin": "new, fresh, extra", "sina": "you, your", "sinpin": "front, face, wall", "sitelen": "picture, image", "sona": "know, wisdom",
  "soko": "mushroom, fungus", "soweli": "animal, beast", "suli": "big, long, important", "suno": "sun, light", "supa": "surface, furniture", "suwi": "sweet, cute", "tan": "from, cause",
  "taso": "only, but", "tawa": "go to, for, move", "telo": "water, liquid", "tenpo": "time, moment", "toki": "speech, say, hello", "tomo": "house, room", "tu": "two, divide", "unpa": "sex, sexual", "uta": "mouth, lips", "utala": "fight, battle", "walo": "white, light",
  "wan": "one, unique", "waso": "bird, winged animal", "wawa": "strong, power", "weka": "away, absent", "wile": "want, need, must"
};

export const WORD_FREQUENCY: Record<string, number> = {
  // Tier 1 — multiplier 1.5
  "li": 1.5, "e": 1.5, "la": 1.5, "mi": 1.5, "sina": 1.5, "ona": 1.5, "jan": 1.5, 
  "toki": 1.5, "pona": 1.5, "lon": 1.5, "tawa": 1.5, "ala": 1.5, "ni": 1.5, 
  "wile": 1.5, "sona": 1.5, "moku": 1.5, "telo": 1.5, "ken": 1.5, "awen": 1.5, 
  "pali": 1.5, "jo": 1.5, "lukin": 1.5, "kama": 1.5, "pini": 1.5, "open": 1.5,

  // Tier 2 — multiplier 1.25
  "tomo": 1.25, "soweli": 1.25, "meli": 1.25, "mije": 1.25, "suli": 1.25, 
  "lili": 1.25, "mute": 1.25, "wan": 1.25, "tu": 1.25, "ale": 1.25, "ike": 1.25, 
  "pilin": 1.25, "tenpo": 1.25, "ma": 1.25, "nasin": 1.25, "nimi": 1.25, 
  "sitelen": 1.25, "lipu": 1.25, "kalama": 1.25, "seli": 1.25, "lete": 1.25, 
  "wawa": 1.25, "luka": 1.25, "noka": 1.25, "sewi": 1.25, "anpa": 1.25, 
  "insa": 1.25, "monsi": 1.25, "sinpin": 1.25, "poka": 1.25
};
