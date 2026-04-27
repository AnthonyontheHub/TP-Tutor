export interface Phrase {
  english: string;
  tokiPona: string;
  literal: string;
}

export interface PhraseCategory {
  title: string;
  contextParagraph: string;
  phrases: Phrase[];
}

export const phraseData: PhraseCategory[] = [
  {
    title: "1. Greetings and Farewells",
    contextParagraph: "The greeting toki! is universal — it works at any time of day and doubles as an attention-getter before speaking. For farewells, the system is elegantly split: the person departing says mi tawa and the person staying responds tawa pona. The “[noun] pona” well-wishing pattern is one of toki pona’s most productive structures.",
    phrases: [
      { english: "Hello / Hi", tokiPona: "toki!", literal: "Language! / Communication!" },
      { english: "Goodbye (said by the one leaving)", tokiPona: "mi tawa", literal: "I go" },
      { english: "Goodbye (said to the one leaving)", tokiPona: "tawa pona", literal: "Good going / Go well" },
      { english: "Good morning / Good day", tokiPona: "tenpo suno pona", literal: "Good sun-time" },
      { english: "Good evening", tokiPona: "pimeja pona", literal: "Good darkness" },
      { english: "Good night / Sleep well", tokiPona: "lape pona", literal: "Good sleep" },
      { english: "Welcome", tokiPona: "kama pona", literal: "Good arriving" },
      { english: "See you later", tokiPona: "mi tawa. tenpo kama la mi kama", literal: "I go. In future-time, I arrive" },
      { english: "How are you?", tokiPona: "sina pilin seme?", literal: "You feel what?" },
      { english: "I’m good (response)", tokiPona: "mi pilin pona", literal: "I feel good" }
    ]
  },
  {
    title: "2. Introductions and Basic Social Phrases",
    contextParagraph: "Proper names in toki pona are treated as modifying adjectives — they are capitalized and adapted to toki pona phonology. The phrase mi kama sona e toki pona uses the preverb kama meaning “to become,” creating the elegant compound “come-to-know.”",
    phrases: [
      { english: "My name is [X]", tokiPona: "nimi mi li [X]", literal: "Name my is [X]" },
      { english: "What is your name?", tokiPona: "nimi sina li seme?", literal: "Name your is what?" },
      { english: "Nice to meet you", tokiPona: "mi pona tan ni: mi sona e sina", literal: "I am good because: I know you" },
      { english: "I am from [place]", tokiPona: "mi tan ma [Place]", literal: "I from land [Place]" },
      { english: "Where are you from?", tokiPona: "sina tan ma seme?", literal: "You from land what?" },
      { english: "Do you speak toki pona?", tokiPona: "sina toki ala toki e toki pona?", literal: "You speak-not-speak toki pona?" },
      { english: "I speak a little toki pona", tokiPona: "mi sona lili e toki pona", literal: "I know a-little toki pona" },
      { english: "I’m learning toki pona", tokiPona: "mi kama sona e toki pona", literal: "I come-to-know toki pona" }
    ]
  },
  {
    title: "3. Polite Expressions",
    contextParagraph: "There is no dedicated word for “please” — instead, the imperative particle o carries inherent politeness, and mi wile e ni functions as a polite request. Gratitude is expressed through the compliment sina pona (you are good). The phrase ale li pona — “everything is good” — is one of toki pona’s beloved proverbs.",
    phrases: [
      { english: "Please / I would like this", tokiPona: "mi wile e ni", literal: "I want/need this" },
      { english: "Thank you", tokiPona: "sina pona", literal: "You are good" },
      { english: "Thanks a lot", tokiPona: "sina pona mute", literal: "You are very good" },
      { english: "You’re welcome / OK", tokiPona: "pona", literal: "Good!" },
      { english: "Sorry / My bad", tokiPona: "mi pakala", literal: "I messed up" },
      { english: "Excuse me / Pardon me", tokiPona: "o weka e ike mi", literal: "Remove my wrongdoing" },
      { english: "No problem / All is well", tokiPona: "ale li pona", literal: "Everything is good" }
    ]
  },
  {
    title: "4. Eating and Drinking",
    contextParagraph: "The word moku is a workhorse — it means food, to eat, and to drink. Context determines which. The modifier sin (new, additional) elegantly handles “more” — moku sin means additional food.",
    phrases: [
      { english: "I’m hungry", tokiPona: "mi wile moku", literal: "I want/need food/eating" },
      { english: "I’m thirsty", tokiPona: "mi wile e telo", literal: "I want water/liquid" },
      { english: "The food is good", tokiPona: "moku li pona", literal: "Food is good" },
      { english: "The food is delicious", tokiPona: "moku li pona mute", literal: "Food is very good" },
      { english: "Let’s eat!", tokiPona: "o moku!", literal: "Eat!" },
      { english: "Do you want to eat?", tokiPona: "sina wile ala wile moku?", literal: "You want-not-want eat?" },
      { english: "I’m full", tokiPona: "mi wile ala moku", literal: "I don’t-want eat" },
      { english: "More water, please", tokiPona: "o pana e telo sin tawa mi", literal: "Give water additional to me" }
    ]
  },
  {
    title: "5. Daily Routines",
    contextParagraph: "Daily routines showcase toki pona’s compositionality. “Going to work” is simply mi tawa pali. “Getting ready” becomes the reflexive mi pali e mi — literally “I am working on myself.”",
    phrases: [
      { english: "I’m going to sleep", tokiPona: "mi lape", literal: "I sleep/rest" },
      { english: "I’m waking up", tokiPona: "mi open", literal: "I begin/start" },
      { english: "I’m going to work", tokiPona: "mi tawa pali", literal: "I go-to work" },
      { english: "I’m going home", tokiPona: "mi tawa tomo mi", literal: "I go-to house my" },
      { english: "I need to go", tokiPona: "mi wile tawa", literal: "I want/need go" },
      { english: "I’m getting ready", tokiPona: "mi pali e mi", literal: "I work-on myself" },
      { english: "It’s mealtime", tokiPona: "tenpo moku li lon", literal: "Eating-time exists" },
      { english: "Have a good day at work", tokiPona: "pali pona!", literal: "Good work!" }
    ]
  },
  {
    title: "6. Emotions and Feelings",
    contextParagraph: "The word pilin (feel, emotion, heart) is the gateway to all emotional expression. Toki pona deliberately collapses many English emotion words: pilin pona covers happy, content, and satisfied, while pilin ike spans sad, upset, and distressed. The word olin stands apart — it specifically denotes deep love and compassion and is not used casually.",
    phrases: [
      { english: "I’m happy", tokiPona: "mi pilin pona", literal: "I feel good" },
      { english: "I’m sad", tokiPona: "mi pilin ike", literal: "I feel bad" },
      { english: "I’m tired", tokiPona: "mi wile lape", literal: "I want/need sleep" },
      { english: "I love you", tokiPona: "mi olin e sina", literal: "I love you" },
      { english: "I’m angry", tokiPona: "mi pilin seli", literal: "I feel heated" },
      { english: "I’m scared", tokiPona: "mi pilin monsuta", literal: "I feel fear/dread" },
      { english: "I’m excited", tokiPona: "mi pilin wawa", literal: "I feel strong/energized" },
      { english: "Don’t worry", tokiPona: "o pilin ike ala", literal: "Don’t feel bad" },
      { english: "I miss you", tokiPona: "sina weka la mi pilin ike", literal: "You being away, I feel bad" }
    ]
  },
  {
    title: "7. Directions and Movement",
    contextParagraph: "One fascinating design choice: toki pona has no words for “left” or “right.” Speakers navigate using contextual landmarks. The phrase mi sona ala e nasin (“I don’t know the path”) is a beautifully literal way to say “I’m lost.”",
    phrases: [
      { english: "Where is [X]?", tokiPona: "[X] li lon seme?", literal: "[X] exists where?" },
      { english: "I’m going to [place]", tokiPona: "mi tawa [place]", literal: "I go-to [place]" },
      { english: "Come here", tokiPona: "o kama", literal: "Come!" },
      { english: "Let’s go", tokiPona: "o tawa", literal: "Go! / Move!" },
      { english: "Go away", tokiPona: "o tawa weka", literal: "Go away" },
      { english: "Where are you going?", tokiPona: "sina tawa seme?", literal: "You go-to what?" },
      { english: "I’m here", tokiPona: "mi lon ni", literal: "I exist here" },
      { english: "It’s far", tokiPona: "ni li weka", literal: "That is far/absent" },
      { english: "It’s near / nearby", tokiPona: "ni li poka", literal: "That is beside/near" },
      { english: "I’m lost", tokiPona: "mi sona ala e nasin", literal: "I don’t-know the path" }
    ]
  },
  {
    title: "8. Shopping and Transactions",
    contextParagraph: "The word esun covers trading, buying, and selling. Toki pona’s number system is intentionally limited (wan = 1, tu = 2, luka = 5, mute = 20, ale = 100), making precise prices difficult to express — a feature, not a bug, reflecting the language’s anti-consumerist philosophy.",
    phrases: [
      { english: "How much does this cost?", tokiPona: "ni li mani seme?", literal: "This is money what?" },
      { english: "I want to buy [X]", tokiPona: "mi wile esun e [X]", literal: "I want trade [X]" },
      { english: "I want this", tokiPona: "mi wile e ni", literal: "I want this" },
      { english: "That’s too expensive", tokiPona: "ni li mani mute a!", literal: "This is much money!" },
      { english: "Do you have [X]?", tokiPona: "sina jo ala jo e [X]?", literal: "You have-not-have [X]?" },
      { english: "I need [X]", tokiPona: "mi wile e [X]", literal: "I want/need [X]" },
      { english: "Give me [X]", tokiPona: "o pana e [X] tawa mi", literal: "Give [X] to me" }
    ]
  },
  {
    title: "9. Weather and Nature",
    contextParagraph: "Weather in toki pona follows a consistent pattern: [noun] li lon — “[thing] exists.” Snow becomes the poetic compound ko lete — “cold powder.” The word mun covers all night-sky objects; speakers disambiguate with size modifiers: mun suli for the Moon, mun lili for stars.",
    phrases: [
      { english: "It’s hot", tokiPona: "seli li lon", literal: "Heat exists" },
      { english: "It’s cold", tokiPona: "lete li lon", literal: "Cold exists" },
      { english: "It’s raining", tokiPona: "telo sewi li lon", literal: "Sky-water exists" },
      { english: "It’s sunny", tokiPona: "suno li lon", literal: "Sun exists" },
      { english: "It’s windy", tokiPona: "kon li wawa", literal: "Air/wind is strong" },
    ]
  },
  {
    title: "10. Questions and Responses",
    contextParagraph: "Perhaps the most distinctive feature of toki pona’s question system: there is no single word for “yes.” Like Chinese, Irish, and Welsh, toki pona answers yes/no questions by repeating the verb for affirmation or adding ala for negation. For general agreement, lon (true, exists) serves as a standalone affirmative.",
    phrases: [
      { english: "What is this?", tokiPona: "ni li seme?", literal: "This is what?" },
      { english: "Yes", tokiPona: "(repeat the verb) or lon", literal: "(affirm) or True/exists" },
      { english: "No", tokiPona: "ala or (verb + ala)", literal: "No / not" },
      { english: "I don’t know", tokiPona: "mi sona ala", literal: "I know not" },
      { english: "I understand", tokiPona: "mi sona", literal: "I know" },
      { english: "Why?", tokiPona: "tan seme?", literal: "Because-of what?" },
      { english: "Who?", tokiPona: "jan seme?", literal: "Person what?" },
      { english: "Can you help me?", tokiPona: "sina ken ala ken pona e mi?", literal: "You can-not-can help me?" },
      { english: "What do you want?", tokiPona: "sina wile e seme?", literal: "You want what?" },
      { english: "Really? / Is that true?", tokiPona: "lon ala lon?", literal: "True-not-true?" }
    ]
  },
  {
    title: "11. Time Expressions",
    contextParagraph: "Toki pona has no grammatical tense. Time is expressed exclusively through context phrases built on tenpo (time) placed before the particle la. The system uses: ni (this) for the present, kama (coming) for the future, and pini (finished/past) for the past.",
    phrases: [
      { english: "Today", tokiPona: "tenpo suno ni", literal: "This sun-time" },
      { english: "Tomorrow", tokiPona: "tenpo suno kama", literal: "Coming sun-time" },
      { english: "Yesterday", tokiPona: "tenpo suno pini", literal: "Past/finished sun-time" },
      { english: "Now", tokiPona: "tenpo ni", literal: "This time" },
      { english: "Later / In the future", tokiPona: "tenpo kama", literal: "Coming time" },
      { english: "Morning / Daytime", tokiPona: "tenpo suno", literal: "Sun-time" },
      { english: "Evening / Night", tokiPona: "tenpo pimeja", literal: "Dark-time" },
      { english: "Soon", tokiPona: "tenpo lili la", literal: "In small-time, ..." },
      { english: "A long time ago", tokiPona: "tenpo suli pini la", literal: "In big-past-time, ..." },
      { english: "Always", tokiPona: "tenpo ale la", literal: "In all-time, ..." },
      { english: "Never", tokiPona: "tenpo ala la", literal: "In no-time, ..." }
    ]
  },
  {
    title: "12. Home and Family",
    contextParagraph: "Family vocabulary reveals toki pona’s compositionality at its best. The word mama alone is gender-neutral “parent” — add meli (female) or mije (male) to specify. The word jan pona — literally “good person” — is universally understood as “friend,” making friendship a matter of definition.",
    phrases: [
      { english: "Mother", tokiPona: "mama meli", literal: "Female parent" },
      { english: "Father", tokiPona: "mama mije", literal: "Male parent" },
      { english: "Parent (gender-neutral)", tokiPona: "mama", literal: "Parent" },
      { english: "Child / Children", tokiPona: "jan lili", literal: "Small person(s)" },
      { english: "Friend", tokiPona: "jan pona", literal: "Good person" },
      { english: "My house / home", tokiPona: "tomo mi", literal: "House my" },
      { english: "Family", tokiPona: "kulupu mama", literal: "Parent-group" },
      { english: "Brother", tokiPona: "mije sama", literal: "Male sibling/same" },
      { english: "Sister", tokiPona: "meli sama", literal: "Female sibling/same" },
      { english: "Sibling (gender-neutral)", tokiPona: "jan sama", literal: "Same person" },
      { english: "Partner / Significant other", tokiPona: "jan olin", literal: "Love-person" },
      { english: "Come to my house", tokiPona: "o kama tawa tomo mi", literal: "Come to house my" }
    ]
  },
  {
    title: "13. Health and Body",
    contextParagraph: "Body parts in toki pona are few but sufficient: lawa (head/mind), sijelo (body/torso), luka (hand/arm), noka (foot/leg), oko (eye), kute (ear), uta (mouth), nena (nose), insa (stomach/inside), monsi (back/behind), selo (skin), and linja (hair). The word misikeke (medicine) was added in the 2021 dictionary after strong community demand.",
    phrases: [
      { english: "I’m sick / I feel unwell", tokiPona: "mi pilin ike", literal: "I feel bad" },
      { english: "My body is unwell", tokiPona: "sijelo mi li ike", literal: "Body my is bad" },
      { english: "I need help", tokiPona: "o pona e mi", literal: "Fix/help me" },
      { english: "My head hurts", tokiPona: "lawa mi li pilin ike", literal: "Head my feels bad" },
      { english: "I need medicine", tokiPona: "mi wile e misikeke", literal: "I want medicine" },
      { english: "I feel better", tokiPona: "mi kama pilin pona", literal: "I become feel-good" },
      { english: "Are you okay?", tokiPona: "sina pona ala pona?", literal: "You good-not-good?" },
      { english: "I’m fine / I’m okay", tokiPona: "mi pona", literal: "I am good" }
    ]
  },
  {
    title: "14. Work and Activities",
    contextParagraph: "The preverb kama creates one of toki pona’s most-used compounds: kama sona — “come to know” — the standard way to say “learn.” Reading is literally “looking at a document” (lukin e lipu), and writing is sitelen (which also means drawing — the language does not distinguish the two).",
    phrases: [
      { english: "I’m working", tokiPona: "mi pali", literal: "I work/do" },
      { english: "I’m learning / studying", tokiPona: "mi kama sona", literal: "I come-to-know" },
      { english: "Let’s play / have fun", tokiPona: "o musi", literal: "Play! / Be fun!" },
      { english: "I’m reading", tokiPona: "mi lukin e lipu", literal: "I look-at document" },
      { english: "I’m writing", tokiPona: "mi sitelen", literal: "I write/draw" },
      { english: "I’m making something", tokiPona: "mi pali e ijo", literal: "I make thing" },
      { english: "I’m busy", tokiPona: "mi pali mute", literal: "I work much" },
      { english: "I finished / I’m done", tokiPona: "mi pini", literal: "I finish" },
      { english: "Let’s start / begin", tokiPona: "o open", literal: "Start! / Open!" },
      { english: "I’m resting", tokiPona: "mi lape", literal: "I rest/sleep" }
    ]
  },
  {
    title: "15. Compliments and Descriptions",
    contextParagraph: "The fact that suli means both “big” and “important” reflects toki pona’s philosophical stance that significance and scale are intertwined. Similarly, pona lukin (“good to look at”) serves for “beautiful,” “pretty,” “handsome,” and “attractive” without distinction.",
    phrases: [
      { english: "You are good / great", tokiPona: "sina pona / sina pona mute", literal: "You are good / You are very good" },
      { english: "This is beautiful", tokiPona: "ni li pona lukin", literal: "This is good visually" },
      { english: "That is big", tokiPona: "ni li suli", literal: "That is big/important" },
      { english: "That is small", tokiPona: "ni li lili", literal: "That is small/little" },
      { english: "You are smart / wise", tokiPona: "sina sona mute", literal: "You know much" },
      { english: "This is fun", tokiPona: "ni li musi", literal: "This is fun/entertaining" },
      { english: "You are strong", tokiPona: "sina wawa", literal: "You are strong/powerful" },
      { english: "Well done / Good job", tokiPona: "pali pona!", literal: "Good work!" },
      { english: "You are kind", tokiPona: "sina pona tawa jan", literal: "You are good toward people" },
      { english: "This is important", tokiPona: "ni li suli", literal: "This is big/important" }
    ]
  }
];