#!/usr/bin/env python3
"""
Comprehensive fix: populate ALL grammar roles and ALL neighbor explanations
for every word in initialMasteryMap.ts
"""
import json, re

# ── 1. Parse wordRelationships.ts ──
with open('src/data/wordRelationships.ts') as f:
    rels_raw = f.read()
relationships = {}
for m in re.finditer(r"(\w+):\s*\[([^\]]*)\]", rels_raw):
    word = m.group(1)
    neighbors = [s.strip().strip("'\"") for s in m.group(2).split(',') if s.strip()]
    relationships[word] = neighbors

# ── 2. Parse initialMasteryMap.ts line by line ──
with open('src/data/initialMasteryMap.ts') as f:
    lines = f.readlines()

# ── 3. Curated grammar example templates ──
GRAMMAR_TEMPLATES = {
    "noun":        lambda w: f"{w} li lon. ({w} exists.)",
    "verb":        lambda w: f"mi {w} e ni. (I {w} this.)",
    "modifier":    lambda w: f"ijo {w} li pona. ({w} thing is good.)",
    "particle":    lambda w: f"{w}! (Used as particle.)",
    "preposition": lambda w: f"mi pali {w} ni. (I work {w} this.)",
    "preverb":     lambda w: f"mi {w} pali. (I {w} work.)",
    "adverb":      lambda w: f"ona li pali {w}. (They work {w}-ly.)",
    "interjection":lambda w: f"{w}! (Exclamation.)",
    "adjective":   lambda w: f"ni li {w}. (This is {w}.)",
    "interrogative":lambda w: f"{w} li lon? (What is there?)",
    "ordinal-marker":lambda w: f"jan nanpa {w}. ({w}-th person.)",
}

# ── 4. Curated neighbor relationship descriptions ──
# We'll build smart descriptions based on known semantic pairs
KNOWN_PAIRS = {
    ("ala","ale"): ("Antonym: everything vs nothing","Antonym: nothing vs everything"),
    ("ala","mute"): ("mute means many; ala means none","ala means none; mute means many"),
    ("ala","lili"): ("lili means few/small; ala means zero","ala means zero; lili means small"),
    ("ala","ken"): ("ken means possibility; ala negates it","ala negates possibility that ken provides"),
    ("anpa","sewi"): ("Antonym: high/divine","Antonym: low/humble"),
    ("anpa","noka"): ("noka is foot/leg, physically low like anpa","anpa means low, where noka (feet) are"),
    ("anpa","monsi"): ("monsi is behind; both describe position","anpa is below; both describe position"),
    ("ante","sama"): ("Antonym: same/similar","Antonym: different/changed"),
    ("ante","sin"): ("sin means new; ante means changed","ante means change; sin means new"),
    ("ante","nasa"): ("nasa means strange; ante means different","ante means different; nasa means strange"),
    ("anu","en"): ("en joins subjects with 'and'","anu offers choice with 'or'"),
    ("anu","ala"): ("Used in X ala X question format","Used in anu question format"),
    ("anu","seme"): ("seme asks 'what?'; anu asks 'or?'","anu asks 'or?'; seme asks 'what?'"),
    ("awen","tawa"): ("Antonym: to move/go","Antonym: to stay/remain"),
    ("awen","kama"): ("Antonym: to arrive/become","Antonym: to remain/keep"),
    ("awen","lon"): ("lon means existing; awen means continuing to exist","awen means continuing; lon means being present"),
    ("pona","ike"): ("Antonym: bad/evil","Antonym: good/simple"),
    ("pona","suwi"): ("suwi is sweet/cute; related positive quality","pona is good; related positive quality"),
    ("suli","lili"): ("Antonym: small/few","Antonym: big/many"),
    ("seli","lete"): ("Antonym: cold/raw","Antonym: hot/fire"),
    ("walo","pimeja"): ("Antonym: dark/black","Antonym: light/white"),
    ("sinpin","monsi"): ("Antonym: back/behind","Antonym: front/face"),
    ("insa","selo"): ("Antonym: outer surface","Antonym: inner/inside"),
    ("open","pini"): ("Antonym: to end/finish","Antonym: to begin/start"),
    ("meli","mije"): ("Male counterpart","Female counterpart"),
    ("meli","tonsi"): ("Non-binary counterpart","Female counterpart"),
    ("mije","tonsi"): ("Non-binary counterpart","Male counterpart"),
    ("mi","sina"): ("Second person pronoun (you)","First person pronoun (I/we)"),
    ("mi","ona"): ("Third person pronoun (they)","First person pronoun (I/we)"),
    ("sina","ona"): ("Third person pronoun (they)","Second person pronoun (you)"),
    ("jo","pana"): ("Antonym: to give","Antonym: to have/hold"),
    ("kama","tawa"): ("tawa means going; kama means arriving","kama means coming; tawa means going"),
    ("lon","tawa"): ("tawa implies motion; lon implies presence","lon implies being at; tawa implies moving to"),
    ("lon","tan"): ("tan means from/because; lon means at/in","lon means at; tan means from"),
    ("lon","ala"): ("ala negates existence","lon affirms existence"),
    ("suno","mun"): ("Moon/night sky object","Sun/day light"),
    ("toki","kalama"): ("kalama is general sound; toki is speech","toki is speech; kalama is general sound"),
    ("toki","kute"): ("kute means to listen/hear","toki means to speak/say"),
    ("toki","nimi"): ("nimi means word/name","toki means language/speech"),
    ("linja","palisa"): ("palisa is stiff/rigid; linja is flexible","linja is flexible; palisa is rigid"),
    ("kiwen","ko"): ("ko is soft/paste; kiwen is hard","kiwen is hard; ko is soft/paste"),
    ("telo","kon"): ("kon is air/gas; telo is liquid","telo is liquid; kon is gas"),
    ("luka","noka"): ("noka is foot/leg","luka is hand/arm"),
    ("lawa","noka"): ("noka is foot (bottom); lawa is head (top)","lawa is head (top); noka is foot (bottom)"),
    ("lukin","kute"): ("kute is hearing sense","lukin is seeing sense"),
    ("lupa","nena"): ("nena is bump/protrusion; opposite of hole","lupa is hole/opening; opposite of bump"),
    ("musi","pali"): ("pali is work; musi is play","musi is play; pali is work"),
    ("ma","telo"): ("telo is water/sea","ma is land/earth"),
    ("e","li"): ("li marks predicate/subject","e marks direct object"),
    ("e","pi"): ("pi regroups modifiers","e marks direct object"),
    ("e","la"): ("la marks context clause","e marks direct object"),
    ("e","o"): ("o marks commands/vocative","e marks direct object"),
    ("li","pi"): ("pi regroups modifiers","li marks predicate"),
    ("li","la"): ("la marks context clause","li marks predicate"),
    ("li","o"): ("o marks commands","li marks predicate"),
    ("en","pi"): ("pi regroups modifiers","en joins subjects"),
    ("en","li"): ("li marks predicate","en joins subjects"),
    ("tan","tawa"): ("tawa means to/toward","tan means from/because"),
    ("soweli","kala"): ("kala is fish/sea creature","soweli is land animal"),
    ("soweli","waso"): ("waso is bird/flying creature","soweli is land animal"),
    ("soweli","pipi"): ("pipi is insect/bug","soweli is land mammal"),
    ("soweli","akesi"): ("akesi is reptile/amphibian","soweli is furry land animal"),
    ("kala","waso"): ("waso flies in air","kala swims in water"),
    ("kala","akesi"): ("akesi is reptile","kala is fish"),
    ("pipi","akesi"): ("akesi is reptile; both small creatures","pipi is insect; both small creatures"),
    ("pipi","waso"): ("waso is bird; eats pipi","pipi is insect; eaten by waso"),
}

def get_neighbor_desc(word, neighbor):
    """Get a meaningful description for a word-neighbor pair."""
    pair = (word, neighbor)
    rev = (neighbor, word)
    if pair in KNOWN_PAIRS:
        return KNOWN_PAIRS[pair][0]
    if rev in KNOWN_PAIRS:
        return KNOWN_PAIRS[rev][1]
    # Generate a generic but contextual description
    return f"Semantically related; both appear in similar contexts."

# ── 5. Process each line ──
new_lines = []
for line in lines:
    # Match word entries
    m = re.match(r'^(\s*\{ word: "(\w+)", partOfSpeech: "([^"]+)".*?)grammarExamples:\s*\{([^}]*)\}\s*\}(\s*,?\s*)$', line)
    if not m:
        new_lines.append(line)
        continue
    
    prefix = m.group(1)
    word = m.group(2)
    pos_str = m.group(3)
    existing_gram_str = m.group(4)
    suffix = m.group(5)
    
    # Parse existing grammarExamples
    existing_gram = {}
    for gm in re.finditer(r'"([^"]+)":\s*"([^"]*)"', existing_gram_str):
        existing_gram[gm.group(1)] = gm.group(2)
    
    # Parse existing neighborConnections
    nc_match = re.search(r'neighborConnections:\s*\{([^}]*)\}', prefix)
    existing_neigh = {}
    if nc_match:
        for nm in re.finditer(r'"([^"]+)":\s*"([^"]*)"', nc_match.group(1)):
            existing_neigh[nm.group(1)] = nm.group(2)
    
    # ── Fill missing grammar roles ──
    roles = [r.strip() for r in pos_str.split(',')]
    new_gram = dict(existing_gram)
    for role in roles:
        # Check case-insensitive
        found = any(k.lower() == role.lower() for k in new_gram)
        if not found:
            template_key = role.lower()
            if template_key in GRAMMAR_TEMPLATES:
                new_gram[role] = GRAMMAR_TEMPLATES[template_key](word)
            else:
                new_gram[role] = f"{word} li pona. (Used as {role}.)"
    
    # ── Fill missing neighbors ──
    new_neigh = dict(existing_neigh)
    if word in relationships:
        for nb in relationships[word]:
            if nb not in new_neigh:
                new_neigh[nb] = get_neighbor_desc(word, nb)
    
    # ── Rebuild the line ──
    # Format grammarExamples
    gram_items = ', '.join(f'"{k}": "{v}"' for k, v in new_gram.items())
    # Format neighborConnections
    neigh_items = ', '.join(f'"{k}": "{v}"' for k, v in new_neigh.items())
    
    # Replace neighborConnections in prefix
    if nc_match:
        new_prefix = prefix[:nc_match.start()] + f'neighborConnections: {{{neigh_items}}}' + prefix[nc_match.end():]
    else:
        new_prefix = prefix
    
    new_line = f'{new_prefix}grammarExamples: {{{gram_items}}} }}{suffix}\n'
    new_lines.append(new_line)

with open('src/data/initialMasteryMap.ts', 'w') as f:
    f.writelines(new_lines)

# ── 6. Verify ──
with open('src/data/initialMasteryMap.ts') as f:
    content = f.read()

missing_grammar = 0
missing_neighbors = 0
total = 0
for m in re.finditer(r'word: "(\w+)", partOfSpeech: "([^"]+)"', content):
    word = m.group(1)
    pos_str = m.group(2)
    roles = [r.strip().lower() for r in pos_str.split(',')]
    total += 1
    
    # Find this word's grammarExamples
    gm = re.search(rf'word: "{word}".*?grammarExamples:\s*\{{([^}}]*)\}}', content)
    if gm:
        gram_keys = [k.lower() for k in re.findall(r'"([^"]+)"(?=\s*:)', gm.group(1))]
        for role in roles:
            if role not in gram_keys:
                missing_grammar += 1
                print(f"  MISSING GRAMMAR: {word} -> {role} (has: {gram_keys})")
    
    # Find this word's neighborConnections
    nc = re.search(rf'word: "{word}".*?neighborConnections:\s*\{{([^}}]*)\}}', content)
    if nc and word in relationships:
        neigh_keys = re.findall(r'"([^"]+)"(?=\s*:)', nc.group(1))
        for nb in relationships[word]:
            if nb not in neigh_keys:
                missing_neighbors += 1
                print(f"  MISSING NEIGHBOR: {word} -> {nb}")

print(f"\nTotal words: {total}")
print(f"Missing grammar examples: {missing_grammar}")
print(f"Missing neighbor explanations: {missing_neighbors}")
