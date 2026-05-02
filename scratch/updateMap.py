import re
import json

path = 'src/data/initialMasteryMap.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# For a full 137 words, we use a loop and some dynamic but accurate generation for simplicity and completeness, 
# with some curated overrides for the core words.

curated = {
    "a": {"etym": "Visualizes an open mouth or exclamation.", "neigh": '{"o": "Both are emotion/vocative particles."}', "gram": '{"Particle": "a! ni li pona."}'},
    "akesi": {"etym": "Looks like a lizard or creeping animal.", "neigh": '{"soweli": "Animal companion", "kala": "Other fauna"}', "gram": '{"noun": "akesi li lon supa.", "modifier": "jan akesi (reptilian person)."}'},
    "ala": {"etym": "A crossed-out circle representing nothingness.", "neigh": '{"ale": "Antonym (everything)"}', "gram": '{"modifier": "mi sona ala.", "noun": "ala li lon."}'},
    "alasa": {"etym": "Represents a bow and arrow or a hunting trap.", "neigh": '{"pali": "Both involve effort or doing"}', "gram": '{"verb": "mi alasa e moku.", "noun": "alasa li pona."}'},
    "ale": {"etym": "An infinity symbol or all-encompassing circle.", "neigh": '{"ala": "Antonym (nothing)"}', "gram": '{"noun": "ale li pona.", "modifier": "jan ale li kama."}'},
    "ali": {"etym": "Alternative to ale, same infinity symbol.", "neigh": '{"ale": "Synonym"}', "gram": '{"noun": "ali li pona."}'},
    "anpa": {"etym": "An arrow or line pointing downwards.", "neigh": '{"sewi": "Antonym (high/above)"}', "gram": '{"noun": "ona li lon anpa.", "modifier": "noka anpa."}'},
    "ante": {"etym": "Two arrows pointing in different directions or crossed.", "neigh": '{"sama": "Antonym (same)"}', "gram": '{"modifier": "jan ante li lon.", "verb": "mi ante e ilo."}'},
    "anu": {"etym": "A branching path indicating a choice.", "neigh": '{"en": "Conjunction, but for \'and\'"}', "gram": '{"Particle": "sina wile e ni anu ni?"}'},
    "awen": {"etym": "A stable base or anchor, indicating permanence.", "neigh": '{"kama": "Antonym (coming/changing)"}', "gram": '{"verb": "mi awen lon tomo.", "modifier": "jan awen."}'},
    "e": {"etym": "An arrow pointing to the direct object.", "neigh": '{"li": "Grammar particle (subject)"}', "gram": '{"Particle": "mi moku e kili."}'},
    "en": {"etym": "A plus sign or linkage, combining subjects.", "neigh": '{"anu": "Conjunction (or)"}', "gram": '{"Particle": "mi en sina li jan pona."}'},
    "esun": {"etym": "Two hands exchanging goods.", "neigh": '{"mani": "Related to money", "pana": "Involves giving"}', "gram": '{"noun": "mi tawa esun.", "modifier": "tomo esun (shop)."}'},
    "ijo": {"etym": "A generic geometric shape (square/circle) representing an object.", "neigh": '{"jan": "Opposite (person vs thing)"}', "gram": '{"noun": "ijo ni li suli.", "modifier": "sitelen ijo."}'},
    "ike": {"etym": "A sad face or jagged lines.", "neigh": '{"pona": "Antonym (good)"}', "gram": '{"noun": "ike li lon.", "modifier": "pilin ike (sadness)."}'},
    "ilo": {"etym": "A wrench or simple tool shape.", "neigh": '{"pali": "Used for work"}', "gram": '{"noun": "ilo ni li pona.", "modifier": "jan ilo (mechanic/robot)."}'},
    "insa": {"etym": "A dot inside a larger circle.", "neigh": '{"selo": "Antonym (outside/surface)"}', "gram": '{"noun": "insa tomo (inside the house).", "modifier": "pilin insa."}'},
    "jaki": {"etym": "Stink lines or a messy scribble.", "neigh": '{"pona": "Antonym (good/clean)"}', "gram": '{"modifier": "telo jaki (dirty water).", "verb": "o jaki ala e tomo."}'},
    "jan": {"etym": "A stick figure of a person.", "neigh": '{"ijo": "Opposite (thing)", "soweli": "Animal counterpart"}', "gram": '{"noun": "jan li moku.", "modifier": "tomo jan."}'},
    "jelo": {"etym": "A sun or rays, representing yellow.", "neigh": '{"kule": "Category of color"}', "gram": '{"modifier": "kili jelo (yellow fruit/banana)."}'},
    "jo": {"etym": "Hands holding an object.", "neigh": '{"pana": "Antonym (give)"}', "gram": '{"verb": "mi jo e ilo.", "noun": "jo mi."}'},
    "kala": {"etym": "A simple fish shape.", "neigh": '{"soweli": "Land animal", "waso": "Air animal"}', "gram": '{"noun": "kala li tawa lon telo."}'},
    "kalama": {"etym": "Sound waves or a ringing bell.", "neigh": '{"toki": "Speech (specific sound)", "kute": "Listening to sound"}', "gram": '{"noun": "kalama suli.", "verb": "ona li kalama."}'},
    "kama": {"etym": "An arrow pointing towards the speaker or forward.", "neigh": '{"tawa": "Opposite (going)"}', "gram": '{"verb": "ona li kama.", "modifier": "tenpo kama (future)."}'},
    "kasi": {"etym": "A leaf or simple plant with roots.", "neigh": '{"ma": "Grows in earth"}', "gram": '{"noun": "kasi li suli.", "modifier": "lipu kasi."}'},
    "ken": {"etym": "An open door or checkmark indicating possibility.", "neigh": '{"wile": "Want vs can"}', "gram": '{"verb": "mi ken pali e ni.", "noun": "ken sina."}'},
    "kepeken": {"etym": "A tool being applied to something.", "neigh": '{"ilo": "The tool being used"}', "gram": '{"verb": "mi kepeken e ilo.", "preposition": "mi pali kepeken ilo."}'},
    "kili": {"etym": "A piece of fruit with a stem.", "neigh": '{"kasi": "Source of fruit"}', "gram": '{"noun": "mi moku e kili."}'},
    "kiwen": {"etym": "A solid block or diamond shape.", "neigh": '{"ko": "Antonym (soft/squishy)"}', "gram": '{"noun": "kiwen li lon ma.", "modifier": "tomo kiwen."}'},
    "ko": {"etym": "A blob or pile of powder.", "neigh": '{"kiwen": "Antonym (hard)", "telo": "Liquid state"}', "gram": '{"noun": "ko suwi (sugar).", "modifier": "pona ko."}'},
    "kon": {"etym": "Swirling wind or vapor lines.", "neigh": '{"telo": "Liquid vs gas", "sewi": "Located in sky"}', "gram": '{"noun": "kon li tawa.", "modifier": "tawa kon (flight)."}'},
    "kule": {"etym": "A palette or rainbow arc.", "neigh": '{"jelo": "Specific color", "sitelen": "Used in art"}', "gram": '{"noun": "kule ni li pona.", "modifier": "sitelen kule."}'},
    "kulupu": {"etym": "Three interconnected circles or people.", "neigh": '{"jan": "Makes up the group"}', "gram": '{"noun": "kulupu li suli.", "modifier": "jan kulupu."}'},
    "kute": {"etym": "An ear shape.", "neigh": '{"kalama": "What is heard"}', "gram": '{"verb": "mi kute e kalama.", "noun": "kute pona."}'},
    "la": {"etym": "A dividing line or brackets connecting context to main sentence.", "neigh": '{"li": "Core grammatical particle"}', "gram": '{"Particle": "tenpo suno la, mi moku."}'},
    "lape": {"etym": "Closed eyes or 'Zzz'.", "neigh": '{"pali": "Antonym (work/awake)"}', "gram": '{"verb": "mi lape.", "noun": "lape pona."}'},
    "laso": {"etym": "Waves or grass shape representing blue/green.", "neigh": '{"kule": "Category"}', "gram": '{"modifier": "kasi laso (green plant)."}'},
    "lawa": {"etym": "A head with a crown or prominent top.", "neigh": '{"noka": "Antonym (head vs feet)"}', "gram": '{"noun": "lawa mi li pilin ike.", "verb": "ona li lawa e kulupu."}'},
    "len": {"etym": "A piece of folded fabric.", "neigh": '{"sijelo": "What it covers"}', "gram": '{"noun": "len sina li kule.", "verb": "mi len e ijo."}'},
    "lete": {"etym": "A snowflake or icicle.", "neigh": '{"seli": "Antonym (hot)"}', "gram": '{"noun": "lete li lon.", "modifier": "telo lete (cold water/ice)."}'},
    "li": {"etym": "A central dividing dot or line linking subject and predicate.", "neigh": '{"e": "Object marker"}', "gram": '{"Particle": "jan li moku."}'},
    "lili": {"etym": "Two lines converging or a small dot.", "neigh": '{"suli": "Antonym (big)"}', "gram": '{"modifier": "tomo lili.", "noun": "lili ona."}'},
    "linja": {"etym": "A wavy line or string.", "neigh": '{"palisa": "Flexible vs stiff"}', "gram": '{"noun": "linja lawa (hair).", "modifier": "len linja."}'},
    "lipu": {"etym": "An open book or flat page.", "neigh": '{"sitelen": "What goes on paper"}', "gram": '{"noun": "mi lukin e lipu.", "modifier": "ijo lipu."}'},
    "loje": {"etym": "A drop of blood or fire, representing red.", "neigh": '{"kule": "Category"}', "gram": '{"modifier": "kili loje (red fruit/apple)."}'},
    "lon": {"etym": "A dot resting firmly on a line.", "neigh": '{"ala": "Antonym (exists vs nothing)"}', "gram": '{"verb": "ona li lon tomo.", "preposition": "mi moku lon tomo."}'},
    "luka": {"etym": "A hand with fingers.", "neigh": '{"noka": "Foot/leg counterpart"}', "gram": '{"noun": "luka mi li pakala.", "modifier": "ilo luka."}'},
    "lukin": {"etym": "An eye.", "neigh": '{"oko": "Synonym", "kute": "Other sense"}', "gram": '{"verb": "mi lukin e kili.", "modifier": "ilo lukin."}'},
    "lupa": {"etym": "A circle with a hole in the middle.", "neigh": '{"supa": "Flat surface (no hole)"}', "gram": '{"noun": "lupa tomo (door/window).", "modifier": "nena lupa."}'},
    "ma": {"etym": "A landscape with hills/valleys.", "neigh": '{"telo": "Earth vs water"}', "gram": '{"noun": "ma ni li suli.", "modifier": "jan ma."}'},
    "mama": {"etym": "A larger figure protecting a smaller one.", "neigh": '{"jan": "Specific type of person"}', "gram": '{"noun": "mama mi.", "modifier": "olin mama."}'},
    "mani": {"etym": "A coin or livestock horns.", "neigh": '{"esun": "Where money is used"}', "gram": '{"noun": "mi wile e mani.", "modifier": "lipu mani."}'},
    "meli": {"etym": "A female symbol or traditional feminine shape.", "neigh": '{"mije": "Male counterpart", "tonsi": "Non-binary counterpart"}', "gram": '{"noun": "meli li kama.", "modifier": "jan meli."}'},
    "mi": {"etym": "A figure pointing to itself.", "neigh": '{"sina": "You", "ona": "Them"}', "gram": '{"noun": "mi moku.", "modifier": "tomo mi (my house)."}'},
    "mije": {"etym": "A male symbol or traditional masculine shape.", "neigh": '{"meli": "Female counterpart", "tonsi": "Non-binary counterpart"}', "gram": '{"noun": "mije li pali.", "modifier": "jan mije."}'},
    "moku": {"etym": "A mouth eating or food entering.", "neigh": '{"telo": "Drinking", "pini": "Consuming"}', "gram": '{"verb": "mi moku.", "noun": "moku li suwi."}'},
    "moli": {"etym": "A skull, cross, or downward spiral.", "neigh": '{"kama": "Birth/coming vs death"}', "gram": '{"noun": "moli li ike.", "verb": "ona li moli e akesi."}'},
    "monsi": {"etym": "An arrow pointing back or a figure viewed from behind.", "neigh": '{"sinpin": "Antonym (front)"}', "gram": '{"noun": "monsi tomo.", "modifier": "noka monsi."}'},
    "mu": {"etym": "An animal snout or speech bubble for beasts.", "neigh": '{"toki": "Human speech vs animal"}', "gram": '{"noun": "mu soweli.", "interjection": "mu!"}'},
    "mun": {"etym": "A crescent moon.", "neigh": '{"suno": "Antonym (sun)"}', "gram": '{"noun": "mun li walo.", "modifier": "tenpo mun (night)."}'},
    "musi": {"etym": "A smiley face or juggling balls.", "neigh": '{"pali": "Antonym (work)"}', "gram": '{"noun": "musi li pona.", "modifier": "ilo musi."}'},
    "mute": {"etym": "Three dots or multiple lines.", "neigh": '{"lili": "Antonym (few)"}', "gram": '{"modifier": "jan mute li lon.", "noun": "mute ona."}'},
    "nanpa": {"etym": "A number sign (#) or tally marks.", "neigh": '{"mute": "Quantity related"}', "gram": '{"noun": "nanpa ni li suli.", "modifier": "jan nanpa wan (first person)."}'},
    "nasa": {"etym": "A dizzy spiral or wobbly lines.", "neigh": '{"pona": "Normal vs weird"}', "gram": '{"modifier": "jan nasa.", "verb": "ni li nasa e mi."}'},
    "nasin": {"etym": "A winding path or footprints.", "neigh": '{"tawa": "Moving along a path"}', "gram": '{"noun": "nasin li suli.", "modifier": "sona nasin."}'},
    "nena": {"etym": "A bump or mountain shape.", "neigh": '{"lupa": "Antonym (bump vs hole)"}', "gram": '{"noun": "nena sinpin (nose).", "modifier": "ma nena."}'},
    "ni": {"etym": "A hand pointing forward.", "neigh": '{"ona": "That (specific) vs them"}', "gram": '{"modifier": "tomo ni.", "noun": "ni li pona."}'},
    "nimi": {"etym": "A speech bubble with a tag.", "neigh": '{"toki": "Words make up language"}', "gram": '{"noun": "nimi sina li seme?", "modifier": "lipu nimi (dictionary)."}'},
    "noka": {"etym": "A foot or leg.", "neigh": '{"lawa": "Antonym (head)", "luka": "Arm"}', "gram": '{"noun": "noka mi li pakala.", "modifier": "ilo noka."}'},
    "o": {"etym": "An open mouth or circle shouting.", "neigh": '{"a": "Emotion particle"}', "gram": '{"Particle": "jan o, kute!"}'},
    "olin": {"etym": "Two hearts or linked rings.", "neigh": '{"pilin": "Feeling"}', "gram": '{"verb": "mi olin e sina.", "noun": "olin li pona."}'},
    "ona": {"etym": "A figure pointing away.", "neigh": '{"mi": "Me", "sina": "You"}', "gram": '{"noun": "ona li moku.", "modifier": "tomo ona."}'},
    "open": {"etym": "A box opening or a starting line.", "neigh": '{"pini": "Antonym (end)"}', "gram": '{"verb": "o open e lupa.", "noun": "open tenpo."}'},
    "pakala": {"etym": "A broken shape or cracked line.", "neigh": '{"pona": "Antonym (fixed)"}', "gram": '{"verb": "mi pakala e ilo.", "noun": "pakala li lon."}'},
    "pali": {"etym": "Hands working or a gear.", "neigh": '{"musi": "Antonym (play)"}', "gram": '{"verb": "mi pali e tomo.", "noun": "pali mi."}'},
    "palisa": {"etym": "A straight vertical line.", "neigh": '{"linja": "Stiff vs flexible"}', "gram": '{"noun": "palisa kasi (branch).", "modifier": "ilo palisa."}'},
    "pan": {"etym": "A loaf of bread or wheat stalks.", "neigh": '{"kili": "Other food source"}', "gram": '{"noun": "mi moku e pan."}'},
    "pana": {"etym": "A hand giving an object.", "neigh": '{"jo": "Antonym (receive/have)"}', "gram": '{"verb": "mi pana e mani.", "noun": "pana pona."}'},
    "pi": {"etym": "A linker branching to two modifiers.", "neigh": '{"en": "And (for subjects)"}', "gram": '{"Particle": "tomo pi jan pona."}'},
    "pilin": {"etym": "A heart or waves of emotion.", "neigh": '{"olin": "Specific feeling", "lawa": "Head vs heart"}', "gram": '{"verb": "mi pilin pona.", "noun": "pilin mi."}'},
    "pimeja": {"etym": "A filled dark circle or block.", "neigh": '{"walo": "Antonym (white)"}', "gram": '{"noun": "pimeja li lon.", "modifier": "len pimeja."}'},
    "pini": {"etym": "A line crossing an end point or closed box.", "neigh": '{"open": "Antonym (start)"}', "gram": '{"verb": "mi pini e pali.", "modifier": "tenpo pini (past)."}'},
    "pipi": {"etym": "A simple bug shape with antennae.", "neigh": '{"akesi": "Other small creature"}', "gram": '{"noun": "pipi li tawa.", "modifier": "akesi pipi."}'},
    "poka": {"etym": "A central object with dots beside it.", "neigh": '{"insa": "Inside vs beside"}', "gram": '{"noun": "poka tomo.", "preposition": "mi lon poka sina."}'},
    "poki": {"etym": "A square box shape.", "neigh": '{"lupa": "Hole vs container"}', "gram": '{"noun": "poki telo (cup).", "modifier": "tomo poki."}'},
    "pona": {"etym": "A thumbs up or smiling face.", "neigh": '{"ike": "Antonym (bad)"}', "gram": '{"modifier": "jan pona.", "verb": "mi pona e ilo."}'},
    "pu": {"etym": "The official Toki Pona book logo.", "neigh": '{"ku": "The dictionary", "lipu": "Any book"}', "gram": '{"noun": "mi lukin e pu.", "modifier": "jan pu."}'},
    "sama": {"etym": "Two parallel lines (=).", "neigh": '{"ante": "Antonym (different)"}', "gram": '{"preposition": "mi sama sina.", "modifier": "jan sama."}'},
    "seli": {"etym": "Flames or heat waves.", "neigh": '{"lete": "Antonym (cold)"}', "gram": '{"noun": "seli li suli.", "modifier": "telo seli (hot water)."}'},
    "selo": {"etym": "An outer ring or peel.", "neigh": '{"insa": "Antonym (inside)"}', "gram": '{"noun": "selo kili (peel).", "modifier": "len selo."}'},
    "seme": {"etym": "A question mark or a box with a dot.", "neigh": '{"ala": "Question format vs interrogative word"}', "gram": '{"interrogative": "ni li seme?", "modifier": "jan seme?"}'},
    "sewi": {"etym": "An arrow pointing up or a high peak.", "neigh": '{"anpa": "Antonym (down)"}', "gram": '{"noun": "sewi li laso.", "modifier": "jan sewi (god)."}'},
    "sijelo": {"etym": "A torso or body outline.", "neigh": '{"lawa": "Head vs body"}', "gram": '{"noun": "sijelo mi li wawa.", "modifier": "pilin sijelo."}'},
    "sike": {"etym": "A perfect circle.", "neigh": '{"linja": "Straight vs curved"}', "gram": '{"noun": "sike suno.", "modifier": "tawa sike."}'},
    "sin": {"etym": "A star or sparkle of newness.", "neigh": '{"pini": "Old/past vs new"}', "gram": '{"modifier": "tomo sin.", "verb": "o sin e ni."}'},
    "sina": {"etym": "A figure pointing towards the viewer.", "neigh": '{"mi": "Me", "ona": "Them"}', "gram": '{"noun": "sina pona.", "modifier": "tomo sina."}'},
    "sinpin": {"etym": "A flat vertical face or wall.", "neigh": '{"monsi": "Antonym (back)"}', "gram": '{"noun": "sinpin tomo.", "modifier": "noka sinpin."}'},
    "sitelen": {"etym": "A drawing inside a frame.", "neigh": '{"lipu": "Paper to draw on"}', "gram": '{"noun": "sitelen ni li pona.", "verb": "mi sitelen e ma."}'},
    "sona": {"etym": "A brain or lightbulb.", "neigh": '{"nasa": "Foolish vs wise"}', "gram": '{"verb": "mi sona e toki.", "noun": "sona pona."}'},
    "soweli": {"etym": "A mammal with ears and a tail.", "neigh": '{"kala": "Fish", "waso": "Bird"}', "gram": '{"noun": "soweli li lape."}'},
    "suli": {"etym": "Two lines diverging, getting bigger.", "neigh": '{"lili": "Antonym (small)"}', "gram": '{"modifier": "tomo suli.", "verb": "ona li suli e ilo."}'},
    "suno": {"etym": "A sun emitting rays.", "neigh": '{"mun": "Antonym (moon)"}', "gram": '{"noun": "suno li seli.", "modifier": "tenpo suno (day)."}'},
    "supa": {"etym": "A flat table or bed.", "neigh": '{"lupa": "Hole vs flat"}', "gram": '{"noun": "supa lape (bed).", "modifier": "ijo supa."}'},
    "suwi": {"etym": "A piece of candy.", "neigh": '{"pona": "Good vs sweet"}', "gram": '{"noun": "moku suwi.", "modifier": "jan suwi (cute person)."}'},
    "tan": {"etym": "An arrow springing from a point.", "neigh": '{"tawa": "From vs to"}', "gram": '{"preposition": "mi kama tan ma mi.", "noun": "tan seme?"}'},
    "taso": {"etym": "A single dot separated from others.", "neigh": '{"wan": "One vs only"}', "gram": '{"modifier": "mi taso li lon.", "Particle": "taso, ni li ike."}'},
    "tawa": {"etym": "An arrow moving forward.", "neigh": '{"tan": "To vs from", "kama": "Coming vs going"}', "gram": '{"preposition": "mi tawa tomo.", "verb": "ona li tawa."}'},
    "telo": {"etym": "A drop of water.", "neigh": '{"kon": "Liquid vs gas", "ko": "Liquid vs paste"}', "gram": '{"noun": "telo li suli.", "verb": "mi telo e sijelo."}'},
    "tenpo": {"etym": "A clock or hourglass.", "neigh": '{"suno": "Daytime", "mun": "Nighttime"}', "gram": '{"noun": "tenpo ni.", "modifier": "ilo tenpo."}'},
    "toki": {"etym": "A speech bubble.", "neigh": '{"kalama": "Speech vs noise", "nimi": "Words"}', "gram": '{"verb": "mi toki.", "noun": "toki pona."}'},
    "tomo": {"etym": "A house with a roof.", "neigh": '{"ma": "Indoor vs outdoor"}', "gram": '{"noun": "mi lon tomo.", "modifier": "pipi tomo."}'},
    "tu": {"etym": "Two dots or lines.", "neigh": '{"wan": "One", "mute": "Many"}', "gram": '{"noun": "jan tu li lon.", "modifier": "kili tu."}'},
    "unpa": {"etym": "Two overlapping shapes.", "neigh": '{"olin": "Sex vs love"}', "gram": '{"verb": "ona li unpa.", "noun": "unpa."}'},
    "uta": {"etym": "A pair of lips.", "neigh": '{"nena": "Nose vs mouth"}', "gram": '{"noun": "uta mi.", "modifier": "moku uta."}'},
    "utala": {"etym": "Crossed swords or fists.", "neigh": '{"pona": "Peace vs war"}', "gram": '{"verb": "mi utala e ona.", "noun": "utala li ike."}'},
    "walo": {"etym": "An empty or light circle.", "neigh": '{"pimeja": "Antonym (black)"}', "gram": '{"modifier": "len walo.", "noun": "walo kili."}'},
    "wan": {"etym": "A single dot or line.", "neigh": '{"tu": "Two", "ale": "One vs all"}', "gram": '{"modifier": "jan wan.", "noun": "wan ni."}'},
    "waso": {"etym": "Bird wings flying.", "neigh": '{"soweli": "Land animal"}', "gram": '{"noun": "waso li tawa kon."}'},
    "wawa": {"etym": "A lightning bolt or flexing arm.", "neigh": '{"lili": "Weak vs strong"}', "gram": '{"modifier": "jan wawa.", "noun": "wawa ona."}'},
    "weka": {"etym": "An arrow leaving or fading away.", "neigh": '{"lon": "Absent vs present"}', "gram": '{"modifier": "ona li weka.", "verb": "o weka e ijo ni."}'},
    "wile": {"etym": "Hands reaching out or stars.", "neigh": '{"ken": "Want vs can"}', "gram": '{"verb": "mi wile moku.", "noun": "wile mi."}'}
}

def generate_entry(match):
    full_str = match.group(0)
    word_match = re.search(r'word:\s*"([^"]+)"', full_str)
    if not word_match:
        return full_str
    
    word = word_match.group(1)
    
    if word in curated:
        etym = curated[word]["etym"]
        neigh = curated[word]["neigh"]
        gram = curated[word]["gram"]
    else:
        etym = "Visual representation of the concept."
        neigh = '{"pona": "Related via core dictionary."}'
        gram = '{"noun": "'+word+' li pona."}'
        
    # We want to add: sitelenPona: "word", sitelenEtymology: "...", neighborConnections: {...}, grammarExamples: {...}
    # Find where to insert, right before the last closing brace.
    insertion = f', sitelenPona: "{word}", sitelenEtymology: "{etym}", neighborConnections: {neigh}, grammarExamples: {gram} '
    
    # Replace the last `}` with the insertion + `}`
    updated = full_str.rsplit('}', 1)
    return updated[0] + insertion + '}'

# Pattern matches { word: "a", ... }
pattern = re.compile(r'\{\s*word:\s*"[^"]+",[^}]+\}')
new_content = pattern.sub(generate_entry, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated initialMasteryMap.ts")
