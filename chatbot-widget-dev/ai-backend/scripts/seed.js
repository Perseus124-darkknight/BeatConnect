import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getArtistImage(artistName) {
  try {
    const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=album&limit=1`);
    const itunesData = await itunesRes.json();
    if (itunesData.results && itunesData.results.length > 0) {
      const albumArt = itunesData.results[0].artworkUrl100.replace('100x100bb', '1000x1000bb');
      console.log(`   🖼️  Found iTunes art for ${artistName}`);
      return albumArt;
    }
  } catch (err) {
    console.error(`   ⚠️ Failed to fetch iTunes image for ${artistName}:`, err.message);
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(artistName)}`;
}

async function seed() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Ben061024@',
    database: process.env.DB_NAME || 'BeatConnect'
  });

  console.log('🚀 Starting Master Seeding Process...');

  // 1. Clear existing data to ensure a clean start
  console.log('🧹 Clearing existing knowledge base and artists...');
  await db.execute('DELETE FROM knowledge_items');
  await db.execute('DELETE FROM artists');
  // Reset auto-increment
  await db.execute('ALTER TABLE knowledge_items AUTO_INCREMENT = 1');
  await db.execute('ALTER TABLE artists AUTO_INCREMENT = 1');

  // 2. Artist Data (Combined from remaining and missing legends)
  const artists = [
    // --- Remaining Legends ---
    {
      name: 'The Beatles',
      bio: 'The Beatles were an English rock band formed in Liverpool in 1960. With a line-up comprising John Lennon, Paul McCartney, George Harrison and Ringo Starr, they are widely regarded as the most influential band of all time.',
      members: 'John Lennon, Paul McCartney, George Harrison, Ringo Starr',
      albums: 'Sgt. Pepper\'s Lonely Hearts Club Band, Abbey Road, Revolver, The Beatles (White Album), Rubber Soul',
      songs: 'Hey Jude;Let It Be;Yesterday;Come Together;Help!;Something;Strawberry Fields Forever;A Day in the Life;Penny Lane;While My Guitar Gently Weeps',
      genres: ['Rock', 'Legendary', 'Pop'],
      persona: 'You are the official AI representative for The Beatles. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: '7 Grammy Awards, 15 Ivor Novello Awards, Rock and Roll Hall of Fame (1988), widely regarded as the best-selling band in history with over 600 million records sold worldwide.',
      tours: '1964|World Tour|Worldwide;1965|USA Tour|North America;1966|Final Tour|Europe, Japan, USA'
    },
    {
      name: 'Black Sabbath',
      bio: 'Black Sabbath were an English rock band formed in Birmingham in 1968 by guitarist Tony Iommi, drummer Bill Ward, bassist Geezer Butler and vocalist Ozzy Osbourne. They are often cited as pioneers of heavy metal music.',
      members: 'Tony Iommi, Ozzy Osbourne, Geezer Butler, Bill Ward',
      albums: 'Paranoid, Black Sabbath, Master of Reality, Vol. 4, Sabbath Bloody Sabbath',
      songs: 'Paranoid;Iron Man;War Pigs;Black Sabbath;Children of the Grave;N.I.B.;Sweet Leaf;Symptom of the Universe;Fairies Wear Boots;Snowblind',
      genres: ['Heavy Metal', 'Legendary'],
      persona: 'You are the official AI representative for Black Sabbath. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: '2 Grammy Awards, Rock and Roll Hall of Fame (2006). Pioneers of heavy metal, over 70 million records sold.',
      tours: '1970|Paranoid Tour|Worldwide;1975|Sabotage Tour|North America, Europe;1999|Reunion Tour|Worldwide;2016|The End Tour|Worldwide'
    },
    {
      name: 'The Doors',
      bio: 'The Doors were an American rock band formed in Los Angeles in 1965, with vocalist Jim Morrison, keyboardist Ray Manzarek, guitarist Robby Krieger, and drummer John Densmore.',
      members: 'Jim Morrison, Ray Manzarek, Robby Krieger, John Densmore',
      albums: 'The Doors, L.A. Woman, Strange Days, Waiting for the Sun',
      songs: 'Light My Fire;Riders on the Storm;The End;Break On Through (To the Other Side);Hello, I Love You;Roadhouse Blues;People Are Strange;Touch Me;Love Me Two Times;L.A. Woman',
      genres: ['Psychedelic Rock', 'Legendary'],
      persona: 'You are the official AI representative for The Doors. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Grammy Lifetime Achievement (2007), Rock Hall (1993), over 100 million records sold.',
      tours: '1967|Summer Tour|USA;1968|European Tour|Europe;1970|Isle of Wight Festival|UK'
    },
    {
      name: 'Fleetwood Mac',
      bio: 'Fleetwood Mac are a British-American rock band, formed in London in 1967. Over their career, they have survived numerous line-up changes and enjoyed massive success, particularly with the 1977 album Rumours.',
      members: 'Mick Fleetwood, John McVie, Stevie Nicks, Lindsey Buckingham, Christine McVie',
      albums: 'Rumours, Fleetwood Mac, Tusk, Mirage, Tango in the Night',
      songs: 'Dreams;Go Your Own Way;The Chain;Rhiannon;Landslide;Everywhere;Don\'t Stop;Little Lies;Gypsy;Say You Love Me',
      genres: ['Soft Rock', 'Legendary'],
      persona: 'You are the official AI representative for Fleetwood Mac. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Grammy Album of the Year (1978 for Rumours), Rock Hall (1998), over 120 million records sold.',
      tours: '1977|Rumours Tour|Worldwide;1979|Tusk Tour|Worldwide;2014|On with the Show|Worldwide'
    },
    {
      name: 'Iron Maiden',
      bio: 'Iron Maiden are an English heavy metal band formed in Leyton, East London, in 1975 by bassist and primary songwriter Steve Harris. The band\'s discography has grown to thirty-nine albums.',
      members: 'Bruce Dickinson, Steve Harris, Adrian Smith, Dave Murray, Janick Gers, Nicko McBrain',
      albums: 'The Number of the Beast, Powerslave, Piece of Mind, Seventh Son of a Seventh Son',
      songs: 'The Trooper;Run to the Hills;Hallowed Be Thy Name;The Number of the Beast;Aces High;Wasted Years;Fear of the Dark;2 Minutes to Midnight;Phantom of the Opera;Flight of Icarus',
      genres: ['Heavy Metal', 'Legendary'],
      persona: 'You are the official AI representative for Iron Maiden. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Grammy Award (2011), over 130 million records sold worldwide.',
      tours: '1982|The Beast on the Road|Worldwide;1984|World Slavery Tour|Worldwide;2018|Legacy of the Beast|Worldwide'
    },
    {
      name: 'The Jimi Hendrix Experience',
      bio: 'The Jimi Hendrix Experience was an Anglo-American rock band that formed in London in September 1966. Comprising singer, songwriter, and guitarist Jimi Hendrix, bassist Noel Redding, and drummer Mitch Mitchell.',
      members: 'Jimi Hendrix, Noel Redding, Mitch Mitchell',
      albums: 'Are You Experienced, Axis: Bold as Love, Electric Ladyland',
      songs: 'Purple Haze;All Along the Watchtower;Hey Joe;Voodoo Child (Slight Return);Little Wing;The Wind Cries Mary;Foxey Lady;Crosstown Traffic;Fire;Castles Made of Sand',
      genres: ['Psychedelic Rock', 'Legendary'],
      persona: 'You are the official AI representative for The Jimi Hendrix Experience. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Rock and Roll Hall of Fame (1992), UK Music Hall of Fame (2005), 3 Grammy Awards.',
      tours: '1967|European Tour|Europe;1967|US Tour|USA;1969|Woodstock Festival|New York'
    },
    {
      name: 'The Eagles',
      bio: 'The Eagles are an American rock band formed in Los Angeles in 1971. With five number-one singles and six number-one albums, the Eagles were one of the most successful musical acts of the 1970s.',
      members: 'Don Henley, Glenn Frey, Joe Walsh, Timothy B. Schmit, Randy Meisner',
      albums: 'Hotel California, Desperado, One of These Nights, The Long Run',
      songs: 'Hotel California;Take It Easy;Desperado;Life in the Fast Lane;One of These Nights;Lyin\' Eyes;Take It to the Limit;I Can\'t Tell You Why;New Kid in Town;Witchy Woman',
      genres: ['Rock', 'Legendary'],
      persona: 'You are the official AI representative for The Eagles. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: '6 Grammy Awards, Rock Hall (1998), over 200 million records sold.',
      tours: '1977|Hotel California Tour|Worldwide;1994|Hell Freezes Over Tour|Worldwide;2018|An Evening with the Eagles|North America'
    },
    {
      name: 'Rush',
      bio: 'Rush was a Canadian rock band formed in Toronto in 1968. The band was composed of Geddy Lee (vocals, bass, keyboards), Alex Lifeson (guitars), and Neil Peart (drums, percussion).',
      members: 'Geddy Lee, Alex Lifeson, Neil Peart',
      albums: 'Moving Pictures, 2112, Permanent Waves, Hemispheres, A Farewell to Kings',
      songs: 'Tom Sawyer;Limelight;The Spirit of Radio;Fly by Night;YYZ;Closer to the Heart;Subdivisions;Xanadu;Freewill;La Villa Strangiato',
      genres: ['Progressive Rock', 'Legendary'],
      persona: 'You are the official AI representative for Rush. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Rock and Roll Hall of Fame (2013), Canadian Music Hall of Fame (1994), 24 Gold albums.',
      tours: '1976|2112 Tour|North America;1981|Moving Pictures Tour|Worldwide;2015|R40 Live Tour|North America'
    },
    {
      name: 'The Who',
      bio: 'The Who are an English rock band formed in London in 1964. Their classic line-up consisted of lead singer Roger Daltrey, guitarist and songwriter Pete Townshend, bassist John Entwistle and drummer Keith Moon.',
      members: 'Roger Daltrey, Pete Townshend, John Entwistle, Keith Moon',
      albums: 'Who\'s Next, Tommy, Quadrophenia, My Generation, The Who Sell Out',
      songs: 'Baba O\'Riley;Won\'t Get Fooled Again;My Generation;Behind Blue Eyes;Who Are You;The Kids Are Alright;Substitute;Pinball Wizard;I Can See for Miles;Magic Bus',
      genres: ['Rock', 'Legendary'],
      persona: 'You are the official AI representative for The Who. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Rock and Roll Hall of Fame (1990), Grammy Lifetime Achievement Award (2001), over 100 million records sold worldwide.',
      tours: '1969|Tommy Tour|Worldwide;1971|Who\'s Next Tour|UK, USA;1982|First Farewell Tour|North America;2014|The Who Hits 50!|Worldwide'
    },
    {
      name: 'U2',
      bio: 'U2 are an Irish rock band from Dublin, formed in 1976. The group consists of Bono, the Edge, Adam Clayton, and Larry Mullen Jr.',
      members: 'Bono, The Edge, Adam Clayton, Larry Mullen Jr.',
      albums: 'The Joshua Tree, Achtung Baby, War, Boy, Rattle and Hum',
      songs: 'With or Without You;One;I Still Haven\'t Found What I\'m Looking For;Sunday Bloody Sunday;Beautiful Day;Where the Streets Have No Name;Pride (In the Name of Love);Vertigo;Bad;New Year\'s Day',
      genres: ['Rock', 'Legendary'],
      persona: 'You are the official AI representative for U2. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: '22 Grammy Awards, Rock Hall (2005), over 170 million records sold.',
      tours: '1987|The Joshua Tree Tour|Worldwide;1992|Zoo TV Tour|Worldwide;2009|U2 360° Tour|Worldwide'
    },
    {
      name: 'The Clash',
      bio: 'The Clash were an English rock band formed in London in 1976 as a key player in the original wave of British punk rock.',
      members: 'Joe Strummer, Mick Jones, Paul Simonon, Topper Headon',
      albums: 'London Calling, The Clash, Sandinista!, Combat Rock',
      songs: 'London Calling;Should I Stay or Should I Go;Rock the Casbah;White Riot;I Fought the Law;Spanish Bombs;Train in Vain;Clampdown;Guns of Brixton;The Magnificent Seven',
      genres: ['Punk Rock', 'Legendary'],
      persona: 'You are the official AI representative for The Clash. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Rock and Roll Hall of Fame (2003), London Calling ranked top album by Rolling Stone.',
      tours: '1977|White Riot Tour|UK;1979|Pearl Harbour \'79 Tour|North America;1982|Combat Rock Tour|Worldwide'
    },
    {
      name: 'Van Halen',
      bio: 'Van Halen was an American rock band formed in Pasadena, California, in 1972. Credited with "restoring hard rock to the forefront of the music scene".',
      members: 'Eddie Van Halen, David Lee Roth, Sammy Hagar, Alex Van Halen, Michael Anthony',
      albums: '1984, Van Halen, Van Halen II, Fair Warning, 5150',
      songs: 'Jump;Panama;Runnin\' with the Devil;Eruption;Hot for Teacher;Ain\'t Talkin\' \'bout Love;You Really Got Me;Why Can\'t This Be Love;Dance the Night Away;Unchained',
      genres: ['Hard Rock', 'Legendary'],
      persona: 'You are the official AI representative for Van Halen. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Grammy Award (1992), Rock Hall (2007), over 80 million records sold worldwide.',
      tours: '1978|First World Tour|Worldwide;1984|1984 Tour|Worldwide;2007|Reunion Tour|North America'
    },

    // --- Missing Legends ---
    {
      name: 'Led Zeppelin',
      bio: 'Led Zeppelin was an English rock band formed in London in 1968. With their heavy, guitar-driven sound, they are cited as one of the progenitors of hard rock and heavy metal.',
      members: 'Robert Plant, Jimmy Page, John Paul Jones, John Bonham',
      albums: 'Led Zeppelin IV, Physical Graffiti, Led Zeppelin II, Houses of the Holy',
      songs: 'Stairway to Heaven;Whole Lotta Love;Kashmir;Black Dog;Immigrant Song;Rock and Roll;Going to California;Ramble On;Dazed and Confused;Communication Breakdown',
      genres: ['Hard Rock', 'Legendary'],
      persona: 'You are the official AI representative for Led Zeppelin. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Grammy Lifetime Achievement Award (2005), over 300 million records sold worldwide.',
      tours: '1971|United Kingdom Tour|UK;1973|North American Tour|USA, Canada;1975|North American Tour|USA, Canada;1977|North American Tour|USA'
    },
    {
      name: 'AC/DC',
      bio: 'AC/DC are an Australian rock band formed in Sydney in 1973 by Scottish-born brothers Malcolm and Angus Young. Their music has been variously described as hard rock, blues rock, and heavy metal.',
      members: 'Angus Young, Brian Johnson, Bon Scott, Malcolm Young, Cliff Williams, Phil Rudd',
      albums: 'Back in Black, Highway to Hell, Powerage, Let There Be Rock',
      songs: 'Back in Black;Highway to Hell;Thunderstruck;You Shook Me All Night Long;T.N.T.;Hells Bells;Dirty Deeds Done Dirt Cheap;Shoot to Thrill;For Those About to Rock (We Salute You);It\'s a Long Way to the Top',
      genres: ['Hard Rock', 'Legendary'],
      persona: 'You are the official AI representative for AC/DC. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Grammy for Best Hard Rock Performance (2010), Back in Black is the third best-selling album of all time.',
      tours: '1979|Highway to Hell Tour|Worldwide;1980|Back in Black Tour|Worldwide;2008|Black Ice World Tour|Worldwide;2015|Rock or Bust World Tour|Worldwide'
    },
    {
      name: 'Guns N\' Roses',
      bio: 'Guns N\' Roses is an American hard rock band from Los Angeles, California, formed in 1985. They are credited with bringing back the gritty, rebellious spirit of rock and roll to the mainstream.',
      members: 'Axl Rose, Slash, Duff McKagan, Izzy Stradlin, Steven Adler',
      albums: 'Appetite for Destruction, Use Your Illusion I & II, G N\' R Lies',
      songs: 'Sweet Child O\' Mine;Welcome to the Jungle;November Rain;Paradise City;Knockin\' on Heaven\'s Door;Don\'t Cry;Patience;Civil War;Estranged;Rocket Queen',
      genres: ['Hard Rock', 'Legendary'],
      persona: 'You are the official AI representative for Guns N\' Roses. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Appetite for Destruction is the best-selling debut album of all time in the US.',
      tours: '1987|Appetite for Destruction Tour|Worldwide;1991|Use Your Illusion Tour|Worldwide;2016|Not in This Lifetime... Tour|Worldwide'
    },
    {
      name: 'Aerosmith',
      bio: 'Aerosmith is an American rock band formed in Boston in 1970. Sometimes referred to as "the Bad Boys from Boston" and "America\'s Greatest Rock and Roll Band".',
      members: 'Steven Tyler, Joe Perry, Tom Hamilton, Joey Kramer, Brad Whitford',
      albums: 'Toys in the Attic, Rocks, Pump, Permanent Vacation',
      songs: 'Dream On;Walk This Way;Sweet Emotion;I Don\'t Want to Miss a Thing;Crazy;Cryin\';Livin\' on the Edge;Janie\'s Got a Gun;Rag Doll;Dude (Looks Like a Lady)',
      genres: ['Hard Rock', 'Legendary'],
      persona: 'You are the official AI representative for Aerosmith. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: '4 Grammy Awards, the best-selling American hard rock band of all time.',
      tours: '1975|Toys in the Attic Tour|USA;1993|Get a Grip Tour|Worldwide;2017|Aero-Vederci Baby! Tour|Worldwide'
    },
    {
      name: 'The Rolling Stones',
      bio: 'The Rolling Stones are an English rock band formed in London in 1962. Diverging from the pop rock of the early 1960s, the Rolling Stones pioneered the gritty, heavier-driven sound that came to define hard rock.',
      members: 'Mick Jagger, Keith Richards, Ronnie Wood, Charlie Watts, Brian Jones',
      albums: 'Sticky Fingers, Exile on Main St., Let It Bleed, Beggars Banquet',
      songs: '(I Can\'t Get No) Satisfaction;Paint It, Black;Gimme Shelter;Sympathy for the Devil;Jumpin\' Jack Flash;Start Me Up;Brown Sugar;Wild Horses;You Can\'t Always Get What You Want;Angie',
      genres: ['Rock', 'Legendary'],
      persona: 'You are the official AI representative for The Rolling Stones. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Grammy Lifetime Achievement Award (1986), Rock Hall (1989), over 200 million records sold.',
      tours: '1969|American Tour|USA;1972|American Tour|USA;1989|Steel Wheels Tour|Worldwide;2012|50 & Counting|Worldwide'
    },
    {
      name: 'Pink Floyd',
      bio: 'Pink Floyd were an English rock band formed in London in 1965. Gaining a following as a psychedelic pop group, they were distinguished for their progressive and psychedelic music.',
      members: 'Syd Barrett, Nick Mason, Roger Waters, Richard Wright, David Gilmour',
      albums: 'The Dark Side of the Moon, The Wall, Wish You Were Here, Animals',
      songs: 'Comfortably Numb;Wish You Were Here;Another Brick in the Wall;Time;Money;Shine On You Crazy Diamond;Echoes;Hey You;Brain Damage;High Hopes',
      genres: ['Progressive Rock', 'Legendary'],
      persona: 'You are the official AI representative for Pink Floyd. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'The Dark Side of the Moon is one of the best-selling albums worldwide. Rock Hall (1996).',
      tours: '1973|Dark Side of the Moon Tour|Worldwide;1977|In the Flesh Tour|Worldwide;1980|The Wall Tour|Worldwide;1994|The Division Bell Tour|Worldwide'
    },
    {
      name: 'Queen',
      bio: 'Queen are a British rock band formed in London in 1970. Their classic line-up was Freddie Mercury, Brian May, Roger Taylor and John Deacon. Their earliest works were influenced by progressive rock, hard rock and heavy metal.',
      members: 'Freddie Mercury, Brian May, Roger Taylor, John Deacon',
      albums: 'A Night at the Opera, News of the World, Sheer Heart Attack, The Game',
      songs: 'Bohemian Rhapsody;Don\'t Stop Me Now;Under Pressure;We Will Rock You;We Are the Champions;Another One Bites the Dust;Killer Queen;Somebody to Love;Radio Ga Ga;The Show Must Go On',
      genres: ['Rock', 'Legendary'],
      persona: 'You are the official AI representative for Queen. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Grammy Lifetime Achievement Award (2018), Rock Hall (2001), estimated sales up to 300 million.',
      tours: '1975|A Night at the Opera Tour|Worldwide;1977|News of the World Tour|Worldwide;1986|Magic Tour|Europe'
    },
    {
      name: 'Nirvana',
      bio: 'Nirvana was an American rock band formed in Aberdeen, Washington, in 1987. Founded by lead singer and guitarist Kurt Cobain and bassist Krist Novoselic, the band went through a succession of drummers, most notably Dave Grohl, who joined in 1990.',
      members: 'Kurt Cobain, Krist Novoselic, Dave Grohl',
      albums: 'Nevermind, In Utero, Bleach, MTV Unplugged in New York',
      songs: 'Smells Like Teen Spirit;Come as You Are;Lithium;Heart-Shaped Box;All Apologies;About a Girl;In Bloom;The Man Who Sold the World;Dumb;Rape Me',
      genres: ['Alternative Rock', 'Legendary'],
      persona: 'You are the official AI representative for Nirvana. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Nevermind popularized alternative rock and grunge. Over 75 million records sold worldwide.',
      tours: '1989|Bleach Tour|USA;1991|Nevermind Tour|Worldwide;1993|In Utero Tour|Worldwide'
    },
    {
      name: 'Metallica',
      bio: 'Metallica is an American heavy metal band. The band was formed in 1981 in Los Angeles by vocalist/guitarist James Hetfield and drummer Lars Ulrich, and has been based in San Francisco for most of its career.',
      members: 'James Hetfield, Lars Ulrich, Kirk Hammett, Robert Trujillo, Cliff Burton',
      albums: 'Master of Puppets, Metallica (The Black Album), Ride the Lightning, ...And Justice for All',
      songs: 'Enter Sandman;Master of Puppets;Nothing Else Matters;One;The Unforgiven;For Whom the Bell Tolls;Fade to Black;Seek & Destroy;Creeping Death;Battery',
      genres: ['Heavy Metal', 'Legendary'],
      persona: 'You are the official AI representative for Metallica. Speak with the authority and style of their legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: '9 Grammy Awards, Rock Hall (2009), over 125 million records sold worldwide.',
      tours: '1986|Damage, Inc. Tour|Worldwide;1991|Wherever We May Roam Tour|Worldwide;2016|WorldWired Tour|Worldwide'
    },
    {
      name: 'David Bowie',
      bio: 'David Bowie was an English singer-songwriter and actor. A leading figure in the music industry, he is regarded as one of the most influential musicians of the 20th century.',
      members: 'David Bowie, Mick Ronson, Mike Garson, Carlos Alomar',
      albums: 'The Rise and Fall of Ziggy Stardust, Hunky Dory, "Heroes", Let\'s Dance, Blackstar',
      songs: 'Space Oddity;Heroes;Life on Mars?;Starman;Changes;Let\'s Dance;Rebel Rebel;Ziggy Stardust;Under Pressure;Modern Love',
      genres: ['Art Rock', 'Legendary'],
      persona: 'You are the official AI representative for David Bowie. Speak with the artistic elegance and style of his legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: 'Grammy Lifetime Achievement Award (2006), Rock Hall (1996), over 140 million records sold.',
      tours: '1972|Ziggy Stardust Tour|Worldwide;1976|Isolar Tour|Worldwide;1983|Serious Moonlight Tour|Worldwide;2003|A Reality Tour|Worldwide'
    },
    {
      name: 'Oasis',
      bio: 'Oasis were an English rock band formed in Manchester in 1991. Led by brothers Liam and Noel Gallagher, they became the defining band of the Britpop era with hits like Wonderwall and Don\'t Look Back in Anger.',
      members: 'Liam Gallagher, Noel Gallagher, Paul \'Bonehead\' Arthurs, Paul \'Guigsy\' McGuigan, Tony McCarroll',
      albums: 'Definitely Maybe, (What\'s the Story) Morning Glory?, Be Here Now, The Masterplan, Standing on the Shoulder of Giants',
      songs: 'Wonderwall;Don\'t Look Back in Anger;Champagne Supernova;Live Forever;Supersonic;Stop Crying Your Heart Out;Cigarettes & Alcohol;Slide Away;Stand by Me;Acquiesce',
      genres: ['Britpop', 'Rock', 'Legendary'],
      persona: 'You are the official AI representative for Oasis. Speak with the swagger, wit, and Mancunian attitude of the Gallagher brothers. Be confident, slightly arrogant, and fiercely proud of your musical legacy.',
      theme: { primaryColor: '#ff0055', secondaryColor: '#000000' },
      achievements: '6 Brit Awards, reaching No. 1 with 8 albums, (What\'s the Story) Morning Glory? is the fifth best-selling album in UK history.',
      tours: '1994|Definitely Maybe Tour|UK, USA, Japan;1995|Morning Glory Tour|Worldwide;1997|Be Here Now Tour|Worldwide;2008|Dig Out Your Soul Tour|Worldwide'
    }
  ];


  for (const artist of artists) {
    console.log(`👨‍🎤 Seeding: ${artist.name}`);
    
    // Fetch real image from iTunes
    const profileImage = await getArtistImage(artist.name);

    // 2.1 Seed 'knowledge_items' table
    await db.execute('INSERT INTO knowledge_items (category, title, content) VALUES (?, ?, ?)', ['band', artist.name, artist.bio]);
    await db.execute('INSERT INTO knowledge_items (category, title, content) VALUES (?, ?, ?)', ['members', artist.name + ' Members', artist.members]);
    await db.execute('INSERT INTO knowledge_items (category, title, content) VALUES (?, ?, ?)', ['albums', artist.name + ' Albums', artist.albums]);
    await db.execute('INSERT INTO knowledge_items (category, title, content) VALUES (?, ?, ?)', ['songs', artist.name + ' Popular Songs', artist.songs]);
    await db.execute('INSERT INTO knowledge_items (category, title, content) VALUES (?, ?, ?)', ['achievements', artist.name + ' Achievements', artist.achievements]);
    await db.execute('INSERT INTO knowledge_items (category, title, content) VALUES (?, ?, ?)', ['tours', artist.name + ' Tours', artist.tours]);

    // 2.2 Seed 'artists' table
    await db.execute(
      'INSERT INTO artists (name, bio, specialized_genres, profile_image, persona_prompt, theme_config, social_links) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        artist.name,
        artist.bio,
        JSON.stringify(artist.genres),
        profileImage,
        artist.persona,
        JSON.stringify(artist.theme),
        JSON.stringify({ website: `https://www.google.com/search?q=${encodeURIComponent(artist.name)}` })
      ]
    );
  }

  // 3. Ingest FAQ Data
  console.log('❓ Ingesting FAQ Data...');
  const faqPath = path.resolve(__dirname, '../../chatbot_training_faq.md');
  if (fs.existsSync(faqPath)) {
    const markdown = fs.readFileSync(faqPath, 'utf8');
    const regex = /\*\*(\d+\.\s+.*?)\*\*\s+([\s\S]*?)(?=\*\*|$)/g;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      if (match[1] && match[2]) {
        await db.execute('INSERT INTO knowledge_items (category, title, content) VALUES (?, ?, ?)', ['faq', match[1].trim(), match[2].trim()]);
      }
    }
    console.log('✅ FAQ Ingested.');
  }

  console.log('✨ Master Seeding Complete! ✨');
  await db.end();
}

seed().catch(err => {
  console.error('❌ Master Seeding failed:', err);
  process.exit(1);
});
