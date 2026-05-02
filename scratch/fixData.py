import re
import os

with open('src/data/wordRelationships.ts', 'r') as f:
    rels_content = f.read()

# Parse WORD_RELATIONSHIPS
relationships = {}
match = re.search(r'export const WORD_RELATIONSHIPS.*?=\s*\{(.*?)\n\};', rels_content, re.DOTALL)
if match:
    dict_content = match.group(1)
    for line in dict_content.split('\n'):
        if ':' in line:
            key_part, val_part = line.split(':', 1)
            key = key_part.strip().replace('"', '').replace("'", '')
            # Extract list of strings
            val_strs = re.findall(r"['\"](.*?)['\"]", val_part)
            relationships[key] = val_strs

with open('src/data/initialMasteryMap.ts', 'r') as f:
    mastery_content = f.read()

def replace_word(m):
    full_match = m.group(0)
    word = m.group(1)
    pos_str = m.group(2)
    pos_list = [p.strip() for p in pos_str.split(',')]
    
    # Extract existing neighborConnections and grammarExamples
    neigh_match = re.search(r'neighborConnections:\s*(\{.*?\})', full_match)
    gram_match = re.search(r'grammarExamples:\s*(\{.*?\})', full_match)
    
    existing_neighs = {}
    if neigh_match:
        import ast
        try:
            # Need to fix true/false or similar if present, but it's string:string dict
            dict_str = neigh_match.group(1)
            existing_neighs = eval(dict_str)
        except:
            pass
            
    existing_grams = {}
    if gram_match:
        try:
            dict_str = gram_match.group(1)
            existing_grams = eval(dict_str)
        except:
            pass

    # Ensure all parts of speech are in grammarExamples
    new_grams = dict(existing_grams)
    for p in pos_list:
        # Check case insensitively
        found = False
        for k in existing_grams.keys():
            if k.lower() == p.lower():
                found = True
                break
        if not found:
            # Add default example
            if p.lower() == "noun": new_grams[p] = f"ni li {word}."
            elif p.lower() == "verb": new_grams[p] = f"mi {word} e ni."
            elif p.lower() == "modifier": new_grams[p] = f"ijo {word} li pona."
            elif p.lower() == "particle": new_grams[p] = f"{word}!"
            elif p.lower() == "preverb": new_grams[p] = f"mi {word} pali."
            else: new_grams[p] = f"{word} li lon."

    # Ensure all neighbors from relationships are in neighborConnections
    new_neighs = dict(existing_neighs)
    if word in relationships:
        for n in relationships[word]:
            pure_name = n.split(' ')[0]
            if pure_name not in new_neighs and n not in new_neighs:
                if "(Antonym)" in n:
                    new_neighs[pure_name] = f"Antonym or opposite concept."
                elif "(Synonym)" in n:
                    new_neighs[pure_name] = f"Similar meaning."
                else:
                    new_neighs[pure_name] = f"Related core dictionary word."
                    
    # Format new_grams and new_neighs
    def format_dict(d):
        items = []
        for k, v in d.items():
            k_escaped = k.replace('"', '\\"')
            v_escaped = v.replace('"', '\\"')
            items.append(f'"{k_escaped}": "{v_escaped}"')
        return "{" + ", ".join(items) + "}"
        
    gram_str = format_dict(new_grams)
    neigh_str = format_dict(new_neighs)
    
    # Replace in full_match
    if neigh_match:
        full_match = full_match.replace(neigh_match.group(0), f'neighborConnections: {neigh_str}')
    else:
        # insert before grammarExamples or at end
        pass
        
    if gram_match:
        full_match = full_match.replace(gram_match.group(0), f'grammarExamples: {gram_str}')
        
    return full_match

pattern = r'\{\s*word:\s*"([^"]+)",\s*partOfSpeech:\s*"([^"]+)",.*?(?=\s*\}\s*,|\s*\}\s*\])'

new_content = re.sub(pattern, replace_word, mastery_content, flags=re.DOTALL)

with open('src/data/initialMasteryMap.ts', 'w') as f:
    f.write(new_content)

print("Updated initialMasteryMap.ts")
