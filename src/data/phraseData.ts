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
  }
];